// @ts-check

const fullEsmMaxSize = "23KB";
const fullCjsMaxSize = "46KB";

const modifyWebpackConfig = config => {
  config.resolve = {};
  config.resolve.fallback = { "path": false, "fs": false };
}

/**
 * Will ensure esm tree-shakeability and total size are within expectations.
 *
 * @link https://github.com/ai/size-limit/
 * @type {{name: string, path: string[], limit: string, import?: string, webpack?: boolean, modifyWebpackConfig: any}[]}
 */
module.exports = [
  // ###################################################
  // ESM full bundle
  // ###################################################
  {
    name: "ESM (import everything *)",
    path: ["dist/esm/index.js"],
    import: "*",
    limit: fullEsmMaxSize,
    modifyWebpackConfig,
  },
  // ###################################################
  // Commonjs full bundle
  // ###################################################
  {
    name: "CJS (require everything *)",
    path: ["dist/commonjs/index.js"],
    import: "*",
    webpack: true,
    limit: fullCjsMaxSize,
    modifyWebpackConfig,
  }
];
