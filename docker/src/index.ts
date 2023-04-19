import * as dotenv from 'dotenv'
dotenv.config()

global.logger = require('./miscellaneous/Logger')
global.webhook = require('./miscellaneous/WebhookLogger')

import app from './app'
;(async () => {
  app.listen(process.env.API_PORT, () => {
    console.info(`🟢 Listening at http://localhost:${process.env.API_PORT}`)
    global.webhook.custom({ title: 'Init', description: `[Docker Controller] Listening at http://localhost:${process.env.API_PORT}` })
  })
})().catch(err => {
  console.log(err)
  process.exit(1)
})
