import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // We run production with `next start` (PM2) — reliable static serving and full
  // node_modules (so transformers.js / onnxruntime native libs load correctly).
  // NOTE: `output: 'standalone'` was intentionally removed — with Next 16 +
  // Turbopack it mis-served /_next/static (500s). See docs/DEPLOYMENT_*.md.

  // Keep the local-embedding native packages external (not bundled).
  serverExternalPackages: ["@xenova/transformers", "onnxruntime-node", "sharp"],
};

export default nextConfig;
