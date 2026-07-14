import { notFound } from "next/navigation";
import { getCompany } from "@/lib/queries";
import { CompanyForm } from "../company-form";

export const dynamic = "force-dynamic";

export default async function EditCompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const company = await getCompany(slug);
  if (!company) notFound();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">编辑企业 · {company.name}</h2>
      <CompanyForm company={company} />
    </div>
  );
}
