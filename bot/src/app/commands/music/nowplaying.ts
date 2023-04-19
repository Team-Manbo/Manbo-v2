import Manbo from 'manbo'
import i18next from 'i18next'
import createBar from 'string-progressbar'
import { checkBasic, getDispatcher, convertTime } from '../../utils/audio'

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
        else if (!dispatcher.current || !dispatcher.player)
            return message.channel.createMessage({
                content: `${i18next.t(`${this.type}.${this.name}.no_current`, { ns: 'commands', lng: language })}`,
            })

        const bar = createBar.splitBar(dispatcher.current.info.length, dispatcher.player.position, 20)[0]

        return message.channel.createMessage({
            embed: {
                color: global.bot.Constants.EMBED_COLORS.DEFAULT,
                description: `${i18next.t(`${this.type}.${this.name}.now_playing`, {
                    ns: 'commands',
                    lng: language,
                    title: dispatcher.current.info.title,
                    bar: `${bar}`,
                    pos: `${convertTime(dispatcher.player.position)}`,
                    length: `${convertTime(dispatcher.current.info.length)}`,
                    vol: `${dispatcher.player.filters.volume * 100}`,
                    req: `${dispatcher.current.requester.mention}`,
                })}`,
            },
        })
    },
    name: 'nowplaying',
    description: 'nowplaying',
    type: 'music',
    onlyCmdChannel: true,
}
