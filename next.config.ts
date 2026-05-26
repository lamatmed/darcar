import withSerwistInit from "@serwist/next";
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';

const withNextIntl = createNextIntlPlugin();

const withSerwist = withSerwistInit({
  swSrc: "sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV !== "production",
});

const nextConfig: import("next").NextConfig = {
  /* config options here */
  turbopack: {
    resolveAlias: {
      tailwindcss: path.resolve('./node_modules/tailwindcss'),
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default withSerwist(withNextIntl(nextConfig));
