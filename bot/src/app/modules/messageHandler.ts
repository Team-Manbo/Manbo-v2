import { Constants, Message } from 'manbo'
import i18next from 'i18next'
import PostgresRead from '../../database/interfaces/postgres/read'
import config from '../../config'

export default async (message: Message) => {
    // Check if the message is from DM
    if (message.channel.type === Constants.ChannelTypes.DM || !message.guildID) {
        const dmChannel = await global.bot.getDMChannel(message.author.id).catch(()=> null)
        if (dmChannel)
            return dmChannel.createMessage({
            content: `you cannot use command in dm`,
        })
        return
    }

    // check if bot & not in guild (to be sure)
    if (message.author.bot || !message.member) return

    // get setting first - `message.guildID` should NOT be undefined
    const setting = await redisCache(message!.guildID as string)

    /* AutoMod(anti-invite, anti-link,anti-phishing) check */
    // automod action code here

    // check if bot & not in guild (to be sure)
    if (message.author.bot || !message.member) return

    // Check user/guild blacklist
    if ((await global.redis.get(`blacklist-user-${message.author.id}`)) || (await global.redis.get(`blacklist-guild-${message.guildID}`))) return

    /**
     * TODO: REMOVE THIS LATER
     * Check if this user is owner/developer/tester
     */
    if (
        !config.developers.includes(message.author.id) &&
        !config.owners.includes(message.author.id) &&
        !(await global.redis.get(`tester-${message.author.id}`)) &&
        !(message.guildID === '1019780126109618258')
    )
        return

    const prefix = setting?.prefix ?? config.defaultPrefix
    const language = setting?.language ?? config.defaultLanguage
    if (message.content.startsWith(prefix)) {
        const cmd = message.content.substring(prefix.length).trim().split(/ +/g)[0].toLowerCase()
        if (!cmd) return
        const splitSuffix = message.content.substring(prefix.length).trim().split(/ +/g)
        const suffix = splitSuffix.slice(1, splitSuffix.length)
        await processCommand(message, cmd, suffix, language)
    }
}

async function redisCache(guildID: string) {
    const redisCacheCheck = await global.redis.get(`setting-${guildID}`)
    if (redisCacheCheck) return JSON.parse(redisCacheCheck)
    else {
        const postgresData = await PostgresRead.getSetting(guildID)
        await global.redis.set(`setting-${guildID}`, JSON.stringify(postgresData), 'EX', 60)
        return postgresData
    }
}

function getCommand(name: string) {
    if (global.bot.commands[name]) return global.bot.commands[name]
    else if (global.bot.aliases[name]) return global.bot.commands[global.bot.aliases[name]]
    else return null
}

async function processCommand(message, commandName: string, suffix: Array<string>, language: string) {
    const command = getCommand(commandName.toLowerCase())
    if (!command) return

    const bp = message.channel.permissionsOf(global.bot.user.id).json

    if (!bp.viewChannel || !bp.sendMessages) return

    if (!bp.embedLinks)
        return message.channel.createMessage({
            content: `${i18next.t('commandHandler.need_embed_link_permission', { lng: language, ns: 'translations' })}`,
        })

    if (suffix[0] && ['-f', '-force'].includes(suffix[0].toLowerCase()) && config.owners.includes(message.author.id)) {
        if (command.botPerm) {
            if (!message.channel.permissionsOf(global.bot.user.id).has(command.botPerm.map((a: string) => Constants.Permissions[a]).reduce((b: bigint, c: bigint) => b | c)))
                return message.channel.createMessage({
                    content: `Missing ${command.botPerm.map(r => `\`${i18next.t(`permissions.${r}`, { ns: 'translations', lng: language })}\``).join(', ')} permission${
                        command.botPerm.length > 1 ? 's' : ''
                    }`,
                    messageReference: {
                        messageID: message.id,
                    },
                    allowedMentions: {
                        repliedUser: true,
                    },
                })
        }
        message.channel.createMessage({
            content: `Owner override by \`${message.author.username}#${message.author.discriminator}\` (\`${message.author.id}\`)`,
        })
        message.content = message.content.replace(' -force', '').replace(' -f', '')
        return command.func(message, suffix.slice(1, suffix.length), language)
    }

    if (command.noDM && message?.guildID) {
        const getCommandChannel = await PostgresRead.getSetting(message.guildID)
        // if (getCommandChannel?.cmd_channel_ids && !getCommandChannel.cmd_channel_ids.includes(message.channel.id))
        //     return
    }

    if (command.type === 'owner' && !config.owners.includes(message.author.id))
        // owner commands should be more secured
        return
    else if (command.type === 'developer' && !config.developers.includes(message.author.id))
        return message.channel.createMessage({
            content: `${i18next.t('commandHandler.developer_only_command', { lng: language, ns: 'translations' })}`,
            messageReference: {
                messageID: message.id,
            },
            allowedMentions: {
                repliedUser: true,
            },
        })
    else if ((command.noDM || command.perm) && !message.channel.guild)
        return message.channel.createMessage({
            content: `${i18next.t('commandHandler.cannot_use_this_command_in_dm', { lng: language, ns: 'translations' })}`,
            messageReference: {
                messageID: message.id,
            },
            allowedMentions: {
                repliedUser: true,
            },
        })
    else if (command?.userPerm && message.author.id !== message.channel.guild.ownerID) {
        if (!message.member.permissions.has(command.userPerm.map((a: string) => Constants.Permissions[a]).reduce((b: bigint, c: bigint) => b | c)))
            return message.channel.createMessage({
                content: `${i18next.t('commandHandler.missing_user_perm', {
                    lng: language,
                    ns: 'translations',
                    perms: command.userPerm.map(r => `\`${i18next.t(`permissions.${r}`, { ns: 'translations', lng: language })}\``).join(', '),
                    s: command.userPerm.length > 1 ? 's' : '',
                })}`,
                messageReference: {
                    messageID: message.id,
                },
                allowedMentions: {
                    repliedUser: true,
                },
            })
    } else if (command?.botPerm) {
        if (!message.channel.permissionsOf(global.bot.user.id).has(command.botPerm.map((a: string) => Constants.Permissions[a]).reduce((b: bigint, c: bigint) => b | c)))
            return message.channel.createMessage({
                content: `${i18next.t('commandHandler.missing_bot_perm', {
                    lng: language,
                    ns: 'translations',
                    perms: command.userPerm.map(r => `\`${i18next.t(`permissions.${r}`, { ns: 'translations', lng: language })}\``).join(', '),
                    s: command.userPerm.length > 1 ? 's' : '',
                })}`,
                messageReference: {
                    messageID: message.id,
                },
                allowedMentions: {
                    repliedUser: true,
                },
            })
    }
    // GUILD_NEWS_THREAD: 10
    // GUILD_PUBLIC_THREAD: 11
    // GUILD_PRIVATE_THREAD: 12
    else if (command.noThread && (message.channel.type === 10 || message.channel.type === 11 || message.channel.type === 12))
        return message.channel.createMessage({
            content: `${i18next.t('commandHandler.cannot_use_this_command_in_thread', { lng: language, ns: 'translations' })}`,
            messageReference: {
                messageID: message.id,
            },
            allowedMentions: {
                repliedUser: true,
            },
        })

    // global.logger.info(`${message.author.username}#${message.author.discriminator} (${message.author.id}) in ${message.channel.id} sent ${commandName} with the args "${suffix}". The guild is called "${message.channel.guild.name}", owned by ${message.channel.guild.ownerID} and has ${message.channel.guild.memberCount} members.`)
    // statAggregator.incrementCommand(command.name)

    await command.func(message, suffix, language)
}
