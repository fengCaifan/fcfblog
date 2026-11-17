"use client";

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import type { PostSummary } from '../lib/posts';

interface AskNotesModalProps {
  posts: PostSummary[];
  onClose: () => void;
}

const PRESET_QUESTIONS = [
  'iOS 线上 FOOM 内存暴涨怎么归因和排查？',
  'RunLoop 监控卡顿的原理是什么？',
  'SwiftUI 和 Combine 响应式状态管理怎么做？',
  '大模型 RAG 检索增强生成的索引和查询流程？',
  'Go 语言并发编程与 Module 工程管理怎么用？',
];

export default function AskNotesModal({ posts, onClose }: AskNotesModalProps) {
  const [question, setQuestion] = useState<string>('');

  const matchedPosts = useMemo(() => {
    const q = question.trim().toLowerCase();
    if (!q) return [];

    // 提取关键词进行多维加权检索
    const tokens = q
      .replace(/[？?！!，,。、：:\s]+/g, ' ')
      .split(' ')
      .filter((t) => t.length >= 1);

    // 针对中文长句补充 2-gram 子串检索
    const grams: string[] = [];
    const cleanChinese = q.replace(/[^a-z0-9\u4e00-\u9fa5]/g, '');
    for (let i = 0; i < cleanChinese.length - 1; i++) {
      const bi = cleanChinese.slice(i, i + 2);
      if (!/^(怎么|如何|什么|哪些|为什么|的|了|是|和|与)$/.test(bi)) {
        grams.push(bi);
      }
    }

    const scored = posts
      .map((post) => {
        let score = 0;
        const t = post.title.toLowerCase();
        const d = post.description.toLowerCase();
        const c = post.category.toLowerCase();
        const tagStr = post.tags.join(' ').toLowerCase();

        for (const tok of tokens) {
          if (t.includes(tok)) score += 12;
          if (tagStr.includes(tok)) score += 8;
          if (c.includes(tok)) score += 5;
          if (d.includes(tok)) score += 4;
        }
        for (const g of grams) {
          if (t.includes(g)) score += 5;
          if (tagStr.includes(g)) score += 3;
          if (d.includes(g)) score += 2;
        }
        return { post, score };
      })
      .filter((item) => item.score > 4)
      .sort((a, b) => b.score - a.score);

    return scored.slice(0, 5).map((s) => s.post);
  }, [question, posts]);

  return (
    <div className="ask-modal-backdrop" onClick={onClose}>
      <div className="ask-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="ask-modal-header">
          <div>
            <h3 className="ask-modal-title">向 FCF&apos;s Notes 笔记库提问</h3>
            <p className="ask-modal-subtitle">
              基于博客内 {posts.length} 篇真实技术笔记进行语义与关键词检索解答
            </p>
          </div>
          <button type="button" className="ask-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="ask-input-wrap">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="输入你想查找的技术问题，例如：FOOM 怎么归因？RAG 怎么降低幻觉？"
            className="ask-main-input"
            autoFocus
          />
          {question && (
            <button
              type="button"
              className="ask-clear-btn"
              onClick={() => setQuestion('')}
            >
              清空
            </button>
          )}
        </div>

        {!question.trim() ? (
          <div className="ask-presets">
            <span className="ask-presets-label">常见问题示例：</span>
            <div className="ask-presets-list">
              {PRESET_QUESTIONS.map((pq) => (
                <button
                  key={pq}
                  type="button"
                  className="ask-preset-chip"
                  onClick={() => setQuestion(pq)}
                >
                  {pq}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="ask-results">
            {matchedPosts.length === 0 ? (
              <p className="ask-empty">
                笔记库中暂未检索到直接匹配的条目，试试换个技术关键词（如 RunLoop、SwiftUI、Go、Vue3、RAG）。
              </p>
            ) : (
              <>
                <div className="ask-answer-summary">
                  <div className="ask-summary-badge">笔记库检索摘要</div>
                  <p className="ask-summary-text">
                    在你的笔记库中找到 <strong>{matchedPosts.length}</strong> 篇高度相关的技术笔记。其中最核心的参考是
                    《<strong>{matchedPosts[0].title}</strong>》（分类：{matchedPosts[0].category}）：
                    {matchedPosts[0].description || '点击下方链接可直接查看完整源码分析与实现步骤。'}
                  </p>
                </div>

                <ul className="ask-match-list">
                  {matchedPosts.map((p, idx) => (
                    <li key={p.slug} className="ask-match-item">
                      <div className="ask-match-top">
                        <span className="ask-match-rank">#{idx + 1}</span>
                        <Link
                          href={`/posts/${p.slug}`}
                          className="ask-match-title"
                          onClick={onClose}
                        >
                          {p.title}
                        </Link>
                        <span className="ask-match-cat">{p.category}</span>
                      </div>
                      {p.description && (
                        <p className="ask-match-desc">{p.description}...</p>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
