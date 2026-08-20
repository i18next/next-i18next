// Next 16 removed `next lint`; eslint-config-next now ships flat configs.
import next from 'eslint-config-next/core-web-vitals'

const config = [
  { ignores: ['.next/**', 'out/**'] },
  ...next,
]

export default config
