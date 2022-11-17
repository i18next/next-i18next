// see docs: https://prettier.io/docs/en/options.html
// also: https://prettier.io/docs/en/configuration.html
// see example from a project on GitHub: https://github.com/tailwindlabs/tailwindcss/blob/master/prettier.config.js

// editorconfig role is to configure your editor so that the code you write is already formatted while Prettier will format your already written code

module.exports = {
  // These settings are duplicated in .editorconfig:
  tabWidth: 2, // indent_size = 2
  useTabs: false, // indent_style = space
  endOfLine: 'lf', // end_of_line = lf
  semi: false, // default: true
  singleQuote: true, // default: false
  printWidth: 69, // default: 80
  trailingComma: 'es5',
  bracketSpacing: true,
  arrowParens: 'avoid',
}
