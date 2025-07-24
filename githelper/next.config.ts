import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  //   experimental: {
  //   serverComponentsExternalPackages: ['@prisma/client'],
  // },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@prisma/client': false,
      }
      config.externals = config.externals || []
      config.externals.push('@prisma/client')
    }
    return config
  },
};

export default nextConfig;
