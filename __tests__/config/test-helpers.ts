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
  localePath: 'public/translations',
  localeStructure: '{{ns}}/{{lng}}',
  localeSubpaths: localeSubpathVariations.FOREIGN,
}

const userConfigClientSide = {
  ...userConfig,
  backend: {
    loadPath: '/translations/{{ns}}/{{lng}}.json',
    addPath: '/translations/{{ns}}/{{lng}}.missing.json',
  },
}

const userConfigServerSide = {
  ...userConfig,
  backend: {
    loadPath: '/home/user/public/translations/{{ns}}/{{lng}}.json',
    addPath: '/home/user/public/translations/{{ns}}/{{lng}}.missing.json',
  },
}

interface FileSystemFuncs {
  evalFunc: jest.SpyInstance;
  pwd: jest.SpyInstance;
}

const setUpTest = (): FileSystemFuncs => {
  const evalFunc = jest.spyOn(global, 'eval').mockImplementation((): {} => ({
    readdirSync: jest.fn().mockImplementation((): string[] => ['common', 'file1', 'file2']),
    existsSync: jest.fn().mockImplementation((): boolean => true),
  }))

  const pwd = jest.spyOn(process, 'cwd').mockImplementation((): string => '/home/user/')

  return {
    evalFunc,
    pwd,
  }
}

const tearDownTest = (evalFunc, pwd): void => {
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
