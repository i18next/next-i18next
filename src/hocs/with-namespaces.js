import { withNamespaces } from 'react-i18next'

export default function (namespaces = [], options = {}) {
  this.i18n.nsFromReactTree = [...new Set(this.i18n.nsFromReactTree.concat(namespaces))]
  return withNamespaces(namespaces, options)
}
