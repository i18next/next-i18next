// @ts-check

const trueEnv = ['true', '1', 'yes'];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: trueEnv.includes(
      process.env?.NEXTJS_SWC_MINIFY ?? 'true'
  ),
  typescript: {
    tsconfigPath: process.env.TSCONFIG_CONFIG_PATH
        ? process.env.TSCONFIG_CONFIG_PATH
        : './tsconfig.json',
  },
  experimental: {
    // Prefer loading of ES Modules over CommonJS
    // @link {https://nextjs.org/blog/next-11-1#es-modules-support|Blog 11.1.0}
    // @link {https://github.com/vercel/next.js/discussions/27876|Discussion}
    esmExternals: trueEnv.includes(
        process.env?.NEXTJS_ESM_EXTERNALS ?? 'false'
    ),
  },
};

export default nextConfig;
