import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained production build (.next/standalone) — smaller deploy, run via
  // `node .next/standalone/server.js`. See deploy.sh + docs/DEPLOYMENT_*.md.
  output: "standalone",

  // transformers.js (local embeddings) + its ONNX runtime ship native binaries
  // and model assets; keep them external so they're required from node_modules
  // at runtime instead of being bundled.
  serverExternalPackages: ["@xenova/transformers", "onnxruntime-node", "sharp"],
};

export default nextConfig;
