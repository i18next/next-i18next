// Detects if in CI mode due language used
// https://www.i18next.com/overview/api#changelanguage
export const isCIMode = (language: string) => language === 'cimode'
