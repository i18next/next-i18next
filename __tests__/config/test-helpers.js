import { localeSubpathOptions } from '../../src/config/default-config'

/* eslint-env jest */

const userConfig = {
  browserLanguageDetection: false,
  defaultLanguage: 'de',
  defaultNS: 'universal',
  fallbackLng: 'it',
  otherLanguages: ['fr', 'it'],
  localePath: 'static/translations',
  localeStructure: '{{ns}}/{{lng}}',
  localeSubpaths: localeSubpathOptions.FOREIGN,
}

const userConfigClientSide = {
  ...userConfig,
  backend: {
    loadPath: '/static/translations/{{ns}}/{{lng}}.json',
    addPath: '/static/translations/{{ns}}/{{lng}}.missing.json',
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
  userConfigClientSide,
  userConfigServerSide,
  setUpTest,
  tearDownTest,
}
