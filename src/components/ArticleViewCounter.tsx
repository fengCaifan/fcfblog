"use client";

import React, { useEffect, useState } from 'react';
import { getLocalPostDelta, recordLocalPostView } from '../lib/analytics';

interface ArticleViewCounterProps {
  slug: string;
  baseViews: number;
}

export default function ArticleViewCounter({ slug, baseViews }: ArticleViewCounterProps) {
  const [views, setViews] = useState<number>(baseViews);

  useEffect(() => {
    const localDelta = recordLocalPostView(slug);
    setViews(baseViews + localDelta);

    // 同步尝试接入公开计数器 Vercount 真实线上增量（底数 + 真实增量）
    const controller = new AbortController();
    fetch('https://events.vercount.one/api/v2/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: window.location.href }),
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const remotePagePv = Number(data?.data?.page_pv || data?.page_pv || 0);
        if (remotePagePv > 0) {
          setViews(baseViews + Math.max(localDelta, remotePagePv));
        }
      })
      .catch(() => {
        // 离线或被广告拦截器拦截时静默降级为底数 + 本地增量
      });

    return () => controller.abort();
  }, [slug, baseViews]);

  return (
    <span className="article-view-count" title="累计阅读次数">
      阅读 {views.toLocaleString('zh-CN')} 次
    </span>
  );
}

export function PostRowViewBadge({ slug, baseViews }: ArticleViewCounterProps) {
  const [views, setViews] = useState<number>(baseViews);

  useEffect(() => {
    const delta = getLocalPostDelta(slug);
    if (delta > 0) {
      setViews(baseViews + delta);
    }
  }, [slug, baseViews]);

  return (
    <span className="post-row-views" title="阅读量">
      {views.toLocaleString('zh-CN')} 阅读
    </span>
  );
}
