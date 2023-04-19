import cluster from 'cluster'
// import sniffWebhook from './sniffWebhook'
import listenerIndexer from './listenerIndexer'
import eventMiddleware from '../modules/eventMiddleware'

import { ExtendedWorker } from '../../../typings'

let webhookErrorCount: number = 0
let lastRetryAfter

export default async () => {
  global.bot.on('global-ratelimit-hit', timeLeft => {
    // using global. instead of just passing the bot instance is lazy
    global.webhook.error(`${new Date().toISOString()} [${(cluster.worker as ExtendedWorker).rangeForShard}] global ratelimit hit, time remaining: ${timeLeft}`)
    console.warn(`${new Date().toISOString()} [${(cluster.worker as ExtendedWorker).rangeForShard}] global ratelimit hit, time remaining: ${timeLeft}`)
    // statAggregator.incrementEvent('global-ratelimit-hit')
    // global.redis.set('logger-global', timeLeft, 'EX', timeLeft)
  })

  global.bot.on('ratelimit-hit', info => {
    // statAggregator.incrementEvent('ratelimit-hit')
    console.warn(`${new Date().toISOString()} [${(cluster.worker as ExtendedWorker).rangeForShard}] ratelimit hit, is ${!info.global && 'not '}global`, info.info)
  })

  global.bot.on('webhook-ratelimit-hit', async d => {
    webhookErrorCount++
    lastRetryAfter = d.retryAfter
    if (webhookErrorCount % 10 === 0) {
      console.warn(
        `${new Date().toISOString()} [${(cluster.worker as ExtendedWorker).rangeForShard}] webhook ratelimit error mod 10 hit rt after | error count | webhook id`,
        lastRetryAfter,
        webhookErrorCount,
        d.webhookID,
      )
      /* const troublesomeKey = await sniffWebhook(d.webhookID)
      if (troublesomeKey) {
        console.log(`Troublesome webhook 429ing key: ${troublesomeKey}`)
      } else {
        console.warn('Failed to match 429ing webhook key')
      } */
    }
    // statAggregator.incrementEvent('webhook-ratelimit-hit')
  })

  const [on, once] = await listenerIndexer()

  on.forEach(async event => eventMiddleware(event, 'on'))
  once.forEach(async event => eventMiddleware(event, 'once'))
}
