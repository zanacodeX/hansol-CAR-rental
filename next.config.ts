import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["bcryptjs"],
  allowedDevOrigins: ["192.168.129.58"],
};

export default nextConfig;
