import pathMatch from 'path-match'

const route = pathMatch()

export default allLanguages => (req, res, next) => {
  const langRoute = route(`/:lng(${allLanguages.join('|')})/*`)

  const params = langRoute(req.url)

  if (params) {
    const { lng } = params
    req.query = { ...req.query, lng }
    req.url = req.url.replace(`/${lng}`, '')
  }

  next()
}
