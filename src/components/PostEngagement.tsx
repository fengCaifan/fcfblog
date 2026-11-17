"use client";

import React, { useEffect, useState } from 'react';

interface PostEngagementProps {
  slug: string;
  title: string;
  category: string;
  baseViews: number;
}

interface LocalCommentItem {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export default function PostEngagement({
  slug,
  title,
  category,
  baseViews,
}: PostEngagementProps) {
  const baseLikes = Math.min(5, Math.floor(baseViews / 11));
  const [likes, setLikes] = useState<number>(baseLikes);
  const [liked, setLiked] = useState<boolean>(false);

  const [author, setAuthor] = useState<string>('');
  const [questionText, setQuestionText] = useState<string>('');
  const [comments, setComments] = useState<LocalCommentItem[]>([]);
  const [submittedTip, setSubmittedTip] = useState<string>('');

  const likeStorageKey = `fcfblog_liked_${slug}`;
  const commentStorageKey = `fcfblog_comments_${slug}`;

  useEffect(() => {
    try {
      const isLiked = window.localStorage.getItem(likeStorageKey) === '1';
      setLiked(isLiked);
      setLikes(baseLikes + (isLiked ? 1 : 0));

      const savedComments = window.localStorage.getItem(commentStorageKey);
      if (savedComments) {
        setComments(JSON.parse(savedComments));
      } else {
        setComments([]);
      }
    } catch {
      // ignore
    }
  }, [slug, baseLikes, likeStorageKey, commentStorageKey]);

  const handleToggleLike = () => {
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikes(baseLikes + (nextLiked ? 1 : 0));
    try {
      if (nextLiked) {
        window.localStorage.setItem(likeStorageKey, '1');
      } else {
        window.localStorage.removeItem(likeStorageKey);
      }
    } catch {
      // ignore
    }
  };

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = questionText.trim();
    if (!trimmed) return;

    const newComment: LocalCommentItem = {
      id: `${Date.now()}`,
      author: author.trim() || '匿名读者',
      content: trimmed,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    const nextList = [newComment, ...comments];
    setComments(nextList);
    setQuestionText('');
    setSubmittedTip('提问已记录！如需收到邮件提醒，也可点击右侧按钮同步到 GitHub Issues。');
    try {
      window.localStorage.setItem(commentStorageKey, JSON.stringify(nextList));
    } catch {
      // ignore
    }
  };

  const githubIssueUrl = `https://github.com/fengCaifan/fcfblog/issues/new?title=${encodeURIComponent(
    `[文章提问] 《${title}》`
  )}&body=${encodeURIComponent(
    `> 关联文章：《${title}》（分类：${category}）\n> 文章路径：https://fengcaifan.github.io/fcfblog/posts/${slug}/\n\n### 我的问题或想法：\n${
      questionText.trim() || '请在此填写你的问题...'
    }\n`
  )}`;

  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const adsenseSlotId = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID;

  return (
    <section className="post-engagement">
      {/* 1. 点赞互动与分享栏 */}
      <div className="engagement-bar">
        <div className="engagement-left">
          <button
            type="button"
            onClick={handleToggleLike}
            className={`like-btn ${liked ? 'liked' : ''}`}
          >
            <span>{liked ? '★ 已赞' : '☆ 觉得有帮助'}</span>
            <span className="like-count">{likes}</span>
          </button>
          <span className="engagement-hint">
            如果这篇笔记帮你解决了问题，欢迎点个赞或留下问题交流
          </span>
        </div>
      </div>

      {/* 2. 广告位 / 专栏推荐位（支持一键配置 NEXT_PUBLIC_ADSENSE_CLIENT_ID 切换为 Google AdSense） */}
      <div className="sponsor-slot">
        {adsenseClientId && adsenseSlotId ? (
          <div className="adsense-box">
            <span className="sponsor-badge">ADVERTISEMENT</span>
            <ins
              className="adsbygoogle"
              style={{ display: 'block' }}
              data-ad-client={adsenseClientId}
              data-ad-slot={adsenseSlotId}
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          </div>
        ) : (
          <div className="native-promo-card">
            <div className="promo-main">
              <div className="promo-header">
                <span className="sponsor-badge">专栏推荐 · SPONSOR SLOT</span>
                <span className="promo-title">FCF&apos;s Notes 技术沉淀与开源仓库</span>
              </div>
              <p className="promo-desc">
                涵盖 iOS 底层原理、性能优化（FOOM / 卡顿 / 崩溃治理）、SwiftUI &amp; Combine、Go 后端、Vue3 与 AI Agent 实战笔记。
              </p>
            </div>
            <a
              href="https://github.com/fengCaifan/fcfblog"
              target="_blank"
              rel="noreferrer"
              className="promo-action-btn"
            >
              GitHub Star ★
            </a>
          </div>
        )}
      </div>

      {/* 3. 提问与交流评论区 */}
      <div className="qa-section">
        <div className="qa-header">
          <h3 className="qa-title">提问与交流 ({comments.length})</h3>
          <a
            href={githubIssueUrl}
            target="_blank"
            rel="noreferrer"
            className="qa-github-link"
          >
            在 GitHub 提交公开提问 ↗
          </a>
        </div>

        <form className="qa-form" onSubmit={handleSubmitQuestion}>
          <div className="qa-form-row">
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="你的称呼（选填）"
              className="qa-input-name"
            />
          </div>
          <textarea
            rows={3}
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder={`关于《${title}》有任何疑问、补充或不同见解，欢迎在此提问...`}
            className="qa-textarea"
          />
          <div className="qa-form-actions">
            {submittedTip && <span className="qa-tip">{submittedTip}</span>}
            <div className="qa-btn-group">
              <a
                href={githubIssueUrl}
                target="_blank"
                rel="noreferrer"
                className="qa-secondary-btn"
              >
                同步到 GitHub Issue
              </a>
              <button type="submit" className="qa-submit-btn">
                发布提问
              </button>
            </div>
          </div>
        </form>

        {comments.length > 0 && (
          <ul className="qa-comment-list">
            {comments.map((item) => (
              <li key={item.id} className="qa-comment-item">
                <div className="qa-comment-meta">
                  <span className="qa-comment-author">{item.author}</span>
                  <time className="qa-comment-date">{item.createdAt}</time>
                </div>
                <p className="qa-comment-body">{item.content}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
