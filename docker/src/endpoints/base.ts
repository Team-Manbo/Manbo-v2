import { RequestHandler } from 'express'
import { endpoint } from '../functions/endpoint'
import { HttpError } from '../utils/httpError'

export const base = endpoint(async (req, res) => {
  global.logger.info(`endpoint 'base' called`)
  global.webhook.custom({title: 'Endpoint Called', description: `Endpoint \`base\` called`})
  res.status(200).json({
    Manbo: {
      support: 'https://manbo.me/support',
      invite: 'https://manbo.me/invite',
    },
  })
})
