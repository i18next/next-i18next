import React from 'react'

export default (WrappedComponent, config) => {
  class WithConfig extends React.Component {
    static getInitialProps(ctx) {
      if (WrappedComponent.getInitialProps) {
        return WrappedComponent.getInitialProps(ctx)
      }

      return {}
    }

    render() {
      return (
        <WrappedComponent
          {...this.props}
          nextI18NextConfig={config}
        />
      )
    }
  }

  WithConfig.displayName = `withNextI18NextConfig(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`

  return WithConfig
}
