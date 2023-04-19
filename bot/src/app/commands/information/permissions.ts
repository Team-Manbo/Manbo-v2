import i18next from 'i18next'
import Manbo from 'manbo'
import { GuildMember } from '../../utils/utils'

export = {
    func: async function (message: Manbo.Message<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, suffix: Array<string>, language: string) {
        const permissions = Object.keys(Manbo.Constants.Permissions)
        const checkUserID =
            message.mentions[message.mentions.length - 1]?.id ||
            message.channel.guild.members.get(suffix[0])?.id ||
            message.channel.guild.members.get(suffix[1])?.id ||
            (await global.bot.getRESTGuildMember(message.guildID, suffix[0]).catch(() => undefined))?.id ||
            (await global.bot.getRESTGuildMember(message.guildID, suffix[1]).catch(() => undefined))?.id ||
            undefined
        const member = checkUserID ? await global.bot.getRESTGuildMember(message.guildID, checkUserID) : message.member
        const checkChannelID =
            message.channelMentions[message.channelMentions.length - 1] || message.channel.guild.channels.get(suffix[0])?.id || message.channel.guild.channels.get(suffix[1])?.id || undefined
        const channel = checkChannelID ? (message.channel.guild.channels.get(checkChannelID) as Manbo.AnyGuildChannel) : message.channel

        const yes = '✔️'
        const no = '❌'
        const x = '```'
        const s = '🅰️'
        const c = '🅱️'

        let ctx = `${i18next.t(`${this.type}.${this.name}.guild`, { ns: 'commands', lng: language })} - ${s}\n#${channel.name} - ${c}\n\n${s} | ${c}\n`
        for (let perm of permissions) {
            // @ts-ignore -> `perm` is a Permission string
            ctx += `${member.permissions.has(perm) ? yes : no} | ${channel!.permissionsOf(member).has(perm) ? yes : no} - ${perm.toLowerCase().replace(/\b[a-zA-Z]/g, m => m.toUpperCase())}\n`
        }

        return message.channel.createMessage({
            embed: {
                description: x + ctx + x,
                color: GuildMember.getDisplayHexColor(member),
                title: `${i18next.t(`${this.type}.${this.name}.title`, { ns: 'commands', lng: language, user: `${member.user.username}#${member.user.discriminator}` })}`,
            },
        })
    },
    name: 'permissions',
    description: 'see permissions in the guild',
    usage: '[@user | userID] [#channel | channelID]',
    type: 'information',
    onlyCmdChannel: true,
}
