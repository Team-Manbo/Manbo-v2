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

        if (dispatcher.player.paused === false)
            return message.channel.createMessage({
                content: `${i18next.t(`${this.type}.${this.name}.alr_resumed`, { ns: 'commands', lng: language })}`,
            })
        dispatcher.player.setPaused(false)

        return message.channel.createMessage({
            content: `${i18next.t(`${this.type}.${this.name}.resumed`, { ns: 'commands', lng: language })}`,
        })
    },
    name: 'resume',
    description: 'resume',
    type: 'music',
    onlyCmdChannel: true,
}
