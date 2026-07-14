import { notFound } from "next/navigation";
import { getSupplierBySlug } from "@/lib/queries";
import { SupplierForm } from "../supplier-form";

export const dynamic = "force-dynamic";

export default async function EditSupplierPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supplier = await getSupplierBySlug(slug);
  if (!supplier) notFound();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">编辑供应商 · {supplier.name}</h2>
      <SupplierForm supplier={supplier} />
    </div>
  );
}
