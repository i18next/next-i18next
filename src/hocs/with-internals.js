import React from 'react'

export default (WrappedComponent, config) => {
  class withInternals extends React.Component {
    render() {
      return (
        <WrappedComponent
          {...this.props}
          nextI18NextInternals={config}
        />
      )
    }
  }

  withInternals.displayName = `withnextI18NextInternals(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`

  return withInternals
}
