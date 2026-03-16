import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  redirects: async () => [
    { source: "/", destination: "/payroll", permanent: false },
  ],
};

export default nextConfig;
