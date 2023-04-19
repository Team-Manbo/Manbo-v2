import Manbo from 'manbo'
import i18next from 'i18next'
import Shoukaku from 'shoukaku'
import config from '../../../config'
import { v4 as uuid } from 'uuid'
import { InteractionCollector } from 'manbo-collector'
import { convertTime } from '../../utils/audio'
import { ExtendedTrack } from '../../../../typings/index'

export = {
    func: async function (message: Manbo.Message<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, suffix: Array<string>, language: string) {
        if (!message.member.voiceState.channelID)
            return message.channel.createMessage({
                content: `${i18next.t(`music.no_vc`, { ns: 'translations', lng: language })}`,
            })

        if (!suffix[0])
            return message.channel.createMessage({
                content: `${i18next.t(`${this.type}.${this.name}.no_query`, { ns: 'commands', lng: language })}`,
            })

        const node = global.bot.manager.getNode()
        if (!node)
            return message.channel.createMessage({
                content: `${i18next.t(`${this.type}.${this.name}.no_node_server`, { ns: 'commands', lng: language, support: `${config.support}` })}`,
            })

        const query = suffix.join(' ')
        if (checkURL(query)) {
            const result = await node.rest.resolve(query)
            if (!result?.tracks.filter(r => r.info.isSeekable && !r.info.isStream).length)
                return message.channel.createMessage({
                    content: `${i18next.t(`${this.type}.${this.name}.no_result`, { ns: 'commands', lng: language })}`,
                })
            result.tracks = result.tracks.filter(r => r.info.isSeekable && !r.info.isStream)
            if (result.loadType === 'LOAD_FAILED')
                return message.channel.createMessage({
                    content: `${i18next.t(`${this.type}.${this.name}.load_fail`, { ns: 'commands', lng: language })}`,
                })
            else if (result.loadType === 'NO_MATCHES')
                return message.channel.createMessage({
                    content: `${i18next.t(`${this.type}.${this.name}.cannot_fetch_track`, { ns: 'commands', lng: language })}`,
                })
            else if (result.loadType === 'SEARCH_RESULT')
                return message.channel.createMessage({
                    content: `${i18next.t(`${this.type}.${this.name}.cannot_fetch_track`, { ns: 'commands', lng: language })}`,
                })
            else {
                // result.loadType === 'TRACK_LOADED' or 'PLAYLIST_LOADED' , no other load types
                const track = result.tracks.shift()
                const dispatcher = await global.bot.queue.handle(message.channel.guild, message.member, message.channel, node, track as Shoukaku.Track, message.author)
                if (dispatcher === 'Busy')
                    return message.channel.createMessage({
                        content: `${i18next.t(`${this.type}.${this.name}.connecting_to_vc`, { ns: 'commands', lng: language })}`,
                    })
                if (result.loadType === 'PLAYLIST_LOADED') {
                    for (const trackEl of result.tracks) await global.bot.queue.handle(message.channel.guild, message.member, message.channel, node, trackEl, message.author)
                    await message.channel.createMessage({
                        embed: {
                            color: global.bot.Constants.EMBED_COLORS.DEFAULT,
                            description: `${i18next.t(`${this.type}.${this.name}.playlist_added`, { ns: 'commands', lng: language, name: `${result.playlistInfo.name}` })}\n\n> **${
                                result.playlistInfo.name
                            }** • \`${result.tracks.length} ${i18next.t(`${this.type}.${this.name}.tracks`, { ns: 'commands', lng: language })}\` • \`${convertTime(
                                result.tracks.map(r => r.info.length).reduce((a, b) => a + b, 0),
                            )}\``,
                        },
                    })
                } else if (result.loadType === 'TRACK_LOADED') {
                    await message.channel.createMessage({
                        // this cant be undefined, maybe not
                        content: `${i18next.t(`${this.type}.${this.name}.track_added`, { ns: 'commands', lng: language, name: `${track!.info.title}` })}\n\n> **${
                            track!.info.title
                        }** • \`${convertTime(track!.info.length)}\``,
                    })
                }
                dispatcher?.play()
                if (dispatcher?.queue)
                    dispatcher.queue = balancedShuffle(dispatcher.queue)
            }
        } else {
            const result_search = await node.rest.resolve(`ytsearch:${query}`)
            if (!result_search?.tracks.filter(r => r.info.isSeekable && !r.info.isStream).length)
                return message.channel.createMessage({
                    content: `${i18next.t(`${this.type}.${this.name}.no_result`, { ns: 'commands', lng: language })}`,
                })
            result_search.tracks = result_search.tracks.filter(r => r.info.isSeekable && !r.info.isStream)
            if (result_search.loadType === 'LOAD_FAILED')
                return message.channel.createMessage({
                    content: `${i18next.t(`${this.type}.${this.name}.load_fail`, { ns: 'commands', lng: language })}`,
                })
            if (result_search.loadType === 'NO_MATCHES')
                return message.channel.createMessage({
                    content: `${i18next.t(`${this.type}.${this.name}.no_result`, { ns: 'commands', lng: language })}`,
                })
            let selectMenuComponents: Array<Manbo.SelectMenuOptions> = []
            for (let trackInfo of result_search.tracks.slice(0, 25)) {
                let audioID = uuid()
                await global.redis.set(`audio-${message.member.id}-${message.id}-${audioID}`, JSON.stringify(trackInfo), 'EX', 33)
                selectMenuComponents.push({
                    label: `${trackInfo.info.title}`,
                    value: `audio-${message.member.id}-${message.id}-${audioID}`,
                })
            }
            const msg = await message.channel.createMessage({
                content: `${message.member.mention}, ${i18next.t(`${this.type}.${this.name}.select`, { ns: 'commands', lng: language })}`,
                components: [
                    {
                        type: Manbo.Constants.ComponentTypes.ACTION_ROW,
                        components: [
                            {
                                type: Manbo.Constants.ComponentTypes.STRING_SELECT,
                                custom_id: 'track_search_select',
                                placeholder: `${i18next.t(`${this.type}.${this.name}.select_placeholder`, { ns: 'commands', lng: language })}`,
                                options: selectMenuComponents,
                            },
                        ],
                    },
                ],
            })
            const collector = new InteractionCollector(global.bot, {
                interactionType: Manbo.Constants.InteractionTypes.MESSAGE_COMPONENT,
                componentType: Manbo.Constants.ComponentTypes.STRING_SELECT,
                time: 30_000,
                dispose: true,
                message: msg,
            })

            collector.on('collect', async collected => {
                if (collected.member!.id !== message.author.id) {
                    await collected.defer(64)
                    return collected.createFollowup({
                        content: `${i18next.t(`${this.type}.${this.name}.cmd_executor`, { ns: 'commands', lng: language })}`,
                        flags: 64,
                    })
                }
                // JSON.parse(...) cannot be null
                const track_search: Shoukaku.Track = JSON.parse((await global.redis.get(`${collected.data.values[0]}`))!)
                const dispatcher = await global.bot.queue.handle(message.channel.guild, message.member, message.channel, node, track_search, message.author)
                if (dispatcher === 'Busy') {
                    await collected.defer(64)
                    return collected.createFollowup({
                        content: `${i18next.t(`${this.type}.${this.name}.connecting_to_vc`, { ns: 'commands', lng: language })}`,
                        flags: 64,
                    })
                }
                await message.channel.createMessage({
                    content: `${i18next.t(`${this.type}.${this.name}.track_added`, { ns: 'commands', lng: language, name: `${track_search.info.title}` })}\n\n> **${
                        track_search.info.title
                    }** • \`${convertTime(track_search.info.length)}\``,
                })
                collector.stop()
                dispatcher?.play()
                if (dispatcher?.queue)
                    dispatcher.queue = balancedShuffle(dispatcher.queue)
            })

            collector.on('end', async (collected, reason) => {
                if (reason === 'time')
                    await msg.edit({
                        content: `${i18next.t(`${this.type}.${this.name}.timed_out`, { ns: 'commands', lng: language })}`,
                        components: [],
                    })
                else await msg.delete()
                const stream = global.redis.scanStream({
                    match: `audio-${message.member.id}-${message.id}-*`,
                })
                stream.on('data', function (keys) {
                    if (keys.length) {
                        let pipeline = global.redis.pipeline()
                        keys.forEach(function (key: string) {
                            pipeline.del(key)
                        })
                        pipeline.exec()
                    }
                })
                stream.on('end', () => {})
            })
        }
    },
    name: 'play',
    description: 'play',
    type: 'music',
    onlyCmdChannel: true,
    botPerm: ['voiceConnect', 'voiceSpeak', 'voiceRequestToSpeak'],
}

function checkURL(url: string): boolean {
    try {
        new URL(url)
        return true
    } catch (error) {
        return false
    }
}

function balancedShuffle(someArray: ExtendedTrack[]): ExtendedTrack[] {
    const obj = {}
    for (const ele of someArray) {
        if (ele.requester.username in obj) {
            obj[ele.requester.username].push(ele)
        } else {
            obj[ele.requester.username] = [ele]
        }
    }
    const nestedArray: any = Object.entries(obj)
    // nestedArray.sort((a, b) => a[0].localeCompare(b[0]));
    const resultArray: ExtendedTrack[] = []
    while (nestedArray.length > 0) {
        for (let i = 0; i < nestedArray.length; i++) {
            resultArray.push(nestedArray[i][1].shift())
            if (nestedArray[i][1].length === 0) {
                nestedArray.splice(i, 1)
                i--
            }
        }
    }
    return resultArray
}
