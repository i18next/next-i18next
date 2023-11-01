import { FallbackLng, FallbackLngObjList } from 'i18next'
import { useLayoutEffect, useEffect } from 'react'

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
    const fallbackDefault = (fallbackLng as FallbackLngObjList)
      .default
    return [...(fallbackList ?? []), ...(fallbackDefault ?? [])]
  }

  if (typeof fallbackLng === 'function') {
    return getFallbackForLng(lng, fallbackLng(lng))
  }

  return []
}

export const unique = (list: string[]) =>
  Array.from(new Set<string>(list))

/**
 * This hook behaves like `useLayoutEffect` on the client,
 * and `useEffect` on the server(no effect).
 *
 * Since using `useLayoutEffect` on the server cause warning messages in nextjs,
 * this hook is workaround for that.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect
