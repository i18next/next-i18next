import { defineConfig } from 'tsdown'

const appRouterCommon = {
  format: ['esm', 'cjs'] as ('esm' | 'cjs')[],
  dts: true,
  sourcemap: true,
  clean: false,
  outDir: 'dist/appRouter',
  tsconfig: 'tsconfig.appRouter.json',
}

export default defineConfig([
  // ── App Router: main entry ──
  {
    ...appRouterCommon,
    entry: { index: 'src/appRouter/index.ts' },
    deps: {
      neverBundle: [
        'next',
        'i18next',
      ],
    },
  },
  // ── App Router: proxy (also serves ./middleware backwards-compat export) ──
  {
    ...appRouterCommon,
    entry: { 'proxy/index': 'src/appRouter/proxy/index.ts' },
    deps: {
      neverBundle: [
        'next', 'next/server',
      ],
    },
  },
  // ── App Router: server ──
  {
    ...appRouterCommon,
    entry: { server: 'src/appRouter/server.ts' },
    deps: {
      neverBundle: [
        'react', 'next', 'next/headers',
        'i18next',
        'i18next-resources-to-backend',
        'fs/promises', 'path',
      ],
    },
  },
  // ── App Router: client ──
  {
    ...appRouterCommon,
    entry: { client: 'src/appRouter/client.tsx' },
    banner: {
      js: "'use client';",
    },
    deps: {
      neverBundle: [
        'react', 'react-dom', 'next', 'next/navigation',
        'i18next', 'react-i18next', 'react-i18next/initReactI18next',
        'i18next-resources-to-backend',
      ],
    },
  },
  // ── Pages Router: unbundled (preserves module structure for shared state) ──
  {
    entry: [
      'src/pagesRouter/**/*.ts',
      'src/pagesRouter/**/*.tsx',
      '!src/pagesRouter/**/*.test.*',
    ],
    unbundle: true,
    format: ['cjs', 'esm'],
    dts: true,
    outDir: 'dist/pagesRouter',
    target: 'es2020',
    tsconfig: 'tsconfig.pagesRouter.json',
    sourcemap: true,
    clean: false,
  },
])
