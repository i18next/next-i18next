import { Response } from 'express'

export const redirectWithoutCache = (res: Response, Location: string) => {
  res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate')
  res.setHeader('Expires', '-1')
  res.setHeader('Pragma', 'no-cache')
  res.writeHead(302, { Location })
  res.end()
}
