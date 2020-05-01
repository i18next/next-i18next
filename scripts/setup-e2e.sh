#!/bin/bash                                                                

rm -rf '.e2e'

mkdir -p .e2e/locale-subpaths-foreign
rsync -a examples/simple/ .e2e/locale-subpaths-foreign
rm -rf .e2e/locale-subpaths-foreign/next.config.js
cp examples/simple/__tests__/e2e/locale-subpaths-foreign.config.js .e2e/locale-subpaths-foreign/next.config.js

mkdir -p .e2e/locale-subpaths-all
rsync -a examples/simple/ .e2e/locale-subpaths-all
rm -rf .e2e/locale-subpaths-all/next.config.js
cp examples/simple/__tests__/e2e/locale-subpaths-all.config.js .e2e/locale-subpaths-all/next.config.js
