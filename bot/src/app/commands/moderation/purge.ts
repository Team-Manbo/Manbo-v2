import i18next from 'i18next'
import Manbo from 'manbo'
import { Snowflake } from '../../utils/utils'

export = {
    func: async function (message: Manbo.Message<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, suffix: Array<string>, language: string) {
        await message.delete()
        if (!suffix[0]) {
            const msg = await message.channel.createMessage({
                content: `${i18next.t(`${this.type}.${this.name}.provide_number`, { lng: language, ns: 'commands' })}`,
            })
            return setTimeout(() => msg.delete(), 5_000)
        }

        if (Number.isNaN(parseInt(suffix[0]))) {
            const msg = await message.channel.createMessage({
                content: `${i18next.t(`${this.type}.${this.name}.provide_valid_number`, {
                    lng: language,
                    ns: 'commands',
                })}`,
            })
            return setTimeout(() => msg.delete(), 5_000)
        }

        const count: number = parseInt(suffix[0])

        let userID: string | null = suffix.filter(r => !r.startsWith('-'))[1]

        // noDM -> true
        let filteredUser =
            message.channel.guild.members.get(userID) ||
            message.channel.guild.members.get(message.mentions[message.mentions.length - 1]?.id) ||
            (await global.bot.getRESTGuildMember(message.guildID, userID).catch(() => null)) ||
            null

        userID = filteredUser ? filteredUser.id : null

        const userContent =
            userID !== null
                ? `${i18next.t(`${this.type}.${this.name}.userContent`, {
                      ns: 'commands',
                      lng: language,
                      username: filteredUser!.user.username,
                      discriminator: filteredUser!.user.discriminator,
                      id: filteredUser!.id,
                  })}`
                : ''

        if (userID !== null && count > 250) {
            const msg = await message.channel.createMessage({
                content: `${i18next.t(`${this.type}.${this.name}.over_250`, { lng: language, ns: 'commands' })}`,
            })
            return setTimeout(() => msg.delete(), 5_000)
        }
        if (userID === null && count > 1000) {
            const msg = await message.channel.createMessage({
                content: `${i18next.t(`${this.type}.${this.name}.over_1000`, { lng: language, ns: 'commands' })}`,
            })
            return setTimeout(() => msg.delete(), 5_000)
        }

        let collection: Array<Manbo.Message<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>> = []
        await (async message => {
            const getPurgedMessages = async (lastMessageID: string, current: number): Promise<void> => {
                const messages: Array<Manbo.Message<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>> = await message.channel.getMessages({
                    limit: count - current < 50 ? 50 : count - current > 250 ? 250 : count - current,
                    before: lastMessageID,
                })
                const filteredMsg = messages.filter(r => (userID !== null ? r.author.id === userID : true)).slice(0, count - current)
                Array.prototype.push.apply(collection, filteredMsg)
                if (collection.length < count && !messages.filter(r => Date.now() - Snowflake.getCreatedAt(r.id) >= 1_209_600_000))
                    return getPurgedMessages(messages[messages.length - 1].id, collection.length)
            }
            return getPurgedMessages(message.channel.lastMessageID, collection.length)
        })(message)

        const filterOld = collection.filter(r => Date.now() - Snowflake.getCreatedAt(r.id) < 1_209_600_000)

        const oldMsg = count - filterOld.length
        const oldMsgContent =
            oldMsg > 0
                ? `${i18next.t(`${this.type}.${this.name}.oldMsgContent`, {
                      ns: 'commands',
                      lng: language,
                      oldMsg: `${oldMsg}`,
                      s: oldMsg > 1 ? 's' : '',
                  })}`
                : ''

        await message.channel.deleteMessages(
            filterOld.map(r => r.id),
            `Purge command by ${message.author.username}#${message.author.discriminator}`,
        )

        const purgedCountMsg = await message.channel.createMessage({
            content: `${i18next.t(`${this.type}.${this.name}.purged`, {
                lng: language,
                ns: 'commands',
                purgedCount: `${filterOld.length}`,
                oldMsgContent: oldMsgContent,
                userContent: userContent,
            })}`,
        })
        return setTimeout(() => purgedCountMsg.delete(), 5_000)
    },
    name: 'purge',
    description: 'Purge messages!',
    args: '<limit> [@user | userID]',
    type: 'moderation',
    userPerm: ['manageMessages'],
    botPerm: ['manageMessages'],
}
