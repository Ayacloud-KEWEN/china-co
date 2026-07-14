import { PolicyForm } from "../policy-form";

export default function NewPolicyPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">新增政策</h2>
      <PolicyForm />
    </div>
  );
}
