import { useEffect, useState } from 'react'
import { SingletonRouter } from 'next/router'
import { wrapRouter } from '../router'
import { NextI18NextInternals, UseRouterHook } from '../../types'


/**
 * create a hook that need to be reactive when the Router is updated (with
 * asPath in particular)
 */
export const createUseRouter = (internals: NextI18NextInternals): UseRouterHook => {
  const useRouter = (): SingletonRouter => {
    const [router, setRouter] = useState(wrapRouter(internals))

    const updateRouter = () => {
      setRouter(wrapRouter(internals))
    }

    useEffect(() => {
      // TODO should routeChangeStart and routeChangeError be included, it all
      // depends when asPath changes
      // router.events.on('routeChangeStart', updateRouter)
      router.events.on('routeChangeComplete', updateRouter)
      // router.events.on('routeChangeError', updateRouter)

      return () => {
        // router.events.off('routeChangeStart', updateRouter)
        router.events.off('routeChangeComplete', updateRouter)
        // router.events.off('routeChangeError', updateRouter)
      }
    }, [])

    return router
  }

  return useRouter
}
