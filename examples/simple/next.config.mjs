// @ts-check
const { i18n } = require('./next-i18next.config')

// You can remove the following 2 lines when integrating our example.
import { loadCustomBuildParams } from "./loadCustomBuildParams.mjs";
const { esmExternals, tsconfigPath } = loadCustomBuildParams();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n,
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

