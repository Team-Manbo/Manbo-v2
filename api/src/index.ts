import * as dotenv from 'dotenv'
dotenv.config()

global.logger = require('./miscellaneous/Logger')

global.PG_HOST = process.env.docker === 'true' ? process.env.PG_HOST_DOCKER : process.env.PG_HOST
global.REDIS_HOST = process.env.docker === 'true' ? process.env.REDIS_HOST_DOCKER : process.env.REDIS_HOST

import redisClient from './miscellaneous/Redis'
global.redis = redisClient

import app from './app'

;(async () => {
    app.listen(process.env.API_PORT, () => {
        console.info(`🟢 Listening at  port ${process.env.API_PORT}`)
    })
})().catch(err => {
    global.logger.info(err)
    process.exit(1)
})
