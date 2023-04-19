import * as dotenv from 'dotenv'
dotenv.config()

global.BOT_TOKEN = process.env.version === 'v1' ? process.env.BOT_TOKEN : process.env.BOT_TOKEN_2

global.PG_HOST = process.env.docker === 'true' ? process.env.PG_HOST_DOCKER : process.env.PG_HOST
global.REDIS_HOST = process.env.docker === 'true' ? process.env.REDIS_HOST_DOCKER : process.env.REDIS_HOST

global.logger = require('./miscellaneous/Logger')
global.webhook = require('./miscellaneous/WebhookLogger')

global.DISCORD_API_URL = process.env.USE_TWILIGHT === 'true' ? `http://${process.env.TWILIGHT_HOST}:${process.env.TWILIGHT_PORT}/api/v10` : 'https://discord.com/api/v10'

import AesChiper from './miscellaneous/AesChiper'
global.aes = AesChiper 

global.logger.startup(`[WebSocket Server] Init`)
require('./apps/WebSocketServer')

global.logger.startup('[Redis Subscriber] Init')
require('./apps/RedisSubscribe')