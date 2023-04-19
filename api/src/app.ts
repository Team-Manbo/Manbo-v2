import express from 'express'
import cors from 'cors'
import { json } from 'body-parser'
import { readdirSync } from 'fs'
import morgan from 'morgan'
import { exception } from './utils/exception'
import { notFound } from './utils/notFound'

const app = express()

app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal'])

app.use(cors())
app.use(json())

app.use(morgan('combined', { skip: () => process.env.NODE_ENV !== 'log' }))

const routes = readdirSync(process.cwd() + '/dist/src/routes')

for (const route of routes) {
  app.use(require(process.cwd() + `/dist/src/routes/${route}`).default)
}

app.use(exception)
app.use(notFound)

export default app