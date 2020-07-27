export const localeSubpathVariations = {
  NONE: {},
  FOREIGN: {
    de: 'german',
  },
  ALL: {
    en: 'english',
    de: 'german',
  },
}

const userConfig = {
  browserLanguageDetection: false,
  defaultLanguage: 'de',
  defaultNS: 'universal',
  fallbackLng: 'it',
  otherLanguages: ['fr', 'it'],
  localeStructure: '{{ns}}/{{lng}}',
  localeSubpaths: localeSubpathVariations.FOREIGN,
  shallowRender: true
}

const userConfigClientSide = {
  ...userConfig,
  localePath: '/public/static/locales',
}

const userConfigServerSide = {
  ...userConfig,
  localePath: '/home/user/public/static/locales',
}

const setUpTest = () => {
  const evalFunc = jest.spyOn(global, 'eval').mockImplementation(() => ({
    readdirSync: jest.fn().mockImplementation(() => ['common', 'file1', 'file2']),
    existsSync: jest.fn().mockImplementation(() => true),
  }))

  const pwd = jest.spyOn(process, 'cwd').mockImplementation(() => '/home/user/')

  return {
    evalFunc,
    pwd,
  }
}

const tearDownTest = (evalFunc, pwd) => {
  evalFunc.mockReset()
  evalFunc.mockRestore()

  pwd.mockReset()
  pwd.mockRestore()
}

export {
  userConfig,
  userConfigClientSide,
  userConfigServerSide,
  setUpTest,
  tearDownTest,
}
