import React from 'react'
import { WithRouterProps, ExcludeRouterProps } from 'next/dist/client/with-router'
import { NextComponentType, NextPageContext } from 'next-server/dist/lib/utils'

import { UseRouterHook } from '../../types'

export const createWithRouter = (useRouter: UseRouterHook) => {
  const withRouter = <
    P extends WithRouterProps,
    C = NextPageContext
  >(
    ComposedComponent: NextComponentType<C, any, P>
  ): React.ComponentType<ExcludeRouterProps<P>> => {
    function WithRouterWrapper(props: any) {
      return <ComposedComponent router={useRouter()} {...props} />
    }

    WithRouterWrapper.getInitialProps = ComposedComponent.getInitialProps
    // This is needed to allow checking for custom getInitialProps in _app
    ;(WithRouterWrapper as any).origGetInitialProps = (ComposedComponent as any).origGetInitialProps
    if (process.env.NODE_ENV !== 'production') {
      const name =
        ComposedComponent.displayName || ComposedComponent.name || 'Unknown'
      WithRouterWrapper.displayName = `withRouter(${name})`
    }

    return WithRouterWrapper
  }

  return withRouter
}
