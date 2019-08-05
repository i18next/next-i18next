import React from 'react'

export default (WrappedComponent, config) => {
  class WithInternals extends React.Component {
    static displayName = `withnextI18NextInternals(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`

    render() {
      return (
        <WrappedComponent
          {...this.props}
          nextI18NextInternals={config}
        />
      )
    }
  }

  return WithInternals
}
