
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
    allowedDevOrigins: ["6000-firebase-studio-*.cloudworkstations.dev"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
