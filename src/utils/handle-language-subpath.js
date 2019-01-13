export default (req, lng) => {
  req.query = { ...req.query, lng }
  req.url = req.url.slice(lng.length + 1)
}
