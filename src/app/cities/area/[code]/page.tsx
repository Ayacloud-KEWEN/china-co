import Link from "next/link";
import { notFound } from "next/navigation";
import { getDivisionWithPath } from "@/lib/queries";
import { PageHeader, Card, SectionTitle, Badge, Stat } from "@/components/ui";

export const dynamic = "force-dynamic";

const LEVEL_LABEL: Record<string, string> = {
  province: "省级行政区", city: "地级行政区", district: "区县级行政区", town: "乡镇/街道",
};

export default async function AreaDetail({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const data = await getDivisionWithPath(code);
  if (!data) return notFound();
  const { division: d, ancestors, children } = data;

  const filled = d.gdp || d.pop || d.pillars.length > 0 || d.summary?.zh || d.notes;

  return (
    <div className="space-y-6">
      <PageHeader title={d.name} subtitle={`${LEVEL_LABEL[d.level] ?? d.level} · 区划代码 ${d.code}`} />

      {ancestors.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 text-sm text-muted">
          {ancestors.map((a) => (
            <span key={a.code} className="flex items-center gap-1">
              <Link href={`/cities/area/${a.code}`} className="transition hover:text-accent hover:underline">{a.name}</Link>
              <span>/</span>
            </span>
          ))}
          <span className="text-foreground">{d.name}</span>
        </div>
      )}

      {filled ? (
        <Card>
          <SectionTitle>区域情报</SectionTitle>
          {(d.gdp || d.pop) && (
            <div className="mb-3 grid grid-cols-2 gap-3">
              {d.gdp && <Stat label="GDP" value={d.gdp} />}
              {d.pop && <Stat label="常住人口" value={d.pop} />}
            </div>
          )}
          {d.summary?.zh && <p className="text-sm text-muted">{d.summary.zh}</p>}
          {d.pillars.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">{d.pillars.map((p) => <Badge key={p}>{p}</Badge>)}</div>
          )}
          {d.notes && <p className="mt-3 whitespace-pre-wrap text-sm text-muted">{d.notes}</p>}
        </Card>
      ) : (
        <Card>
          <p className="text-sm text-muted">该行政区暂无情报内容，可在后台「行政区划」中补充。</p>
        </Card>
      )}

      {children.length > 0 && (
        <Card>
          <SectionTitle>下辖区域 · {children.length}</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {children.map((c) => (
              <Link
                key={c.code}
                href={c.citySlug ? `/cities/${c.citySlug}` : `/cities/area/${c.code}`}
                className="rounded-lg border px-2.5 py-1 text-sm transition hover:border-accent hover:text-accent"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
