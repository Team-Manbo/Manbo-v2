import { Guild, Member } from 'manbo'
import cluster from 'cluster'
import { send } from '../../../miscellaneous/WebsocketClient'
import { sleep } from '../../utils/utils'
import { ExtendedWorker } from '../../../../typings'

export = {
    name: 'guildDelete',
    type: 'on',
    handle: async (guild: Guild, member: Member) => {
        await global.redis.hset('API-info-guildCount', (cluster.worker as ExtendedWorker).rangeForShard, global.bot.guilds.size)
    },
}
