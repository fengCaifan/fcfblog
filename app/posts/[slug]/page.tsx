import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { getAllPosts, getPostBySlug } from '../../../src/lib/posts';

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

function remarkGfmTables() {
  return (tree: any) => {
    if (!tree || !Array.isArray(tree.children)) return;

    const newChildren: any[] = [];
    for (const node of tree.children) {
      if (
        node.type === 'paragraph' &&
        Array.isArray(node.children) &&
        node.children.length > 0
      ) {
        const rawText = node.children
          .map((c: any) => {
            if (c.type === 'text') return c.value;
            if (c.type === 'inlineCode') return `\`${c.value}\``;
            if (c.type === 'strong' && c.children?.[0]?.value)
              return `**${c.children[0].value}**`;
            return c.value || '';
          })
          .join('');

        const lines = rawText
          .split('\n')
          .map((l: string) => l.trim())
          .filter(Boolean);

        if (
          lines.length >= 2 &&
          lines[0].startsWith('|') &&
          lines[1].startsWith('|') &&
          /^\|[\s:|-]+\|$/.test(lines[1])
        ) {
          const parseRow = (line: string): string[] =>
            line
              .replace(/^\|/, '')
              .replace(/\|$/, '')
              .split('|')
              .map((cell: string) => cell.trim().replace(/^\*\*(.*)\*\*$/, '$1'));

          const headers: string[] = parseRow(lines[0]);
          const bodyRows: string[][] = lines.slice(2).map(parseRow);

          newChildren.push({
            type: 'customTable',
            data: { hName: 'div', hProperties: { className: 'table-scroll' } },
            children: [
              {
                type: 'customTableEl',
                data: { hName: 'table', hProperties: { className: 'md-table' } },
                children: [
                  {
                    type: 'customThead',
                    data: { hName: 'thead' },
                    children: [
                      {
                        type: 'customTr',
                        data: { hName: 'tr' },
                        children: headers.map((h: string) => ({
                          type: 'customTh',
                          data: { hName: 'th' },
                          children: [{ type: 'text', value: h }],
                        })),
                      },
                    ],
                  },
                  {
                    type: 'customTbody',
                    data: { hName: 'tbody' },
                    children: bodyRows.map((row: string[]) => ({
                      type: 'customTr',
                      data: { hName: 'tr' },
                      children: row.map((cell: string) => ({
                        type: 'customTd',
                        data: { hName: 'td' },
                        children: [{ type: 'text', value: cell }],
                      })),
                    })),
                  },
                ],
              },
            ],
          });
          continue;
        }
      }
      newChildren.push(node);
    }
    tree.children = newChildren;
  };
}

function extractHeadings(markdown: string) {
  const headings: { level: number; text: string; id: string }[] = [];
  const inCodeBlockRegex = /```[\s\S]*?```/g;
  const cleaned = markdown.replace(inCodeBlockRegex, '');
  const lines = cleaned.split('\n');

  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/[*`~]/g, '').trim();
      const id = text
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\u4e00-\u9fa5-]/g, '');
      headings.push({ level, text, id });
    }
  }
  return headings;
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const allPosts = getAllPosts();
  const currentIndex = allPosts.findIndex((p) => p.slug === post.slug);
  const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const headings = extractHeadings(post.content);

  return (
    <div className="blog-shell">
      <header className="masthead">
        <div className="masthead-inner">
          <Link href="/" className="brand-title">
            Caifan&apos;s Notes
          </Link>
          <nav className="top-nav">
            <Link href="/" className="nav-link">
              ← 返回列表
            </Link>
          </nav>
        </div>
      </header>

      <div className="article-page-wrap">
        <article className="article-main">
          <header className="article-header">
            <h1 className="article-title">{post.title}</h1>
            <div className="article-meta">
              <time>{post.date}</time>
              <span className="meta-sep">·</span>
              <span>{post.category}</span>
              {post.tags.length > 0 && (
                <>
                  <span className="meta-sep">·</span>
                  <span className="article-tags">{post.tags.join(' / ')}</span>
                </>
              )}
            </div>
          </header>

          <div className="markdown-body">
            <ReactMarkdown
              remarkPlugins={[remarkGfmTables]}
              components={{
                h2: ({ children }) => {
                  const text = String(children);
                  const id = text
                    .toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^\w\u4e00-\u9fa5-]/g, '');
                  return <h2 id={id}>{children}</h2>;
                },
                h3: ({ children }) => {
                  const text = String(children);
                  const id = text
                    .toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^\w\u4e00-\u9fa5-]/g, '');
                  return <h3 id={id}>{children}</h3>;
                },
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          <footer className="article-pager">
            <div className="pager-item">
              {prevPost && (
                <Link href={`/posts/${prevPost.slug}`}>
                  <span className="pager-hint">上一篇</span>
                  <span className="pager-title">{prevPost.title}</span>
                </Link>
              )}
            </div>
            <div className="pager-item right">
              {nextPost && (
                <Link href={`/posts/${nextPost.slug}`}>
                  <span className="pager-hint">下一篇</span>
                  <span className="pager-title">{nextPost.title}</span>
                </Link>
              )}
            </div>
          </footer>
        </article>

        {headings.length > 2 && (
          <aside className="article-toc">
            <div className="toc-sticky">
              <div className="toc-heading">本文目录</div>
              <ul className="toc-list">
                {headings.map((h, idx) => (
                  <li key={`${h.id}-${idx}`} className={`toc-level-${h.level}`}>
                    <a href={`#${h.id}`}>{h.text}</a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        )}
      </div>

      <footer className="site-footer">
        <span>© 2022–2026 FengCaifan</span>
      </footer>
    </div>
  );
}
