export const changeHtmlLangAttribute = (lang: string): void => {
  const html = document.querySelector('html')
  if (html) html.setAttribute('lang', lang)
}
