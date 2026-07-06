"use client";

import { useLang } from "@/lib/i18n";
import { PageHeader, Card, Badge, Stat, SectionTitle } from "@/components/ui";
import { AiPanel } from "@/components/ai-panel";
import { MapEmbed } from "@/components/map-embed";
import type { City } from "@/db/schema";

export function CityView({ c }: { c: City }) {
  const { lang } = useLang();
  return (
    <div className="space-y-6">
      <PageHeader title={`📍 ${lang === "en" ? c.nameEn : c.name}`} subtitle={c.summary[lang]} />
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="GDP" value={c.gdp} />
        <Stat label="常住人口" value={c.pop} />
        <Stat label="支柱产业" value={String(c.pillars.length)} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><SectionTitle>支柱产业</SectionTitle><div className="flex flex-wrap gap-2">{c.pillars.map((p) => <Badge key={p} tone="blue">{p}</Badge>)}</div></Card>
        <Card><SectionTitle>代表企业</SectionTitle><div className="flex flex-wrap gap-2">{c.leaders.map((l) => <Badge key={l} tone="green">{l}</Badge>)}</div></Card>
      </div>

      {c.geo && c.pois && c.pois.length > 0 && (
        <Card>
          <SectionTitle>工业区分布图 · OpenStreetMap</SectionTitle>
          <MapEmbed
            center={[c.geo.lat, c.geo.lon]}
            zoom={11}
            markers={c.pois.map((p) => ({ lat: p.lat, lon: p.lon, label: p.name, sub: c.name }))}
          />
          <div className="mt-2 text-[11px] text-muted">© OpenStreetMap contributors · 标记为库内真实工业区/园区坐标</div>
        </Card>
      )}

      {c.pois && c.pois.length > 0 && (
        <Card>
          <SectionTitle>工业区 / 园区 · OpenStreetMap（实时地理数据）</SectionTitle>
          <div className="grid gap-2 sm:grid-cols-2">
            {c.pois.map((p) => (
              <a
                key={p.name}
                href={`https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lon}#map=15/${p.lat}/${p.lon}`}
                target="_blank" rel="noreferrer"
                className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition hover:border-accent hover:bg-background"
              >
                <span>🏭</span>
                <span className="flex-1 truncate">{p.name}</span>
                <span className="text-[10px] text-muted">{p.lat.toFixed(3)}, {p.lon.toFixed(3)}</span>
              </a>
            ))}
          </div>
          <div className="mt-3 text-[11px] text-muted">来源：OpenStreetMap / Overpass（landuse=industrial）· © OpenStreetMap contributors</div>
        </Card>
      )}
      <Card>
        <SectionTitle>AI 城市分析 · 营商环境 / 外资政策 / 建厂建议</SectionTitle>
        <AiPanel
          mode="search"
          seedPrompt={`请对中国城市「${c.name}」生成分析：GDP、支柱产业、龙头企业、工业园、人才与高校、物流、营商环境、外资政策，并给出对欧洲企业的建厂/设点建议，标注来源。`}
          suggestions={[`${c.name} 适合建厂吗`, `外资优惠政策`, `工业园推荐`, `人才与用工成本`]}
        />
      </Card>
    </div>
  );
}
