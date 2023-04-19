import { RequestHandler } from 'express'
import { listenerCount } from 'process'
import { endpoint } from '../functions/endpoint'
import { HttpError } from '../utils/httpError'

export const info = endpoint(async (req, res) => {
    const guilds = await global.redis.hgetall('API-info-guildCount')

    res.status(200).json({
        guildCount: Object.values(guilds).reduce((a, b) => Number(b), 0),
    })
})
