import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "otxgcrplfvfvrydanlfo.supabase.co",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
