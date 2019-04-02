export default (initialLng, fallbackLng) => {
  const languages = [initialLng]

  if (typeof fallbackLng === 'string' && fallbackLng !== initialLng) {
    languages.push(fallbackLng)
  }

  if (Array.isArray(fallbackLng)) {
    fallbackLng.forEach(lng => languages.push(lng))
  } else if (typeof fallbackLng[initialLng] === 'string') {
    languages.push(fallbackLng[initialLng])
  } else if (Array.isArray(fallbackLng[initialLng])) {
    fallbackLng[initialLng].forEach(lng => languages.push(lng))
  }

  if (fallbackLng.default) {
    languages.push(fallbackLng.default)
  }

  return languages
}
