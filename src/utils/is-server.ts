import isNode from 'detect-node'

export default () => isNode && typeof window === 'undefined'
