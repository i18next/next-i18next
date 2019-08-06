import React from 'react'

// Import all types to ensure they exist
import NextI18Next, {
  AppWithTranslation,
  Config,
  I18n,
  InitConfig,
  TFunction,
  WithTranslation,
} from '../types'

const DummyComponent = () => <div />

const emptyConfig = {
  defaultLanguage: null,
  otherLanguages: [],
}

// Instantiate instance and call methods upon it
const Instance = new NextI18Next(emptyConfig)
Instance.appWithTranslation(DummyComponent)
Instance.withTranslation('common')(DummyComponent)

