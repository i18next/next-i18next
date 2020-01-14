import { defaultConfig } from '../src/config/default-config'

export default {
  changeLanguage: jest.fn(),
  languages: ['en', 'de'],
  options: {
    ...defaultConfig,
    allLanguages: ['en', 'de'],
    defaultLanguage: 'en',
    otherLanguages: ['de'],
    ignoreRoutes: ['/_next/', '/static/', '/public/', '/api/'],
    serverLanguageDetection: true,
  },
}
