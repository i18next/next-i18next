export default (initialLng, fallbackLng) => {
  const languages = []

  if (initialLng) {
    languages.push(initialLng)
  }

  if (fallbackLng) {
    if (typeof fallbackLng === 'string' && fallbackLng !== initialLng) {
      languages.push(fallbackLng)
    }

    if (Array.isArray(fallbackLng)) {
      fallbackLng.forEach(lng => languages.push(lng))
    } else if (initialLng) {
      if (typeof fallbackLng[initialLng] === 'string') {
        languages.push(fallbackLng[initialLng])
      } else if (Array.isArray(fallbackLng[initialLng])) {
        fallbackLng[initialLng].forEach(lng => languages.push(lng))
      }
    }

    if (fallbackLng.default) {
      languages.push(fallbackLng.default)
    }
  }

  return languages
}
