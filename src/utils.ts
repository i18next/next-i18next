import { FallbackLng, FallbackLngObjList } from 'i18next'

export const getFallbackForLng = (
  lng: string,
  fallbackLng: false | FallbackLng
): string[] => {
  if (typeof fallbackLng === 'string') {
    return [fallbackLng]
  }

  if (Array.isArray(fallbackLng)) {
    return fallbackLng
  }

  if (typeof fallbackLng === 'object') {
    const fallbackList = (fallbackLng as FallbackLngObjList)[lng]
    const fallbackDefault = (fallbackLng as FallbackLngObjList).default
    return [...(fallbackList ?? []), ...fallbackDefault ?? []]
  }

  if (typeof fallbackLng === 'function') {
    return getFallbackForLng(lng, fallbackLng(lng))
  }

  return []
}

export const unique = (list: string[]) => Array.from(new Set<string>(list))
