import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Silences Next's workspace-root inference warning: the repo root's package-lock.json
  // (a sibling monorepo-style project, not a real workspace) would otherwise get picked as the
  // root instead of this app's own directory.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
