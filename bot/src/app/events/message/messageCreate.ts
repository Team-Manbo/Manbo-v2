import { Constants, Message } from 'manbo'

import messageHandler from '../../modules/messageHandler'
import config from '../../../config'

export = {
    name: 'messageCreate',
    type: 'on',
    handle: async (message: Message) => {
        if (await global.bot.checkZeroDowntimeUUID('messageCreate')) return

        /**
         * Filter automod / role subscription message
         */
        if (message.type === Constants.MessageTypes.AUTO_MODERATION_ACTION || message.type === Constants.MessageTypes.ROLE_SUBSCRIPTION_PURCHASE) return

        /* Logging first */

        /*
        if (message.author.id === global.bot.user.id) return // dump logs made by the bot
        const guildSettings = global.bot.guildSettingsCache[message.channel.guild.id]
        if (!guildSettings) await cacheGuild(message.channel.guild.id)
        if (!global.bot.guildSettingsCache[message.channel.guild.id].isChannelIgnored(message.channel.id)) {
            if (!global.bot.guildSettingsCache[message.channel.guild.id].isLogBots() && message.author.bot) return
            await PostgresCreate.cacheMessage(message)
        }
        */

        /* CommandHandler check */
        await messageHandler(message)
    },
}
