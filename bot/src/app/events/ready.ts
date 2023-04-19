import cluster from 'cluster'
import { send } from '../../miscellaneous/WebsocketClient'
import { ExtendedWorker } from '../../../typings'
import { request } from 'undici'

export = {
    name: 'ready',
    type: 'once',
    handle: async () => {
        await global.redis.set('zeroDowntimeUUID', process.env.uuid!)
        for (let eventName of global.bot.typeOnEvent) {
            await global.redis.set(`event-${eventName}`, process.env.uuid!)
        }
        for (let eventName of global.bot.typeOnceEvent) {
            await global.redis.set(`event-${eventName}`, process.env.uuid!)
        }
        send({
            op: '1',
            c: {
                restart: false,
                uuid: process.env.uuid,
            },
        })
        const { body } = await request(`${process.env.DOCKER_CONTROLLER_API}/api/docker?uuid=${process.env.uuid === 'no1' ? 'no2' : 'no1'}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${process.env.DOCKER_CONTROLLER_API_KEY}`,
            },
        })
        const res = await body.json()
        global.logger.info(`container stopped: ${res.container}, status: ${res.status}`)
        global.webhook.custom({ title: `Status: ${res.status}`, description: `stopped container: ${res.container}` })

        // statAggregator.incrementMisc('ready')
        global.logger.info(
            `Worker instance hosting \`${(cluster.worker as ExtendedWorker).rangeForShard}\` on id ${
                (cluster.worker as ExtendedWorker).id
            } is now ready to serve requests. This shard or shard range has ${global.bot.guilds.size} guilds and ${global.bot.users.size} users cached.`,
        )
        // global.webhook.generic(`Worker instance hosting \`${(cluster.worker as ExtendedWorker).rangeForShard}\` on id ${(cluster.worker as ExtendedWorker).id} is now ready to serve requests. This shard or shard range has ${global.bot.guilds.size} guilds and ${global.bot.users.size} users cached.`)
        /*
        global.bot.editStatus('online', {
            name: `https://manbo.gg | ${(cluster.worker as ExtendedWorker).rangeForShard} | Watching ${global.bot.guilds.size} guilds`
        })
        */
       
        await global.redis.hset('API-info-guildCount', (cluster.worker as ExtendedWorker).rangeForShard, global.bot.guilds.size)
    },
}
