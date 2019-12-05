export const addSubpath = (url: string, subpath: string) =>
  url
    .replace('/', `/${subpath}/`)
    .replace(/(https?:\/\/)|(\/)+/g, "$1$2")
    .replace(/\/$/, '')