import Manbo from 'manbo'
import i18next from 'i18next'
import { TimestampFormatter } from '../../utils/utils'

export = {
    func: async function (message: Manbo.Message<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, suffix: Array<string>, language: string) {
        const totalUsers = message.channel.guild.memberCount
        const totalBots = message.channel.guild.members.filter(member => member.user.bot).length
        const textChannels = message.channel.guild.channels.filter(c => c.type === Manbo.Constants.ChannelTypes.GUILD_TEXT).length
        const voiceChannels = message.channel.guild.channels.filter(c => c.type === Manbo.Constants.ChannelTypes.GUILD_VOICE).length

        const daysOld = Math.round((Date.now() - message.channel.guild.createdAt) / (1000 * 3600 * 24))

        const serverInfo = [
            `${i18next.t(`${this.type}.${this.name}.members`, { ns: 'commands', lng: language, total_users: `${totalUsers}`, total_bots: `${totalBots}` })}`,
            ``,
            `${i18next.t(`${this.type}.${this.name}.channels`, { ns: 'commands', lng: language, text_channels: `${textChannels}`, voice_channels: `${voiceChannels}` })}`,
            ``,
            `${i18next.t(`${this.type}.${this.name}.daysOld`, { ns: 'commands', lng: language, days_old: `${daysOld}` })}`,
            ``,
            `${i18next.t(`${this.type}.${this.name}.boosts`, {
                ns: 'commands',
                lng: language,
                boost: `${message.channel.guild.premiumSubscriptionCount}`,
                tier: `${message.channel.guild.premiumTier}`,
            })}`,
            ``,
            `${i18next.t(`${this.type}.${this.name}.roles`, { ns: 'commands', lng: language, role_count: `${message.channel.guild.roles.size - 1}` })}`,
            ``,
            `${i18next.t(`${this.type}.${this.name}.security`, {
                ns: 'commands',
                lng: language,
                verification: `${i18next.t(`${this.type}.${this.name}.verification_${message.channel.guild.verificationLevel}`, { ns: 'commands', lng: language })}`,
            })}`,
            ``,
        ]

        const roles = message.channel.guild.roles
            .map(r => r)
            .sort((a, b) => b.position - a.position)
            .map(role => role.mention)
            .slice(0, -1)

        const owner = await message.channel.guild.getRESTMember(message.channel.guild.ownerID)
        const none = `${i18next.t(`${this.type}.${this.name}.none`, { ns: 'commands', lng: language })}`

        return message.channel.createMessage({
            embed: {
                color: global.bot.Constants.EMBED_COLORS.DEFAULT,
                thumbnail: {
                    url: message.channel.guild.dynamicIconURL('png', 4096) ?? undefined,
                },
                footer: {
                    text: `${i18next.t(`${this.type}.${this.name}.footer`, { ns: 'commands', lng: language, name: `${message.channel.guild.name}`, id: `${message.channel.guild.id}` })}`,
                },
                fields: [
                    {
                        name: `${i18next.t(`${this.type}.${this.name}.owner`, { ns: 'commands', lng: language })}`,
                        value: `${owner.mention} **[\`${owner.id}\`]**`,
                        inline: false,
                    },
                    {
                        name: `${i18next.t(`${this.type}.${this.name}.timestamp`, { ns: 'commands', lng: language })}`,
                        value: `${TimestampFormatter.time(message.channel.guild.createdAt)} (${TimestampFormatter.relativeTime(message.channel.guild.createdAt)})`,
                    },
                    {
                        name: `${i18next.t(`${this.type}.${this.name}.role`, { ns: 'commands', lng: language })}`,
                        value: `${!roles.length ? `${none}` : roles.length < 10 ? roles.join(', ') : roles.length > 10 ? trimArray(language, this.name, this.type, roles).join(', ') : `${none}`}`,
                    },
                ],
                description: `${i18next.t(`${this.type}.${this.name}.desc`, { ns: 'commands', lng: language, name: `${message.channel.guild.name}`, ctx: `${serverInfo.join('\n')}` })}`,
            },
        })
    },
    name: 'serverinfo',
    description: 'server info',
    type: 'information',
    onlyCmdChannel: true,
}

const trimArray = (language: string, name: string, type: string, arr, maxLen = 10) => {
    if (arr.length > maxLen) {
        const len = arr.length - maxLen
        arr = arr.slice(0, maxLen)
        arr.push(`${i18next.t(`${type}.${name}.more_roles`, { ns: 'commands', lng: language, roles: `${len}` })}`)
    }
    return arr
}
