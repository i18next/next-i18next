import { Response } from 'express'

export const redirectWithoutCache = (res: Response, redirectLocation: string) => {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate')
  res.header('Expires', '-1')
  res.header('Pragma', 'no-cache')
  res.redirect(302, redirectLocation)
}
