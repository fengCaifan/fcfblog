import type { PostSummary } from './posts';

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * 为每篇文章生成克制、真实的累计阅读底数（个位数 ~ 十位数：3 ~ 58 次）
 * - 跨设备、跨刷新完全一致
 * - 约 35% 文章为个位数（3 ~ 9 次），其余为十位数（10 ~ 58 次）
 */
export function getSeededPostViews(post: {
  slug: string;
  title: string;
  date: string;
  category?: string;
  description?: string;
}): number {
  const h1 = hashString(`views_v2:${post.slug}:${post.title}`);
  const h2 = hashString(`salt_v2:${post.date}:${post.slug}`);

  const pubTime = Date.parse(post.date) || Date.parse('2024-06-01');
  const refNow = Math.max(Date.now(), Date.parse('2026-11-17'));
  const daysSincePub = Math.max(10, Math.floor((refNow - pubTime) / (1000 * 60 * 60 * 24)));

  // 基础底数：2 ~ 18
  const baseRandom = 2 + (h1 % 17);

  // 时间跨度微调：0 ~ 14（老文章略多几次阅读）
  const ageViews = Math.min(14, Math.floor(daysSincePub / 110) + (h2 % 4));

  // 核心长文略微上浮，普通笔记保持个位数或十来次
  let raw = baseRandom + ageViews;
  const titleAndCat = `${post.title} ${post.category || ''}`;
  if (
    /完全指南|完全学习指南|知识体系|源码|底层|Runtime|RunLoop|多线程|锁|崩溃|FOOM|卡顿|组件化|SwiftUI|Combine|大模型|RAG/i.test(
      titleAndCat
    )
  ) {
    raw = Math.round(raw * 1.45) + (h1 % 9); // 约 18 ~ 58 次
  } else if (h2 % 3 === 0) {
    // 约 1/3 的常规笔记保持在个位数（3 ~ 9 次）
    raw = 3 + (h1 % 7);
  }

  return Math.max(3, Math.min(62, raw));
}

/**
 * 计算全站总访问量（PV）与总访客数（UV）底数
 */
export function getSeededSiteTotals(posts: PostSummary[]): {
  totalPv: number;
  totalUv: number;
} {
  const articleViewsSum = posts.reduce((acc, p) => acc + getSeededPostViews(p), 0);
  const totalPv = articleViewsSum + 86;
  const totalUv = Math.max(42, Math.round(totalPv * 0.28));
  return { totalPv, totalUv };
}

const LOCAL_VIEWS_KEY = 'fcfblog_post_views_delta_v1';
const LOCAL_SITE_PV_KEY = 'fcfblog_site_pv_delta_v1';
const LOCAL_SITE_UV_KEY = 'fcfblog_site_uv_recorded_v1';

export function getLocalPostDelta(slug: string): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = window.localStorage.getItem(LOCAL_VIEWS_KEY);
    if (!raw) return 0;
    const map = JSON.parse(raw) as Record<string, number>;
    return Number(map[slug] || 0);
  } catch {
    return 0;
  }
}

export function recordLocalPostView(slug: string): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = window.localStorage.getItem(LOCAL_VIEWS_KEY);
    const map: Record<string, number> = raw ? JSON.parse(raw) : {};
    map[slug] = Number(map[slug] || 0) + 1;
    window.localStorage.setItem(LOCAL_VIEWS_KEY, JSON.stringify(map));

    // 同步增加全站 PV
    const pvDelta = Number(window.localStorage.getItem(LOCAL_SITE_PV_KEY) || 0) + 1;
    window.localStorage.setItem(LOCAL_SITE_PV_KEY, String(pvDelta));
    if (!window.localStorage.getItem(LOCAL_SITE_UV_KEY)) {
      window.localStorage.setItem(LOCAL_SITE_UV_KEY, '1');
    }
    return map[slug];
  } catch {
    return 1;
  }
}

export function recordLocalSiteVisit(): { pvDelta: number; uvDelta: number } {
  if (typeof window === 'undefined') return { pvDelta: 0, uvDelta: 0 };
  try {
    let pvDelta = Number(window.localStorage.getItem(LOCAL_SITE_PV_KEY) || 0);
    // 每次新会话首次打开首页 +1
    if (!window.sessionStorage.getItem('fcfblog_session_counted')) {
      pvDelta += 1;
      window.localStorage.setItem(LOCAL_SITE_PV_KEY, String(pvDelta));
      window.sessionStorage.setItem('fcfblog_session_counted', '1');
    }
    if (!window.localStorage.getItem(LOCAL_SITE_UV_KEY)) {
      window.localStorage.setItem(LOCAL_SITE_UV_KEY, '1');
    }
    const uvDelta = window.localStorage.getItem(LOCAL_SITE_UV_KEY) ? 1 : 0;
    return { pvDelta, uvDelta };
  } catch {
    return { pvDelta: 0, uvDelta: 0 };
  }
}
