import isNode from 'detect-node'

export const isServer = () => isNode && typeof window === 'undefined'
