import Manbo from 'manbo'
import i18next from 'i18next'
import { checkBasic, getDispatcher, convertTime } from '../../utils/audio'
import { InteractionCollector } from 'manbo-collector'
import { ExtendedTrack } from '../../../../typings'

export = {
    func: async function (message: Manbo.Message<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, suffix: Array<string>, language: string) {
        const basicCheck = checkBasic(message.member, language)
        if (typeof basicCheck === 'string')
            return message.channel.createMessage({
                content: `${basicCheck}`,
            })
        const dispatcher = getDispatcher(message.guildID, language)
        if (typeof dispatcher === 'string')
            return message.channel.createMessage({
                content: `${dispatcher}`,
            })

        if (!dispatcher.queue.length)
            return message.channel.createMessage({
                content: `${i18next.t(`${this.type}.${this.name}.no_tracks_in_queue`, { ns: 'commands', lng: language })}`,
            })
        const playList = dispatcher.queue.map((t: ExtendedTrack, i: number) => `**${++i}. ${t.info.title}** • \`${convertTime(t.info.length)}\` • ${t.requester ? t.requester.mention : 'Unknown'}`)
        const chunked = chunk(playList, 10).map(x => x.join('\n'))
        const page = 0

        const msg = await message.channel.createMessage({
            embed: {
                description: chunked[page],
                title: `${i18next.t(`${this.type}.${this.name}.current_playlist`, { ns: 'commands', lng: language, num: `${dispatcher.queue.length}` })}`,
                footer: {
                    text: `${i18next.t(`${this.type}.${this.name}.page`, { ns: 'commands', lng: language, page: `${page + 1}`, total: `${chunked.length}` })}`,
                },
                color: global.bot.Constants.EMBED_COLORS.DEFAULT
            },
            components: [
                {
                    type: Manbo.Constants.ComponentTypes.ACTION_ROW,
                    components: [
                        {
                            type: Manbo.Constants.ComponentTypes.BUTTON,
                            custom_id: `${page - 1}`,
                            style: Manbo.Constants.ButtonStyles.SUCCESS,
                            label: `${i18next.t(`${this.type}.${this.name}.previous`, { ns: 'commands', lng: language })}`,
                            emoji: {
                                id: null,
                                name: '⏮',
                            },
                        },
                        {
                            type: Manbo.Constants.ComponentTypes.BUTTON,
                            custom_id: `${page + 1}`,
                            style: Manbo.Constants.ButtonStyles.SUCCESS,
                            label: `${i18next.t(`${this.type}.${this.name}.next`, { ns: 'commands', lng: language })}`,
                            emoji: {
                                id: null,
                                name: '⏭',
                            },
                        },
                    ],
                },
            ],
        })

        const collector = new InteractionCollector(global.bot, {
            interactionType: Manbo.Constants.InteractionTypes.MESSAGE_COMPONENT,
            componentType: Manbo.Constants.ComponentTypes.BUTTON,
            time: 60_000,
            dispose: true,
        })

        collector.on('collect', async collected => {
            if (collected.member!.id !== message.author.id) {
                await collected.defer(64)
                return collected.createFollowup({
                    content: `${i18next.t(`${this.type}.${this.name}.cmd_executor`, { ns: 'commands', lng: language })}`,
                    flags: 64,
                })
            }

            let customID = Number(collected.data.custom_id)
            if (customID > chunked.length - 1) customID = 0
            else if (customID < 0) customID = chunked.length - 1

            await collected.editParent({
                embeds: [
                    {
                        description: chunked[customID],
                        title: `${i18next.t(`${this.type}.${this.name}.current_playlist`, { ns: 'commands', lng: language, num: `${dispatcher.queue.length}` })}`,
                        footer: {
                            text: `${i18next.t(`${this.type}.${this.name}.page`, { ns: 'commands', lng: language, page: `${customID + 1}`, total: `${chunked.length}` })}`,
                        },
                        color: global.bot.Constants.EMBED_COLORS.DEFAULT
                    },
                ],
                components: [
                    {
                        type: Manbo.Constants.ComponentTypes.ACTION_ROW,
                        components: [
                            {
                                type: Manbo.Constants.ComponentTypes.BUTTON,
                                custom_id: `${customID - 1}`,
                                style: Manbo.Constants.ButtonStyles.SUCCESS,
                                label: `${i18next.t(`${this.type}.${this.name}.previous`, { ns: 'commands', lng: language })}`,
                                emoji: {
                                    id: null,
                                    name: '⏮',
                                },
                            },
                            {
                                type: Manbo.Constants.ComponentTypes.BUTTON,
                                custom_id: `${customID + 1}`,
                                style: Manbo.Constants.ButtonStyles.SUCCESS,
                                label: `${i18next.t(`${this.type}.${this.name}.next`, { ns: 'commands', lng: language })}`,
                                emoji: {
                                    id: null,
                                    name: '⏭',
                                },
                            },
                        ],
                    },
                ],
            })
        })

        collector.on('end', async () => {
            await msg.edit({
                components: [],
            })
        })
    },
    name: 'playlist',
    description: 'playlist',
    type: 'music',
    onlyCmdChannel: true,
}

function chunk(arr: Array<any>, size: number) {
    const temp: Array<Array<ExtendedTrack>> = []
    for (let i = 0; i < arr.length; i += size) {
        temp.push(arr.slice(i, i + size))
    }
    return temp
}
