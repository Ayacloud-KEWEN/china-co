import { GraphView } from "./graph-view";
import { buildGraph } from "@/lib/graph";

export const dynamic = "force-dynamic";

export default async function GraphPage() {
  const graph = await buildGraph();
  return <GraphView graph={graph} />;
}
