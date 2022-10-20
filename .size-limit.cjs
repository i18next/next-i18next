// @ts-check

const fullEsmMaxSize = "10KB";
const fullCjsMaxSize = "10KB";

/**
 * Will ensure esm tree-shakeability and total size are within expectations.
 *
 * @link https://github.com/ai/size-limit/
 * @type {{name: string, path: string[], limit: string, import?: string, webpack?: boolean}[]}
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
  }
];
