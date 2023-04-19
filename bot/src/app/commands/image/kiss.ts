import i18next from 'i18next'
import { request } from 'undici'
import Manbo from 'manbo'

export = {
    func: async function (message: Manbo.Message<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, suffix: Array<string>, language: string) {
        if (!suffix[0])
            return message.channel.createMessage({
                content: `${i18next.t(`${this.type}.${this.name}.no_target`, { ns: 'commands', lng: language })}`,
            })

        const target: Manbo.Member | null =
            message.channel.guild.members.get(message.mentions[message.mentions.length - 1]?.id || suffix[0]) ||
            (await global.bot.getRESTGuildMember(message.guildID, message.mentions[message.mentions.length - 1]?.id || suffix[0]).catch(() => null)) ||
            null
        if (!target)
            return message.channel.createMessage({
                content: `${i18next.t(`${this.type}.${this.name}.invalid_user`, { ns: 'commands', lng: language })}`,
            })
        else if (target.id === message.author.id)
            return message.channel.createMessage({
                content: `${i18next.t(`${this.type}.${this.name}.target_is_me`, { ns: 'commands', lng: language })}`,
            })
        else if (target.user.bot)
            return message.channel.createMessage({
                content: `${i18next.t(`${this.type}.${this.name}.target_is_bot`, { ns: 'commands', lng: language })}`,
            })

        const { body } = await request(`https://api.waifu.pics/sfw/kiss`)
        return message.channel.createMessage({
            embed: {
                image: {
                    url: (await body.json()).url,
                },
                description: `${i18next.t(`${this.type}.${this.name}.description`, { ns: 'commands', lng: language, target: `${target.mention}`, author: `${message.author.mention}` })}`,
            },
        })
    },
    name: 'kiss',
    description: 'kiss image',
    type: 'image',
    onlyCmdChannel: true,
}
