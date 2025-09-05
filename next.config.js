// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed experimental.appDir (deprecated in Next.js 15)
  eslint: { ignoreDuringBuilds: true },
};

module.exports = nextConfig;
