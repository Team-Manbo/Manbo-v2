import { Guild } from 'manbo'
import escape from 'markdown-escape'
import batchHandler from '../../../miscellaneous/messageBatcher'
import pool from '../../clients/postgres'
import cacheGuild from '../../../app/utils/cacheGuild'
import config from '../../../config'

const eventLogs = {
    channelCreate: '',
    channelUpdate: '',
    channelDelete: '',
    guildBanAdd: '',
    guildBanRemove: '',
    guildRoleCreate: '',
    guildRoleDelete: '',
    guildRoleUpdate: '',
    guildUpdate: '',
    messageDelete: '',
    messageDeleteBulk: '',
    messageUpdate: '',
    guildMemberAdd: '',
    guildMemberKick: '',
    guildMemberRemove: '',
    guildMemberUpdate: '',
    guildMemberVerify: '',
    voiceChannelLeave: '',
    voiceChannelJoin: '',
    voiceStateUpdate: '',
    voiceChannelSwitch: '',
    guildEmojisUpdate: '',
    guildMemberNickUpdate: '',
    guildMemberBoostUpdate: '',
}

async function createRemindme(guildID: string, messageID: string, channelID: string, content: string) {
    await pool.query('INSERT INTO remindme (guild_id, message_id, channel_id, content) VALUES ($1, $2, $3, $4);', [guildID, messageID, channelID, content])
}

async function createGuild(guild: Guild) {
    try {
        await pool.query('INSERT INTO guilds (id, owner_id, ignored_channels, disabled_events, event_logs, log_bots, custom_settings) VALUES ($1, $2, $3, $4, $5, $6, $7)', [
            guild.id,
            guild.ownerID,
            [],
            [],
            eventLogs,
            false,
            {},
        ]) // Regenerate the document if a user kicks and reinvites the bot.
        await cacheGuild(guild.id)
    } catch (e) {}
}

async function createSetting(guild: Guild) {
    try {
        await pool.query('INSERT INTO settings (id, language, prefix) VALUES ($1, $2, $3);', [guild.id, config.defaultLanguage, config.defaultPrefix])
        await cacheGuild(guild.id)
    } catch (e) {}
}

async function cacheMessage(message) {
    if (!message.content) {
        message.content = global.aes.encrypt('None')
    } else {
        message.content = global.aes.encrypt(escape(message.content.replace(/~/g, '\\~'), ['angle brackets']))
    }
    message.attachment_b64 = ''
    await batchHandler.addItem([message.id, message.author.id, message.content, message.attachment_b64, new Date().toISOString()])
}

async function createGame2048(userID: string, score: number) {
    await pool.query('INSERT INTO game2048 (id, score, timestamp) VALUES ($1, $2, current_timestamp);', [userID, score])
}

async function registerEconomy(userID: string, guildID?: string) {
    // default `100,000` coin
    // default 45% success rate
    if (guildID) await pool.query('INSERT INTO economy (user_id, guild_ids, coin, percentage) VALUES ($1, ARRAY [$2], $3, $4);', [userID, guildID, '100000', 45])
    else await pool.query('INSERT INTO economy (user_id, coin, percentage) VALUES ($1, $2, $3);', [userID, '100000', 45])
}

async function createStartboard(guildID: string, channelID: string, emojiName: string, emojiID?: string) {
    if (emojiID) {
        await pool.query('INSERT INTO starboard (guild_id, channel_id, minimum, emoji_name, emoji_id) VALUES ($1, $2, 5, $3, $4);', [guildID, channelID, emojiName, emojiID])
    } else {
        await pool.query('INSERT INTO starboard (guild_id, channel_id, minimum, emoji_name) VALUES ($1, $2, 5, $3);', [guildID, channelID, emojiName])
    }
}

export default {
    createRemindme,
    cacheGuild,
    createGuild,
    cacheMessage,
    createSetting,
    createGame2048,
    registerEconomy,
    createStartboard
}
