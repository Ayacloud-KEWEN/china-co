import { notFound } from "next/navigation";
import { getCompany } from "@/lib/queries";
import { CompanyView } from "./company-view";

export const dynamic = "force-dynamic";

export default async function CompanyDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await getCompany(slug);
  if (!c) return notFound();
  return <CompanyView c={c} />;
}
