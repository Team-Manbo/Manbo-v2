import * as dotenv from 'dotenv'
dotenv.config()

global.BOT_TOKEN = process.env.version === 'v1' ? process.env.BOT_TOKEN : process.env.BOT_TOKEN_2

global.PG_HOST = process.env.docker === 'true' ? process.env.PG_HOST_DOCKER : process.env.PG_HOST
global.REDIS_HOST = process.env.docker === 'true' ? process.env.REDIS_HOST_DOCKER : process.env.REDIS_HOST

global.logger = require('./miscellaneous/Logger')
global.webhook = require('./miscellaneous/WebhookLogger')

import cluster from 'cluster'

global.cluster = cluster

import AesChiper from './miscellaneous/AesChiper'
global.aes = AesChiper

if (cluster.isPrimary) {
    global.logger.startup(`Master node init`)
    require('./primary')
} else {
    require('./replica')
}
