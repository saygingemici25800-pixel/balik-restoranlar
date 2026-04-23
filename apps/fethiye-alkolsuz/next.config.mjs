/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@balik/cms-client', '@balik/design-tokens', '@balik/ui', '@balik/utils'],
};

export default nextConfig;
