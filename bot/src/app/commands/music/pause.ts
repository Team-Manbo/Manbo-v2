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
        const dispatcher = getDispatcher(message.guildID, language)
        if (typeof dispatcher === 'string')
            return message.channel.createMessage({
                content: `${dispatcher}`,
            })

        if (dispatcher.player.paused === true)
            return message.channel.createMessage({
                content: `${i18next.t(`${this.type}.${this.name}.alr_paused`, { ns: 'commands', lng: language })}`,
            })

        dispatcher.player.setPaused(true)

        return message.channel.createMessage({
            content: `${i18next.t(`${this.type}.${this.name}.paused`, { ns: 'commands', lng: language })}`,
        })
    },
    name: 'pause',
    description: 'pause',
    type: 'music',
    onlyCmdChannel: true,
}
