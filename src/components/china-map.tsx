"use client";

import { useLang } from "@/lib/i18n";

// Simplified positional bubble map (not geographically exact) — a heatmap of
// industry hubs. Production would use OpenStreetMap / a real GeoJSON of China.
const hubs = [
  { name: "北京", nameEn: "Beijing", x: 62, y: 30, heat: 0.8 },
  { name: "上海", nameEn: "Shanghai", x: 74, y: 50, heat: 1.0 },
  { name: "深圳", nameEn: "Shenzhen", x: 62, y: 78, heat: 1.0 },
  { name: "广州", nameEn: "Guangzhou", x: 58, y: 76, heat: 0.85 },
  { name: "杭州", nameEn: "Hangzhou", x: 72, y: 54, heat: 0.8 },
  { name: "苏州", nameEn: "Suzhou", x: 73, y: 48, heat: 0.75 },
  { name: "成都", nameEn: "Chengdu", x: 42, y: 55, heat: 0.7 },
  { name: "武汉", nameEn: "Wuhan", x: 62, y: 56, heat: 0.65 },
  { name: "重庆", nameEn: "Chongqing", x: 46, y: 58, heat: 0.7 },
  { name: "西安", nameEn: "Xi'an", x: 52, y: 44, heat: 0.6 },
];

export function ChinaMap() {
  const { lang } = useLang();
  return (
    <div className="relative">
      <svg viewBox="0 0 100 90" className="w-full">
        <path
          d="M20,28 Q28,14 45,16 Q62,10 78,20 Q90,30 84,44 Q88,58 74,66 Q66,82 52,82 Q40,86 32,74 Q18,68 20,52 Q12,40 20,28 Z"
          className="fill-primary/5 stroke-border"
          strokeWidth="0.5"
        />
        {hubs.map((h) => (
          <g key={h.nameEn}>
            <circle cx={h.x} cy={h.y} r={2 + h.heat * 3} className="fill-accent/30">
              <animate attributeName="r" values={`${2 + h.heat * 3};${3 + h.heat * 4};${2 + h.heat * 3}`} dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx={h.x} cy={h.y} r={1.4} className="fill-accent" />
            <text x={h.x} y={h.y - 3} textAnchor="middle" className="fill-muted text-[2.6px]">
              {lang === "en" ? h.nameEn : h.name}
            </text>
          </g>
        ))}
      </svg>
      <div className="mt-2 flex items-center justify-center gap-2 text-[10px] text-muted">
        <span className="inline-block h-2 w-2 rounded-full bg-accent" /> 产业活跃度热点
      </div>
    </div>
  );
}
