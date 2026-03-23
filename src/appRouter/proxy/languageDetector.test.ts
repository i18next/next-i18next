import { parseAcceptLanguage, matchLanguage, findSupportedMatch } from './languageDetector'

describe('parseAcceptLanguage', () => {
  it('returns empty array for null/undefined/empty', () => {
    expect(parseAcceptLanguage(null)).toEqual([])
    expect(parseAcceptLanguage(undefined)).toEqual([])
    expect(parseAcceptLanguage('')).toEqual([])
  })

  it('parses a single language', () => {
    expect(parseAcceptLanguage('en')).toEqual(['en'])
  })

  it('parses multiple languages sorted by quality', () => {
    expect(parseAcceptLanguage('en;q=0.8,de;q=1.0,fr;q=0.5')).toEqual([
      'de',
      'en',
      'fr',
    ])
  })

  it('treats missing q as 1.0', () => {
    expect(parseAcceptLanguage('en,de;q=0.5')).toEqual(['en', 'de'])
  })

  it('filters out q=0 entries', () => {
    expect(parseAcceptLanguage('en;q=0,de')).toEqual(['de'])
  })

  it('handles complex Accept-Language headers', () => {
    const result = parseAcceptLanguage('en-US,en;q=0.9,de-DE;q=0.8,de;q=0.7,fr;q=0.6')
    expect(result).toEqual(['en-US', 'en', 'de-DE', 'de', 'fr'])
  })

  it('handles invalid q values', () => {
    expect(parseAcceptLanguage('en;q=abc')).toEqual([])
  })
})

describe('matchLanguage', () => {
  const supported = ['en', 'de', 'fr'] as const

  it('returns exact match', () => {
    expect(matchLanguage(['de'], supported, 'en')).toBe('de')
  })

  it('returns case-insensitive match', () => {
    expect(matchLanguage(['DE'], supported, 'en')).toBe('de')
  })

  it('returns prefix match (en-US -> en)', () => {
    expect(matchLanguage(['en-US'], supported, 'de')).toBe('en')
  })

  it('returns default when no match', () => {
    expect(matchLanguage(['ja', 'ko'], supported, 'en')).toBe('en')
  })

  it('returns default for empty input', () => {
    expect(matchLanguage([], supported, 'fr')).toBe('fr')
  })

  it('prefers first match in order', () => {
    expect(matchLanguage(['fr', 'de'], supported, 'en')).toBe('fr')
  })
})

describe('findSupportedMatch', () => {
  it('returns exact match', () => {
    expect(findSupportedMatch('en-US', ['en-US', 'en-GB'], false)).toBe('en-US')
  })

  it('returns prefix match (en-US -> en)', () => {
    expect(findSupportedMatch('en-US', ['en', 'de'], false)).toBe('en')
  })

  it('does not reverse match without nonExplicitSupportedLngs', () => {
    expect(findSupportedMatch('en', ['en-US', 'en-GB'], false)).toBeUndefined()
  })

  it('reverse matches with nonExplicitSupportedLngs (en -> en-US)', () => {
    expect(findSupportedMatch('en', ['en-US', 'en-GB'], true)).toBe('en-US')
  })

  it('returns first reverse match when multiple regions exist', () => {
    expect(findSupportedMatch('de', ['en', 'de-DE', 'de-AT'], true)).toBe('de-DE')
  })

  it('prefers exact match over reverse match', () => {
    expect(findSupportedMatch('en', ['en-US', 'en'], true)).toBe('en')
  })

  it('returns undefined when no match at all', () => {
    expect(findSupportedMatch('ja', ['en', 'de'], true)).toBeUndefined()
  })
})

describe('matchLanguage with nonExplicitSupportedLngs', () => {
  const supported = ['en-US', 'en-GB', 'de-DE'] as const

  it('reverse matches base language to regional code', () => {
    expect(matchLanguage(['en'], supported, 'en-US', true)).toBe('en-US')
  })

  it('reverse matches de to de-DE', () => {
    expect(matchLanguage(['de'], supported, 'en-US', true)).toBe('de-DE')
  })

  it('does not reverse match without the flag', () => {
    expect(matchLanguage(['en'], supported, 'en-US', false)).toBe('en-US') // falls back to default
  })

  it('still prefers exact match over reverse', () => {
    const mixed = ['en-US', 'de', 'de-AT'] as const
    expect(matchLanguage(['de'], mixed, 'en-US', true)).toBe('de')
  })
})
