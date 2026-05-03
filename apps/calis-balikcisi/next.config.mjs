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
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'media.istockphoto.com' },
    ],
  },
};

export default nextConfig;
