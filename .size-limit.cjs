// @ts-check

const fullEsmMaxSize = '5KB'
// Recent Nextjs version have some optimizations for commonjs that
// aren't available on bare-bone webpack. don't worry about threshold
// difference here for cjs. We can keep this till cjs is supported.
const fullCjsMaxSize = '29KB'

const getSimpleExamplePageLimits = () => {
  const dir = './examples/simple/.next'
  let manifest
  try {
    manifest = require(`${dir}/build-manifest.json`)
  } catch (e) {
    throw new Error(
      'Cannot find a NextJs build folder, did you forget to run build:examples ?'
    )
  }
  const limitCfg = {
    defaultSize: '90kb',
    pages: {
      '/': '85kb',
      '/404': '90kb',
      '/_app': '105kb',
      '/_error': '82Kb',
      '/second-page': '85Kb',
    },
  }
  let pageLimits = []
  for (const [uri, paths] of Object.entries(manifest.pages)) {
    pageLimits.push({
      name: `Example app: page '${uri}'`,
      limit: limitCfg.pages?.[uri] ?? limitCfg.defaultSize,
      webpack: false,
      path: paths.map(p => `${dir}/${p}`),
    })
  }
  return pageLimits
}

const modifyWebpackConfig = config => {
  config.resolve = {}
  config.resolve.fallback = { path: false, fs: false }
}

/**
 * Will ensure esm tree-shakeability and total size are within expectations.
 *
 * @link https://github.com/ai/size-limit/
 * @type {{name: string, path: string[], limit: string, import?: string, webpack?: boolean, modifyWebpackConfig: any}[]}
 */
module.exports = [
  // ###################################################
  // Dist ESM full bundle
  // ###################################################
  {
    name: 'ESM (import everything *)',
    path: ['dist/esm/index.js'],
    import: '*',
    limit: fullEsmMaxSize,
    modifyWebpackConfig,
  },
  // ###################################################
  // Fist commonjs full bundle
  // Tip: older versions of nextjs will not tree-shake
  //      cjs very well. This explains threshold differences
  // ###################################################
  {
    name: 'CJS (require everything *)',
    path: ['dist/commonjs/index.js'],
    import: '*',
    webpack: true,
    limit: fullCjsMaxSize,
    modifyWebpackConfig,
  },
  // ###################################################
  // Example apps
  // ###################################################
  ...getSimpleExamplePageLimits(),
]
