import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["bcryptjs"],
  allowedDevOrigins: ["192.168.129.58", "192.168.130.124"],
};

export default nextConfig;
