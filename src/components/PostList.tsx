"use client";

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PostSummary } from '../lib/posts';
import { KnowledgeGraphData, KnowledgeNode } from '../lib/knowledge-graph';
import KnowledgeGraph from './KnowledgeGraph';

interface PostListProps {
  posts: PostSummary[];
  graphData: KnowledgeGraphData;
}

type GroupMode = 'time' | 'category' | 'tag';
type SortOrder = 'date-desc' | 'date-asc' | 'title-asc';

const CATEGORY_ORDER = [
  'iOS 底层与原理',
  'UIKit 与系统框架',
  '性能优化与排查',
  '工程化与架构',
  'Flutter 跨端',
  '数据结构与算法',
  '计算机基础与网络',
  'AI 与大模型',
];

function sortPostList(list: PostSummary[], sortOrder: SortOrder): PostSummary[] {
  return [...list].sort((a, b) => {
    if (sortOrder === 'date-desc') {
      return a.date < b.date ? 1 : -1;
    }
    if (sortOrder === 'date-asc') {
      return a.date > b.date ? 1 : -1;
    }
    return a.title.localeCompare(b.title, 'zh-Hans-CN', { numeric: true });
  });
}

export default function PostList({ posts, graphData }: PostListProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'posts' | 'graph'>('posts');
  const [groupMode, setGroupMode] = useState<GroupMode>('time');
  const [sortOrder, setSortOrder] = useState<SortOrder>('date-desc');

  const categories = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of posts) {
      map.set(p.category, (map.get(p.category) || 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => {
      const idxA = CATEGORY_ORDER.indexOf(a[0]);
      const idxB = CATEGORY_ORDER.indexOf(b[0]);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return b[1] - a[1];
    });
  }, [posts]);

  const allTags = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of posts) {
      if (selectedCategory !== '全部' && p.category !== selectedCategory) continue;
      for (const t of p.tags) {
        map.set(t, (map.get(t) || 0) + 1);
      }
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [posts, selectedCategory]);

  const filteredPosts = useMemo(() => {
    const filtered = posts.filter((post) => {
      if (selectedCategory !== '全部' && post.category !== selectedCategory) {
        return false;
      }
      if (selectedTag && !post.tags.includes(selectedTag)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = post.title.toLowerCase().includes(q);
        const matchDesc = post.description.toLowerCase().includes(q);
        const matchCat = post.category.toLowerCase().includes(q);
        const matchTag = post.tags.some((t) => t.toLowerCase().includes(q));
        return matchTitle || matchDesc || matchCat || matchTag;
      }
      return true;
    });
    return sortPostList(filtered, sortOrder);
  }, [posts, selectedCategory, selectedTag, searchQuery, sortOrder]);

  // Group filtered posts by year
  const postsByYear = useMemo(() => {
    const groups = new Map<string, PostSummary[]>();
    for (const post of filteredPosts) {
      const year = post.date.slice(0, 4);
      const list = groups.get(year) || [];
      list.push(post);
      groups.set(year, list);
    }
    return Array.from(groups.entries()).sort((a, b) => {
      if (sortOrder === 'date-asc') {
        return a[0] > b[0] ? 1 : -1;
      }
      return a[0] < b[0] ? 1 : -1;
    });
  }, [filteredPosts, sortOrder]);

  // Group filtered posts by category
  const postsByCategory = useMemo(() => {
    const groups = new Map<string, PostSummary[]>();
    for (const post of filteredPosts) {
      const list = groups.get(post.category) || [];
      list.push(post);
      groups.set(post.category, list);
    }
    return Array.from(groups.entries()).sort((a, b) => {
      const idxA = CATEGORY_ORDER.indexOf(a[0]);
      const idxB = CATEGORY_ORDER.indexOf(b[0]);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return b[1].length - a[1].length;
    });
  }, [filteredPosts]);

  // Group filtered posts by primary/all tags
  const postsByTag = useMemo(() => {
    const groups = new Map<string, PostSummary[]>();
    for (const post of filteredPosts) {
      const tags = post.tags.length > 0 ? post.tags : ['其他'];
      for (const tag of tags) {
        if (selectedTag && tag !== selectedTag) continue;
        const list = groups.get(tag) || [];
        list.push(post);
        groups.set(tag, list);
      }
    }
    return Array.from(groups.entries()).sort((a, b) => {
      if (b[1].length !== a[1].length) return b[1].length - a[1].length;
      return a[0].localeCompare(b[0], 'zh-Hans-CN');
    });
  }, [filteredPosts, selectedTag]);

  const handleGraphNodeClick = (node: KnowledgeNode) => {
    if (node.type === 'article' && node.slug) {
      router.push(`/posts/${node.slug}`);
    } else if (node.type === 'category' && node.category) {
      setSelectedCategory(node.category);
      setSelectedTag('');
      setActiveTab('posts');
    } else if (node.type === 'tag') {
      setSelectedTag(node.label);
      setSelectedCategory('全部');
      setActiveTab('posts');
    }
  };

  return (
    <div className="blog-shell">
      <header className="masthead">
        <div className="masthead-inner">
          <div>
            <Link href="/" className="brand-title">
              FCF&apos;s Notes
            </Link>
            <p className="brand-desc">日常开发、底层原理与读书笔记</p>
          </div>

          <nav className="top-nav">
            <button
              type="button"
              className={`nav-link ${activeTab === 'posts' ? 'active' : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              文章 ({posts.length})
            </button>
            <button
              type="button"
              className={`nav-link ${activeTab === 'graph' ? 'active' : ''}`}
              onClick={() => setActiveTab('graph')}
            >
              关系图谱
            </button>
            <a
              href="https://github.com/fengCaifan"
              target="_blank"
              rel="noreferrer"
              className="nav-link"
            >
              GitHub
            </a>
          </nav>
        </div>
      </header>

      <main className="main-column">
        {activeTab === 'graph' ? (
          <section className="graph-section">
            <p className="section-note">
              按分类与标签串联的笔记索引，点击节点可查看对应分类或进入文章。
            </p>
            <KnowledgeGraph
              data={graphData}
              width={780}
              height={480}
              onNodeClick={handleGraphNodeClick}
            />
          </section>
        ) : (
          <>
            <section className="toolbar">
              <div className="category-bar">
                <button
                  type="button"
                  className={`cat-item ${selectedCategory === '全部' ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedCategory('全部');
                    setSelectedTag('');
                  }}
                >
                  全部 <span className="cat-count">{posts.length}</span>
                </button>
                {categories.map(([cat, count]) => (
                  <button
                    key={cat}
                    type="button"
                    className={`cat-item ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setSelectedTag('');
                    }}
                  >
                    {cat} <span className="cat-count">{count}</span>
                  </button>
                ))}
              </div>

              <div className="toolbar-controls">
                <div className="sort-group">
                  <span className="control-label">归档：</span>
                  <button
                    type="button"
                    className={`control-btn ${groupMode === 'time' ? 'active' : ''}`}
                    onClick={() => setGroupMode('time')}
                  >
                    按时间
                  </button>
                  <span className="control-sep">/</span>
                  <button
                    type="button"
                    className={`control-btn ${groupMode === 'category' ? 'active' : ''}`}
                    onClick={() => setGroupMode('category')}
                  >
                    按分类
                  </button>
                  <span className="control-sep">/</span>
                  <button
                    type="button"
                    className={`control-btn ${groupMode === 'tag' ? 'active' : ''}`}
                    onClick={() => setGroupMode('tag')}
                  >
                    按标签
                  </button>
                </div>

                <div className="sort-group">
                  <span className="control-label">排序：</span>
                  <button
                    type="button"
                    className={`control-btn ${sortOrder === 'date-desc' ? 'active' : ''}`}
                    onClick={() => setSortOrder('date-desc')}
                  >
                    最新
                  </button>
                  <span className="control-sep">/</span>
                  <button
                    type="button"
                    className={`control-btn ${sortOrder === 'date-asc' ? 'active' : ''}`}
                    onClick={() => setSortOrder('date-asc')}
                  >
                    最早
                  </button>
                  <span className="control-sep">/</span>
                  <button
                    type="button"
                    className={`control-btn ${sortOrder === 'title-asc' ? 'active' : ''}`}
                    onClick={() => setSortOrder('title-asc')}
                  >
                    标题
                  </button>
                </div>

                <div className="search-box">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索笔记..."
                    className="search-input"
                  />
                  {selectedTag && (
                    <button
                      type="button"
                      className="tag-clear"
                      onClick={() => setSelectedTag('')}
                    >
                      标签: {selectedTag} ×
                    </button>
                  )}
                </div>
              </div>
            </section>

            {groupMode === 'tag' && !selectedTag && allTags.length > 0 && (
              <section className="tag-index-bar">
                {allTags.map(([tag, count]) => (
                  <button
                    key={tag}
                    type="button"
                    className="tag-chip"
                    onClick={() => setSelectedTag(tag)}
                  >
                    #{tag} <span className="cat-count">{count}</span>
                  </button>
                ))}
              </section>
            )}

            <section className="archive-timeline">
              {groupMode === 'time' &&
                postsByYear.map(([year, yearPosts]) => (
                  <div key={year} className="year-group">
                    <div className="group-header">
                      <h2 className="year-heading">{year}</h2>
                      <span className="group-count">{yearPosts.length} 篇</span>
                    </div>
                    <ul className="year-post-list">
                      {yearPosts.map((post) => (
                        <li key={post.slug} className="post-row">
                          <div className="post-row-main">
                            <time className="post-row-date">
                              {post.date.slice(5)}
                            </time>
                            <Link
                              href={`/posts/${post.slug}`}
                              className="post-row-title"
                            >
                              {post.title}
                            </Link>
                          </div>
                          <span
                            className="post-row-cat"
                            onClick={() => setSelectedCategory(post.category)}
                          >
                            {post.category}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

              {groupMode === 'category' &&
                postsByCategory.map(([cat, catPosts]) => (
                  <div key={cat} className="year-group">
                    <div className="group-header">
                      <h2 className="category-heading">{cat}</h2>
                      <span className="group-count">{catPosts.length} 篇</span>
                    </div>
                    <ul className="year-post-list">
                      {catPosts.map((post) => (
                        <li key={post.slug} className="post-row">
                          <div className="post-row-main">
                            <time className="post-row-date">{post.date}</time>
                            <Link
                              href={`/posts/${post.slug}`}
                              className="post-row-title"
                            >
                              {post.title}
                            </Link>
                          </div>
                          <div className="post-row-tags">
                            {post.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="post-row-tag"
                                onClick={() => setSelectedTag(tag)}
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

              {groupMode === 'tag' &&
                postsByTag.map(([tag, tagPosts]) => (
                  <div key={tag} className="year-group">
                    <div className="group-header">
                      <h2 className="category-heading">#{tag}</h2>
                      <span className="group-count">{tagPosts.length} 篇</span>
                    </div>
                    <ul className="year-post-list">
                      {tagPosts.map((post) => (
                        <li key={`${tag}-${post.slug}`} className="post-row">
                          <div className="post-row-main">
                            <time className="post-row-date">{post.date}</time>
                            <Link
                              href={`/posts/${post.slug}`}
                              className="post-row-title"
                            >
                              {post.title}
                            </Link>
                          </div>
                          <span
                            className="post-row-cat"
                            onClick={() => setSelectedCategory(post.category)}
                          >
                            {post.category}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

              {filteredPosts.length === 0 && (
                <p className="empty-text">未找到相关笔记。</p>
              )}
            </section>
          </>
        )}
      </main>

      <footer className="site-footer">
        <span>© 2022–2026 FengCaifan</span>
        <span>·</span>
        <a
          href="https://github.com/fengCaifan"
          target="_blank"
          rel="noreferrer"
        >
          github.com/fengCaifan
        </a>
      </footer>
    </div>
  );
}
