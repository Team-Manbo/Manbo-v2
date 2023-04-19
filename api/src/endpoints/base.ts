import { RequestHandler } from 'express'
import { endpoint } from '../functions/endpoint'
import { HttpError } from '../utils/httpError'

export const base = endpoint(async (req, res) => {
  res.status(200).json({
    Manbo: {
      support: 'https://manbo.me/support',
      invite: 'https://manbo.me/invite',
      api: 'use /docs endpoint for docs'
    },
  })
})