import cluster from 'cluster'
import { send } from '../../../miscellaneous/WebsocketClient'
import { sleep } from '../../utils/utils'

import { ExtendedWorker } from '../../../../typings'
import Manbo from 'manbo'

export = {
  func: async function (message: Manbo.Message<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, suffix: Array<string>, language: string) {
    const msg = await message.channel.createMessage({
      content: `fetching worker information...`,
    })

    global.bot.guildCount = 0
    global.bot.userCount = 0
    global.bot.memberCount = 0
    global.bot.workerInfo = []
    send({
      op: '3000',
      c: {
        originalWorkerId: cluster.worker!.id,
        originalShardId: (cluster.worker as ExtendedWorker).id,
      },
    })

    await sleep(2_000)

    const ctx =
      `Memory Usage: \`${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)}\`MB | Shard Latency: \`${message.channel.guild.shard.id}\`ms\n\n` +
      global.bot.workerInfo.join('\n') +
      `\n> Total Guilds: \`${global.bot.guildCount}\` Total Guild Members: \`${global.bot.memberCount}\``

    return msg.edit(ctx)
  },
  name: 'devstats',
  description: 'devstats',
  type: 'developer',
  hidden: true,
}
