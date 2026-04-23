/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@balik/cms-client',
    '@balik/design-tokens',
    '@balik/reservation-engine',
    '@balik/ui',
    '@balik/utils',
  ],
};

export default nextConfig;
