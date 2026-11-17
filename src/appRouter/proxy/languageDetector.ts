/**
 * Edge-safe Accept-Language parser and language matcher.
 * No external dependencies — runs in Edge Runtime, Node.js, and browser.
 */

export function parseAcceptLanguage(header: string | null | undefined): string[] {
  if (!header) return []
  return header
    .split(',')
    .map(part => {
      const [lang, qPart] = part.trim().split(';')
      const q = qPart?.trim().startsWith('q=')
        ? parseFloat(qPart.trim().slice(2))
        : 1.0
      return { lang: lang.trim(), q: isNaN(q) ? 0 : q }
    })
    .filter(item => item.lang && item.q > 0)
    .sort((a, b) => b.q - a.q)
    .map(item => item.lang)
}

/**
 * Find a matching supported language for a given code, respecting nonExplicitSupportedLngs.
 *
 * Matching order (mirrors i18next's LanguageUtils.getBestMatchFromCodes):
 * 1. Exact match (case-insensitive)
 * 2. Preferred prefix → supported base: script first (e.g. preferred 'zh-Hant-TW' matches
 *    supported 'zh-Hant'), then language (e.g. preferred 'en-US' matches supported 'en')
 * 3. If nonExplicitSupportedLngs: preferred base → supported region
 *    (e.g. preferred 'en' matches supported 'en-US')
 */
export function findSupportedMatch(
  code: string,
  supportedLanguages: readonly string[],
  nonExplicitSupportedLngs: boolean,
): string | undefined {
  const lower = code.toLowerCase()

  // 1. Exact match (case-insensitive)
  const exact = supportedLanguages.find(l => l.toLowerCase() === lower)
  if (exact) return exact

  // 2. Preferred prefix → supported base (e.g. 'zh-Hant-TW' → 'zh-Hant', 'en-US' → 'en')
  const parts = lower.split('-')
  const prefix = parts[0]
  const scriptPart = parts.length > 2 ? parts.slice(0, -1).join('-') : undefined
  const partial =
    supportedLanguages.find(l => l.toLowerCase() === scriptPart) ??
    supportedLanguages.find(l => l.toLowerCase() === prefix)
  if (partial) return partial

  // 3. Reverse match: preferred base → supported region (e.g. 'en' → 'en-US')
  if (nonExplicitSupportedLngs) {
    const reverse = supportedLanguages.find(
      l => l.toLowerCase().split('-')[0] === prefix
    )
    if (reverse) return reverse
  }

  return undefined
}

export function matchLanguage(
  acceptLanguages: string[],
  supportedLanguages: readonly string[],
  defaultLanguage: string,
  nonExplicitSupportedLngs = false,
): string {
  for (const preferred of acceptLanguages) {
    const match = findSupportedMatch(preferred, supportedLanguages, nonExplicitSupportedLngs)
    if (match) return match
  }
  return defaultLanguage
}
