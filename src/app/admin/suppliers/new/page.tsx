import { SupplierForm } from "../supplier-form";

export default function NewSupplierPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">新增供应商</h2>
      <SupplierForm />
    </div>
  );
}
