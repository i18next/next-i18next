import common from '../public/locales/en/common.json'
import footer from '../public/locales/en/footer.json'
import secondpage from '../public/locales/en/second-page.json'
import staticpage from '../public/locales/en/staticpage.json'

const resources = {
  common,
  footer,
  'second-page': secondpage,
  staticpage,
} as const

export default resources
