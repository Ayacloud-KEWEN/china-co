import { notFound } from "next/navigation";
import { getDivisionWithPath } from "@/lib/queries";
import { DivisionForm } from "../division-form";

export const dynamic = "force-dynamic";

export default async function EditDivisionPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const data = await getDivisionWithPath(code);
  if (!data) notFound();

  const path = [...data.ancestors.map((a) => a.name), data.division.name].join(" / ");
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">编辑行政区 · {path}</h2>
      <DivisionForm d={data.division} />
    </div>
  );
}
