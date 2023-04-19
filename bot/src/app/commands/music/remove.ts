import Manbo from 'manbo'
import i18next from 'i18next'
import { checkBasic, getDispatcher } from '../../utils/audio'

export = {
    func: async function (message: Manbo.Message<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, suffix: Array<string>, language: string) {
        const basicCheck = checkBasic(message.member, language)
        if (typeof basicCheck === 'string')
            return message.channel.createMessage({
                content: `${basicCheck}`,
            })

        if (!suffix[0])
            return message.channel.createMessage({
                content: `${i18next.t(`${this.type}.${this.name}.no_suffix`, { ns: 'commands', lng: language })}`,
            })
        else if (!Number(suffix[0]))
            return message.channel.createMessage({
                content: `${i18next.t(`${this.type}.${this.name}.suffix_nan`, { ns: 'commands', lng: language })}`,
            })

        const dispatcher = getDispatcher(message.guildID, language)
        if (typeof dispatcher === 'string')
            return message.channel.createMessage({
                content: `${dispatcher}`,
            })
        if (!dispatcher.queue.length)
            return message.channel.createMessage({
                content: `${i18next.t(`${this.type}.${this.name}.no_track_in_queue`, { ns: 'commands', lng: language })}`,
            })

        const songNum = Number(suffix[0])
        if (songNum < 1 || songNum > dispatcher.queue.length)
            return message.channel.createMessage({
                content: `${i18next.t(`${this.type}.${this.name}.invalid_num`, { ns: 'commands', lng: language })}`,
            })

        // this should not be null
        const songInfo = dispatcher.queue.at(songNum - 1)!
        dispatcher.queue.splice(songNum - 1, 1)

        return message.channel.createMessage({
            content: `${i18next.t(`${this.type}.${this.name}.removed_track`, { ns: 'commands', lng: language, name: `${songInfo.info.title}` })}`,
        })
    },
    name: 'remove',
    description: 'remove',
    type: 'music',
    onlyCmdChannel: true,
}
