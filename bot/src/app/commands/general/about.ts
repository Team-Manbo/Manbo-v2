import cluster from 'cluster'
import i18next from 'i18next'
import { send } from '../../../miscellaneous/WebsocketClient'
import PostgresRead from '../../../database/interfaces/postgres/read'
import config from '../../../config'
import { sleep } from '../../utils/utils'
import { EMBED_COLORS } from '../../data/Constants'
import { ExtendedWorker } from '../../../../typings'
import Manbo from 'manbo'

export = {
    func: async function (message: Manbo.Message<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, suffix: Array<string>, language: string) {
        const msg = await message.channel.createMessage({
            content: `fetching bot information...`,
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

        await sleep(1_500)

        const res = await PostgresRead.getSetting(message.guildID)

        const ctx =
            `Memory Usage: \`${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)}\`MB | Shard Latency: \`${message.channel.guild.shard.id}\`ms\n\n` +
            global.bot.workerInfo.join('\n') +
            `\n> Total Guilds: \`${global.bot.guildCount}\` Total Guild Members: \`${global.bot.memberCount}\``

        return msg.edit({
            content: '',
            embeds: [
                {
                    author: {
                        name: `${i18next.t(`${this.type}.${this.name}.author_name`, { ns: 'commands', lng: language })}`,
                        icon_url: global.bot.user.dynamicAvatarURL('png', 2048),
                    },
                    description: `${i18next.t(`${this.type}.${this.name}.description`, {
                        ns: 'commands',
                        lng: language,
                        version: global.bot.VERSION,
                        name: global.bot.NAME,
                        prefix: res.prefix,
                        support: config.support,
                    })}`,
                    fields: [
                        {
                            name: i18next.t(`${this.type}.${this.name}.bot_status_name`, { ns: 'commands', lng: language }),
                            value: i18next.t(`${this.type}.${this.name}.bot_status_value`, {
                                ns: 'commands',
                                lng: language,
                                guildCount: `${global.bot.guildCount}`,
                                memberCount: `${global.bot.memberCount}`,
                                clusterID: `${cluster.worker!.id}`,
                                total: `${(cluster.worker as ExtendedWorker).totalShards}`,
                                shardID: `${message.channel.guild.shard.id}`,
                            }),
                            inline: true,
                        },
                        {
                            name: i18next.t(`${this.type}.${this.name}.shard_status_name`, { ns: 'commands', lng: language }),
                            value: i18next.t(`${this.type}.${this.name}.shard_status_value`, {
                                ns: 'commands',
                                lng: language,
                                guildCount: `${global.bot.guilds.size}`,
                                memberCount: `${global.bot.guilds.reduce((a, b) => a + b.memberCount, 0)}`,
                                channelCount: `${Object.values(global.bot.channelGuildMap).length}`,
                            }),
                            inline: true,
                        },
                    ],
                    footer: {
                        text: i18next.t(`${this.type}.${this.name}.last_restart`, { ns: 'commands', lng: language }),
                    },
                    timestamp: new Date(Date.now() - process.uptime() * 1000).toISOString(),
                    color: EMBED_COLORS.CLEAR,
                },
            ],
        })
    },
    name: 'about',
    description: 'about bot information',
    type: 'general',
    hidden: true,
}
