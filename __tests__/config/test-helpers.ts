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
  localePath: 'static/translations',
  localeStructure: '{{ns}}/{{lng}}',
  localeSubpaths: localeSubpathVariations.FOREIGN,
}

const userConfigClientSide = {
  ...userConfig,
  clientLocalePath: 'static/locales',
  backend: {
    loadPath: '/static/locales/{{ns}}/{{lng}}.json',
    addPath: '/static/locales/{{ns}}/{{lng}}.missing.json',
  },
}

const userConfigServerSide = {
  ...userConfig,
  backend: {
    loadPath: '/home/user/static/translations/{{ns}}/{{lng}}.json',
    addPath: '/home/user/static/translations/{{ns}}/{{lng}}.missing.json',
  },
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
