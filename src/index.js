import createConfig from 'config/create-config'
import createI18NextClient from 'create-i18next-client'

let i18n = null
let config = null
const setupI18Next = (userConfig) => {
  config = createConfig(userConfig)
  i18n = createI18NextClient(config)
}

export {
  i18n,
  setupI18Next,
}
