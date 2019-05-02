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
      languages.push(...fallbackLng)
    } else if (initialLng) {
      if (typeof fallbackLng[initialLng] === 'string') {
        languages.push(fallbackLng[initialLng])
      } else if (Array.isArray(fallbackLng[initialLng])) {
        languages.push(...fallbackLng[initialLng])
      }
    }

    if (fallbackLng.default) {
      languages.push(fallbackLng.default)
    }
  }

  return languages
}
