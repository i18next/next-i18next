import common from '../public/locales/en/common.json';
import footer from '../public/locales/en/footer.json';
import secondpage from '../public/locales/en/second-page.json';

const resources = {
  common,
  footer,
  'second-page': secondpage
} as const;

export default resources;
