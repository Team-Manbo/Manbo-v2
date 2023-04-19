import { isNonNullExpression } from 'typescript'
import { PostgresGuilds, PostgresMessages, PostgresSettings, PostgresEconomy, PostgresStarboard } from '../../../../typings'
import pool from '../../clients/postgres'

import PostgresCreate from './create'

async function getAllGuilds(): Promise<Array<PostgresGuilds>> {
    const doc = await pool.query('SELECT * FROM guilds;')
    return doc.rows
}

async function getGuild(guildID: string): Promise<PostgresGuilds> {
    const doc = await pool.query('SELECT * FROM guilds WHERE id=$1;', [guildID])
    if (doc.rows.length === 0) {
        const guild = global.bot.guilds.get(guildID)
        if (guild) {
            await PostgresCreate.createGuild(guild)
            return await getGuild(guildID)
        }
    }
    return doc.rows[0]
}

async function getSetting(guildID: string): Promise<PostgresSettings> {
    const res = await pool.query('SELECT * from settings WHERE id=$1;', [guildID])
    if (res.rows.length === 0) {
        const guild = global.bot.guilds.get(guildID)
        if (guild) {
            await PostgresCreate.createSetting(guild)
            return await getSetting(guildID)
        }
    }
    return res.rows[0]
}

async function getMessagesByAuthor(userID: string) {
    const resp = await pool.query('SELECT * FROM messages WHERE author_id=$1', [userID])
    const promiseArray = resp.rows.map(m => {
        return decryptMessageDoc(m)
    })
    return await Promise.all(promiseArray)
}

async function getMessageById(messageID: string): Promise<PostgresMessages | null> {
    let message = await pool.query('SELECT * FROM messages WHERE id=$1', [messageID])
    if (message.rows.length === 0) return null
    message = await decryptMessageDoc(message.rows[0])
    return message
}

async function decryptMessageDoc(message: PostgresMessages): Promise<PostgresMessages> {
    message.content = global.aes.decrypt(message.content)
    if (message.attachment_b64) message.attachment_b64 = global.aes.decrypt(message.attachment_b64)
    return message
}

async function getMessagesByIds(messageIds): Promise<Array<PostgresMessages> | null> {
    const message = await pool.query('SELECT * FROM messages WHERE id = ANY ($1)', [messageIds])
    if (message.rows.length === 0) return null
    const decryptedMessages: Array<PostgresMessages> = []
    message.rows.forEach(async row => {
        decryptedMessages.push(await decryptMessageDoc(row))
    })
    return decryptedMessages
}

async function getEconomyValue(userID: string, guildID?: string): Promise<PostgresEconomy | null> {
    /* if (guildID) {
        const res = await pool.query('SELECT * FROM economy WHERE user_id=$1 AND guild_id=$2;', [userID, guildID])
        if (res.rows.length === 0) {
            const newEconomyDAata = await PostgresCreate.registerEconomy(userID, guildID)
            return await getEconomyValue(userID, guildID)
        } else {
            return res.rows[0]
        }
    } else {
        const res = await pool.query('SELECT * FROM economy WHERE user_id=$1;', [userId])
        if (res.rows.length === 0) {
            await PostgresCreate.registerEconomy(userID)
            return await getEconomyValue(userID)
        } else {
            return res.rows[0]
        }
    } */
    if (guildID) {
        const res = await pool.query('SELECT * FROM economy WHERE user_id=$1 AND guild_id=$2;', [userID, guildID])
        if (res.rows.length === 0) return null
        else return res.rows[0]
    } else {
        const res = await pool.query('SELECT * FROM economy WHERE user_id=$1;', [userID])
        if (res.rows.length === 0) return null
        else return res.rows[0]
    }
}

async function getStartboard(guildID: string): Promise<PostgresStarboard | null> {
    const res = await pool.query('SELECT * FROM starboard WHERE guild_id=$1;', [guildID])
    if (res.rows.length === 0) return null
    else return res.rows[0]
}

export default {
    getMessageById,
    getMessagesByAuthor,
    getAllGuilds,
    getGuild,
    getSetting,
    getMessagesByIds,
    getEconomyValue,
    getStartboard
}
