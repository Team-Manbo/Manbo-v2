import { Redis } from 'ioredis'

declare global {
    var redis: Redis
}
