import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
import nodeBuiltIns from 'rollup-plugin-node-builtins'
import replace from 'rollup-plugin-replace'
import { terser } from 'rollup-plugin-terser'
import { argv } from 'yargs'

const format = argv.format || argv.f || 'iife'
const compress = process.env.COMPRESS === 'true'

const babelOptions = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          esmodules: true,
        },
      },
    ],
    '@babel/react',
  ],
  babelrc: false,
}

const file = {
  amd: `dist/amd/next-i18next${compress ? '.min' : ''}.js`,
  umd: `dist/umd/next-i18next${compress ? '.min' : ''}.js`,
  iife: `dist/iife/next-i18next${compress ? '.min' : ''}.js`,
}[format]

const globals = {
  react: 'React',
  'next/router': 'next/router',
  'next/link': 'next/link',
}

export default {
  input: 'src/index.js',
  plugins: [
    babel(babelOptions),
    replace({
      'process.env.NODE_ENV': JSON.stringify(compress ? 'production' : 'development'),
    }),
    nodeResolve({ jsnext: true, main: true, preferBuiltins: true }),
    nodeBuiltIns(),
    commonjs({}),
  ].concat(compress ? terser() : []),
  external: ['react', 'react-dom', 'next/router'],
  output: {
    name: 'ReactI18next',
    globals,
    format,
    file,
  },
}
