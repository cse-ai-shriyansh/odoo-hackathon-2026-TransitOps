/** @type {import('next').NextConfig} */
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, "..");

const nextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react"]
  },
  webpack(config) {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@backend": path.join(workspaceRoot, "backend")
    };

    config.resolve.modules = [
      ...(config.resolve.modules || []),
      workspaceRoot,
      path.join(workspaceRoot, "frontend")
    ];

    return config;
  }
};

export default nextConfig;