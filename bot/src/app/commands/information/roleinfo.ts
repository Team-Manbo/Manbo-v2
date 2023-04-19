import Manbo from 'manbo'
import i18next from 'i18next'
import { TimestampFormatter } from '../../utils/utils'

export = {
    func: async function (message: Manbo.Message<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, suffix: Array<string>, language: string) {
        if (!suffix[0])
            return message.channel.createMessage({
                content: `${i18next.t(`${this.type}.${this.name}.no_suffix`, { ns: 'commands', lng: language })}`,
            })
        const role =
            message.channel.guild.roles.get(suffix[0]) ||
            message.channel.guild.roles.get(message.roleMentions[message.roleMentions.length - 1]) ||
            message.channel.guild.roles.find(r => r.name === suffix.join(' ')) ||
            null
        if (!role)
            return message.channel.createMessage({
                content: `${i18next.t(`${this.type}.${this.name}.invalid_role`, { ns: 'commands', lng: language })}`,
            })

        /**
         * TODO: maybe paginate members?
         * or just use cached members?
         * or is there any other method getting all members
         */
        const roleMembers = message.channel.guild.members.filter(r => r.roles.includes(role.id))

        const daysOld = Math.round((Date.now() - role.createdAt) / (1000 * 3600 * 24))

        const roleInfo = [
            `${i18next.t(`${this.type}.${this.name}.name`, { ns: 'commands', lng: language, role_name: `${role.name}` })}`,
            ``,
            `${i18next.t(`${this.type}.${this.name}.users`, {
                ns: 'commands',
                lng: language,
                percent: `${((roleMembers.length * 100) / message.channel.guild.memberCount).toFixed(3)}`,
                num: `${roleMembers.length}`,
                total: `${message.channel.guild.memberCount}`,
            })}`,
            ``,
            `${i18next.t(`${this.type}.${this.name}.daysOld`, { ns: 'commands', lng: language, days: `${daysOld}` })}`,
            ``,
            `${i18next.t(`${this.type}.${this.name}.hexColor`, { ns: 'commands', lng: language, color: `${role.color}` })}`,
            ``,
            `${i18next.t(`${this.type}.${this.name}.mentionable`, { ns: 'commands', lng: language, value: `${role.mentionable}` })}`,
            ``,
            `${i18next.t(`${this.type}.${this.name}.hoistable`, { ns: 'commands', lng: language, value: `${role.hoist}` })}`,
            ``,
        ]

        const members = roleMembers.map(r => r.mention)
        const none = `${i18next.t(`${this.type}.${this.name}.none`, { ns: 'commands', lng: language })}`

        return message.channel.createMessage({
            embed: {
                color: role.color,
                thumbnail: {
                    url: message.channel.guild.dynamicIconURL('png', 4096) ?? undefined,
                },
                fields: [
                    {
                        name: `${i18next.t(`${this.type}.${this.name}.created`, { ns: 'commands', lng: language })}`,
                        value: `${TimestampFormatter.time(role.createdAt)} (${TimestampFormatter.relativeTime(role.createdAt)})`,
                    },
                    {
                        name: `${i18next.t(`${this.type}.${this.name}.mention_id`, { ns: 'commands', lng: language })}`,
                        value: `${role.mention} | **${role.id}**`,
                    },
                    {
                        name: `${i18next.t(`${this.type}.${this.name}.members`, { ns: 'commands', lng: language })}`,
                        value: `${
                            !members.length ? `${none}` : members.length < 10 ? members.join(', ') : members.length > 10 ? trimArray(language, this.name, this.type, members).join(', ') : `${none}`
                        }`,
                    },
                ],
                description: `${i18next.t(`${this.type}.${this.name}.desc`, { ns: 'commands', lng: language, name: `${role.name}`, ctx: `${roleInfo.join('\n')}` })}`,
            },
        })
    },
    name: 'roleinfo',
    description: 'roleinfo',
    type: 'information',
    onlyCmdChannel: true,
}

const trimArray = (language: string, name: string, type: string, arr, maxLen = 10) => {
    if (arr.length > maxLen) {
        const len = arr.length - maxLen
        arr = arr.slice(0, maxLen)
        arr.push(`${i18next.t(`${type}.${name}.more_members`, { ns: 'commands', lng: language, roles: `${len}` })}`)
    }
    return arr
}
