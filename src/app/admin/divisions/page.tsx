import { db, schema } from "@/db";
import { DivisionBrowser } from "./browser";

export const dynamic = "force-dynamic";

export default async function AdminDivisionsPage() {
  const rows = await db.select().from(schema.divisions).orderBy(schema.divisions.code);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">行政区划</h2>
        <p className="text-sm text-muted">
          结构由 <code>npm run db:divisions</code> 从国标区划代码导入，此处只编辑各级情报内容。
        </p>
      </div>
      <DivisionBrowser rows={rows.map(({ summary, ...r }) => ({ ...r, hasSummary: !!(summary?.zh || summary?.en || summary?.fr) }))} />
    </div>
  );
}
