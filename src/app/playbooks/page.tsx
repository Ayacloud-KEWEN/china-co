import { PlaybooksView } from "./playbooks-view";
import { getPlaybooks } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function PlaybooksPage() {
  const playbooks = await getPlaybooks();
  return <PlaybooksView playbooks={playbooks} />;
}
