import React from 'react'

export default (WrappedComponent, config) => {
  class WithConfig extends React.Component {
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
