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
 * 为每篇文章生成稳定、自然的累计阅读底数（跨设备、跨刷新完全一致）
 * - 结合文章发布时间（2022~2026 历史跨度）、主题热度权重与标题哈希
 * - 同时随自然日缓慢增长，避免静态死数字
 */
export function getSeededPostViews(post: {
  slug: string;
  title: string;
  date: string;
  category?: string;
  description?: string;
}): number {
  const h1 = hashString(`views:${post.slug}:${post.title}`);
  const h2 = hashString(`salt:${post.date}:${post.slug}`);

  // 计算文章距今的月份/天数跨度（以 2022-01 ~ 2026-11 为基准）
  const pubTime = Date.parse(post.date) || Date.parse('2024-06-01');
  const refNow = Math.max(Date.now(), Date.parse('2026-11-17'));
  const daysSincePub = Math.max(15, Math.floor((refNow - pubTime) / (1000 * 60 * 60 * 24)));

  // 基础随机底数：180 ~ 620
  const baseRandom = 180 + (h1 % 440);

  // 时间沉淀增量：发布越早的文章，历史累计阅读越高（封顶合理区间）
  const ageFactor = Math.min(daysSincePub, 1500);
  const ageViews = Math.floor(ageFactor * (0.42 + ((h2 % 35) / 100)));

  // 热门技术主题权重加成
  let topicMultiplier = 1.0;
  const titleAndCat = `${post.title} ${post.category || ''}`;
  if (
    /完全指南|完全学习指南|知识体系|源码|底层|Runtime|RunLoop|多线程|锁|崩溃|FOOM|卡顿|内存|架构|组件化|SwiftUI|Combine|大模型|Agent|RAG/i.test(
      titleAndCat
    )
  ) {
    topicMultiplier = 1.38 + ((h1 % 28) / 100); // 1.38x ~ 1.65x
  } else if (/实战|blog项目|设计模式|模式|剑指|二叉树|动态规划|双指针|Vue3|Go语言/i.test(titleAndCat)) {
    topicMultiplier = 1.15 + ((h2 % 20) / 100); // 1.15x ~ 1.34x
  }

  // 自然日微增（每天全网自然增加 0~2 次阅读）
  const dayIndex = Math.floor(refNow / (1000 * 60 * 60 * 24));
  const dailyDrift = Math.floor(((dayIndex - 20770) * ((h1 % 3) + 1)) / 2);

  const total = Math.round((baseRandom + ageViews) * topicMultiplier) + Math.max(0, dailyDrift);
  return Math.max(126, total);
}

/**
 * 计算全站总访问量（PV）与总访客数（UV）底数
 */
export function getSeededSiteTotals(posts: PostSummary[]): {
  totalPv: number;
  totalUv: number;
} {
  const articleViewsSum = posts.reduce((acc, p) => acc + getSeededPostViews(p), 0);
  // 加上首页、分类筛选、图谱页浏览的合理比例（约 1.18 倍文章总阅读）
  const totalPv = Math.round(articleViewsSum * 1.18) + 4280;
  // 独立访客 UV 约为总 PV 的 32.4%
  const totalUv = Math.round(totalPv * 0.324) + 137;
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
