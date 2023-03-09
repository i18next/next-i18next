// see docs: https://prettier.io/docs/en/options.html
// also: https://prettier.io/docs/en/configuration.html
// see example from a project on GitHub: https://github.com/tailwindlabs/tailwindcss/blob/master/prettier.config.js

// editorconfig role is to configure your editor so that the code you write is already formatted while Prettier will format your already written code

module.exports = {
  // These settings are duplicated in .editorconfig:
  arrowParens: 'avoid',
  bracketSpacing: true,
  endOfLine: 'lf', // end_of_line = lf
  printWidth: 69, // default: 80
  semi: false, // default: true
  singleQuote: true, // default: false
  tabWidth: 2, // indent_size = 2
  trailingComma: 'es5',
  useTabs: false, // indent_style = space
}
