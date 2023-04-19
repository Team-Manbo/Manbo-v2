import i18next from 'i18next'
import _ from 'lodash'
import Manbo from 'manbo'
import { InteractionCollector } from 'manbo-collector'
import { EMBED_COLORS } from '../../data/Constants'

export = {
    func: async function (message: Manbo.Message<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, suffix: Array<string>, language: string) {
        const emojis = message.channel.guild.emojis.filter(r => r.available).map(e => `\u0009 <${e.animated ? 'a' : ''}:${e.name}:${e.id}> **—** \`:${e.name}:\``)

        if (emojis.length === 0)
            return message.channel.createMessage({
                content: `${i18next.t(`${this.type}.${this.name}.no_emoji`, { ns: 'commands', lng: language })}`,
            })

        if (emojis.length <= 25)
            return message.channel.createMessage({
                embed: {
                    description: `${emojis.join('\n')}`,
                    author: {
                        name: `${i18next.t(`${this.type}.${this.name}.guild_name`, { ns: 'commands', lng: language, guild: message.channel.guild.name })}`,
                        icon_url: message.channel.guild.dynamicIconURL('jpg', 4096) || global.bot.user.dynamicAvatarURL('jpg', 4096),
                    },
                    color: EMBED_COLORS.CLEAR,
                },
            })

        const pageCount = _.chunk(emojis, 25)
        const Pages = pageCount.map(r => {
            const page = pageCount.indexOf(r)
            return {
                author: {
                    name: `${i18next.t(`${this.type}.${this.name}.guild_name`, { ns: 'commands', lng: language, guild: message.channel.guild.name })}`,
                    icon_url: message.channel.guild.dynamicIconURL('jpg', 4096),
                },
                description: `${r.join('\n')}`,
                footer: {
                    text: `${i18next.t(`${this.type}.${this.name}.page`, { ns: 'commands', lng: language, page: `${page + 1}`, length: `${pageCount.length}` })}`,
                },
                color: EMBED_COLORS.CLEAR,
            } as Manbo.EmbedOptions
        })

        const paginatorButtons: Manbo.ActionRowComponents[] = [
            {
                type: Manbo.Constants.ComponentTypes.BUTTON,
                style: Manbo.Constants.ButtonStyles.SUCCESS,
                custom_id: 'backward',
                emoji: {
                    name: '◀️',
                    id: null,
                },
            },
            {
                type: Manbo.Constants.ComponentTypes.BUTTON,
                style: Manbo.Constants.ButtonStyles.DANGER,
                custom_id: 'delete',
                emoji: {
                    name: '🗑️',
                    id: null,
                },
            },
            {
                type: Manbo.Constants.ComponentTypes.BUTTON,
                style: Manbo.Constants.ButtonStyles.SUCCESS,
                custom_id: 'forward',
                emoji: {
                    name: '▶️',
                    id: null,
                },
            },
        ]

        const msg = await message.channel.createMessage({
            embed: Pages[0],
            components: [
                {
                    type: Manbo.Constants.ComponentTypes.ACTION_ROW,
                    components: paginatorButtons,
                },
            ],
        })

        let currentPage = 0

        const collector = new InteractionCollector(global.bot, {
            interactionType: Manbo.Constants.InteractionTypes.MESSAGE_COMPONENT,
            componentType: Manbo.Constants.ComponentTypes.BUTTON,
            dispose: true,
            time: 60_000,
            filter: interaction => interaction.member!.id === message.author.id,
        })

        collector.on('collect', async collected => {
            switch (collected.data.custom_id) {
                case 'delete':
                    await msg.edit({ components: [] })
                    collector.stop('user')
                    break
                case 'forward':
                    if (currentPage + 1 === Pages.length) currentPage = 0
                    else currentPage += 1
                    await msg.edit({
                        embed: Pages[currentPage],
                        components: [
                            {
                                type: Manbo.Constants.ComponentTypes.ACTION_ROW,
                                components: paginatorButtons,
                            },
                        ],
                    })
                    break
                case 'backward':
                    if (currentPage - 1 < 0) currentPage = Pages.length - 1
                    else currentPage -= 1
                    await msg.edit({
                        embed: Pages[currentPage],
                        components: [
                            {
                                type: Manbo.Constants.ComponentTypes.ACTION_ROW,
                                components: paginatorButtons,
                            },
                        ],
                    })
                    break
            }
        })

        collector.on('end', async () => {
            await msg.edit({
                components: [],
            })
        })
    },
    name: 'emojis',
    description: 'See emoji list in the server',
    type: 'information',
    onlyCmdChannel: true,
}
