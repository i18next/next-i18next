/* eslint-env jest */

const userConfig = {
  browserLanguageDetection: false,
  defaultLanguage: 'de',
  defaultNS: 'universal',
  fallbackLng: 'it',
  otherLanguages: ['fr', 'it'],
  localePath: 'static/translations',
  localeStructure: '{{ns}}/{{lng}}',
  localeSubpaths: true,
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
  userConfig,
  setUpTest,
  tearDownTest,
}
