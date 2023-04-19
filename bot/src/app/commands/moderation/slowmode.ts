import Manbo from 'manbo'
import i18next from 'i18next'
import { msLocalization } from '../../utils/utils'

export = {
    func: async function (message: Manbo.Message<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, suffix: Array<string>, language: string) {
        if (!suffix[0])
            return message.channel.createMessage({
                content: `${i18next.t(`${this.type}.${this.name}.no_suffix`, { ns: 'commands', lng: language })}`,
            })
        else if (suffix[0] === '0') {
            await message.channel.edit({
                rateLimitPerUser: 0,
            })

            return message.channel.createMessage({
                content: `${i18next.t(`${this.type}.${this.name}.slow_off`, { ns: 'commands', lng: language })}`,
            })
        }
        let num = msLocalization(suffix[0])
        if (!num)
            return message.channel.createMessage({
                content: `${i18next.t(`${this.type}.${this.name}.invalid_num`, { ns: 'commands', lng: language })}`,
            })
        num = Number((num / 1000).toFixed(0))
        if (num < 1 || num > 21600)
            return message.channel.createMessage({
                content: `${i18next.t(`${this.type}.${this.name}.num_out_of_range`, { ns: 'commands', lng: language })}`,
            })
        await message.channel.edit({
            rateLimitPerUser: num,
        })

        return message.channel.createMessage({
            content: `${i18next.t(`${this.type}.${this.name}.changed_slow`, { ns: 'commands', lng: language, slow: `${suffix[0]}` })}`,
        })
    },
    name: 'slowmode',
    description: 'slowmode',
    type: 'moderation',
    onlyCmdChannel: false,
    userPerm: ['manageChannels'],
    botPerm: ['manageChannels'],
}
