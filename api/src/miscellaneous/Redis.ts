import Redis from 'ioredis'

export default new Redis({
  host: global.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT as string) || 6379,
})