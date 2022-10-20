// @ts-check

import {loadCustomBuildParams} from "./loadCustomBuildParams.mjs";

// @ts-ignore you can remove this when integrating our example.
const { esmExternals, tsconfigPath } = loadCustomBuildParams();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de'],
  },
  // localePath,
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  experimental: {
    // Prefer loading of ES Modules over CommonJS
    // @link {https://nextjs.org/blog/next-11-1#es-modules-support|Blog 11.1.0}
    // @link {https://github.com/vercel/next.js/discussions/27876|Discussion}
    esmExternals
  },
  typescript: {
    tsconfigPath
  },
};

export default nextConfig;

