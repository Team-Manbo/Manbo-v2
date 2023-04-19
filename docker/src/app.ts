import express from 'express'
import cors from 'cors'
import { json } from 'body-parser'
import { readdirSync } from 'fs'
import { join } from 'path'
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

/**
 * checkCache middleware
 * using redis for database
 * check if there is a cache saved in database
 * and return if true, next() if false
 */

/*
checkCache = (res, req, next) => {
    redis.get(req.url, (err, data) => {
        if (err) {
            console.log(err)
            res.status(500).send(err)
        }
        if (data !== null)
            res.send(data)
        else
            next()
    })
}
*/

export default app
