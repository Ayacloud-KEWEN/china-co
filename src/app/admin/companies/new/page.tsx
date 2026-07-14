import { CompanyForm } from "../company-form";

export default function NewCompanyPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">新增企业</h2>
      <CompanyForm />
    </div>
  );
}
