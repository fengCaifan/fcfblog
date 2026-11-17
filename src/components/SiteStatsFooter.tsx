"use client";

import React, { useEffect, useState } from 'react';
import { recordLocalSiteVisit } from '../lib/analytics';

interface SiteStatsFooterProps {
  baseTotalPv: number;
  baseTotalUv: number;
}

export default function SiteStatsFooter({
  baseTotalPv,
  baseTotalUv,
}: SiteStatsFooterProps) {
  const [pv, setPv] = useState<number>(baseTotalPv);
  const [uv, setUv] = useState<number>(baseTotalUv);

  useEffect(() => {
    const { pvDelta, uvDelta } = recordLocalSiteVisit();
    setPv(baseTotalPv + pvDelta);
    setUv(baseTotalUv + uvDelta);

    const controller = new AbortController();
    fetch('https://events.vercount.one/api/v2/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: window.location.origin + '/fcfblog/' }),
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const remoteSitePv = Number(data?.data?.site_pv || data?.site_pv || 0);
        const remoteSiteUv = Number(data?.data?.site_uv || data?.site_uv || 0);
        if (remoteSitePv > 0) {
          setPv(baseTotalPv + Math.max(pvDelta, remoteSitePv));
        }
        if (remoteSiteUv > 0) {
          setUv(baseTotalUv + Math.max(uvDelta, remoteSiteUv));
        }
      })
      .catch(() => {
        // 静默降级
      });

    return () => controller.abort();
  }, [baseTotalPv, baseTotalUv]);

  return (
    <footer className="site-footer">
      <div className="site-footer-left">
        <span>© 2022–2026 FengCaifan</span>
        <span className="meta-sep">·</span>
        <a
          href="https://github.com/fengCaifan"
          target="_blank"
          rel="noreferrer"
        >
          github.com/fengCaifan
        </a>
      </div>
      <div className="site-footer-stats">
        <span>总访问量 {pv.toLocaleString('zh-CN')} 次</span>
        <span className="meta-sep">·</span>
        <span>总访客 {uv.toLocaleString('zh-CN')} 人</span>
      </div>
    </footer>
  );
}
