import Manbo from 'manbo'
import i18next from 'i18next'

export = {
    func: async function (message: Manbo.Message<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, suffix: Array<string>, language: string) {
        const checkUserID =
            message.mentions[message.mentions.length - 1]?.id ||
            message.channel.guild.members.get(suffix[0])?.id ||
            message.channel.guild.members.get(suffix[1])?.id ||
            (await global.bot.getRESTGuildMember(message.guildID, suffix[0]).catch(() => undefined))?.id ||
            (await global.bot.getRESTGuildMember(message.guildID, suffix[1]).catch(() => undefined))?.id ||
            undefined
        if (!checkUserID)
            return message.channel.createMessage({
                content: `invalid member`,
            })
        const member = await global.bot.getRESTGuildMember(message.guildID, checkUserID).catch(() => null)
        if (!member)
            return message.channel.createMessage({
                content: `invalid member`,
            })
    },
    name: 'timeout',
    description: 'timeout',
    type: 'moderation',
    onlyCmdChannel: true,
}
        