// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  // 👇 tell Next.js to look inside src/
  eslint: { ignoreDuringBuilds: true },
};

module.exports = nextConfig;
