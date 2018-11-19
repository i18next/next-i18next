const express = require('express')
const next = require('next')
const { nextI18NextMiddleware } = require('./i18n')

const app = next({ dev: process.env.NODE_ENV !== 'production' })
const handle = app.getRequestHandler();

(async () => {
  await app.prepare()
  const server = express()

  nextI18NextMiddleware(app, server)

  server.get('*', (req, res) => handle(req, res))

  await server.listen(3000)
  console.log('> Ready on http://localhost:3000')
})()
