import Manbo from 'manbo'
import i18next from 'i18next'
import { InteractionCollector } from 'manbo-collector'
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
        else if (Number(suffix[0]) < 1 || Number(suffix[0]) > 200)
            return message.channel.createMessage({
                content: `${i18next.t(`${this.type}.${this.name}.vol_range`, { ns: 'commands', lng: language })}`,
            })

        const dispatcher = getDispatcher(message.guildID, language)
        if (typeof dispatcher === 'string')
            return message.channel.createMessage({
                content: `${dispatcher}`,
            })

        dispatcher.player.setVolume(Number(suffix[0]) / 100)
        return message.channel.createMessage({
            content: `${i18next.t(`${this.type}.${this.name}.vol_set`, { ns: 'commands', lng: language,  vol: `${Number(suffix[0])}` })}`,
        })
    },
    name: 'volume',
    description: 'volume',
    type: 'music',
    onlyCmdChannel: true,
}
