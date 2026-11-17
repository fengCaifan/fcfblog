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
 * 为每篇文章生成符合时间沉淀规律的累计阅读底数（早期高、近期低，整体保持个位数~十位数）
 * - 2026 下半年（近期新文）：2 ~ 8 次（纯个位数）
 * - 2026 上半年：7 ~ 15 次
 * - 2025 年：13 ~ 25 次
 * - 2024 年：22 ~ 36 次
 * - 2023 年：30 ~ 50 次
 * - 2020 ~ 2022 年（早期长线沉淀）：44 ~ 68 次
 */
export function getSeededPostViews(post: {
  slug: string;
  title: string;
  date: string;
  category?: string;
  description?: string;
}): number {
  const h1 = hashString(`views_v3:${post.slug}:${post.title}`);
  const h2 = hashString(`salt_v3:${post.date}:${post.slug}`);

  const pubTime = Date.parse(post.date) || Date.parse('2024-06-01');
  const refNow = Date.parse('2026-11-17');
  const daysSincePub = Math.max(1, Math.floor((refNow - pubTime) / (1000 * 60 * 60 * 24)));

  // 核心长文的小幅同年代微调（0 ~ 5 次），不打破跨年份的新老梯度
  const titleAndCat = `${post.title} ${post.category || ''}`;
  const isCoreTopic =
    /完全指南|完全学习指南|知识体系|源码|底层|Runtime|RunLoop|多线程|锁|崩溃|FOOM|卡顿|组件化|SwiftUI|Combine/i.test(
      titleAndCat
    );
  const topicBonus = isCoreTopic ? 2 + (h2 % 4) : 0;

  // 严格按发布时长分段递增：越早发布的文章累计阅读越多，近期文章保持个位数
  if (daysSincePub <= 160) {
    // 2026-06 ~ 2026-11（最近半年内的新文章）：2 ~ 8 次
    return 2 + (h1 % 5) + (isCoreTopic ? 1 : 0);
  }
  if (daysSincePub <= 330) {
    // 2026-01 ~ 2026-05：7 ~ 15 次
    const monthProgress = Math.floor((daysSincePub - 160) / 35); // 0 ~ 4
    return 7 + monthProgress + (h1 % 4) + (isCoreTopic ? 1 : 0);
  }
  if (daysSincePub <= 690) {
    // 2025 全年：13 ~ 25 次
    const progress = Math.floor((daysSincePub - 330) / 50); // 0 ~ 7
    return 13 + progress + (h1 % 4) + Math.min(2, topicBonus);
  }
  if (daysSincePub <= 1060) {
    // 2024 全年：22 ~ 36 次
    const progress = Math.floor((daysSincePub - 690) / 50); // 0 ~ 7
    return 22 + progress + (h1 % 5) + Math.min(3, topicBonus);
  }
  if (daysSincePub <= 1425) {
    // 2023 全年：30 ~ 50 次
    const progress = Math.floor((daysSincePub - 1060) / 40); // 0 ~ 9
    return 30 + progress + (h1 % 7) + topicBonus;
  }

  // 2020 ~ 2022 最早期笔记：44 ~ 68 次
  const oldProgress = Math.min(10, Math.floor((daysSincePub - 1425) / 80));
  return 44 + oldProgress + (h1 % 9) + topicBonus;
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
