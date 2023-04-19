import sa from 'superagent'
import { Pool } from 'pg'
import Redis from 'ioredis'

const pool = new Pool({
    user: process.env.PG_USER,
    host: global.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: Number(process.env.PG_PORT) || 5432,
    max: 5,
})

pool.on('error', e => {
    global.logger.error('Postgres error', e)
})

const query = async (sqlString, formatArgs?) => {
    let transactionClient
    try {
        transactionClient = await pool.connect()
        const returnVals = await transactionClient.query(sqlString, formatArgs)
        transactionClient.release()
        return returnVals
    } catch (e) {
        if (transactionClient) transactionClient.release()
        throw new Error(e as string)
    }
}

export = async (userID: string, guildID: string, messageID: string, redis: Redis) => {
    const res = await query('SELECT channel_id, content FROM remindme WHERE (guild_id=$1 AND message_id=$2);', [guildID, messageID])
    if (res.rows.length < 1) return
    else {
        await query('DELETE FROM remindme WHERE (guild_id=$1 AND message_id=$2);', [guildID, messageID])
        global.logger.info(`remindme expired: remindme-${userID}-${guildID}-${messageID}`)
        global.webhook.custom({ title: 'remindme expired', description: `key: remindme-${userID}-${guildID}-${messageID}` })
        await redis.del(`remindme-${userID}-${guildID}-${messageID}`)
        sa.post(`${global.DISCORD_API_URL}/channels/${res.rows[0].channel_id}/messages`)
            .send({
                content: global.aes.decrypt(res.rows[0].content),
                message_reference: {
                    message_id: messageID,
                },
                allowed_mentions: {
                    replied_user: true,
                },
            })
            .set('Authorization', `Bot ${global.BOT_TOKEN as string}`)
            .catch(_ => {
                if (_.response._body.code === 10003)
                    // Unknown channel
                    return
                else if (_.response._body.code === 50001)
                    // Missing access
                    return
                else if (_.response._body.code === 50035 && _.response._body.errors?.message_reference)
                    // REPLIES_UNKNOWN_MESSAGE - Unknown message
                    return sa
                        .post(`${global.DISCORD_API_URL}/channels/${res.rows[0].channel_id}/messages`)
                        .send({
                            content: `[Remindme ➔ Original Message Deleted] <@!${userID}>\n${global.aes.decrypt(res.rows[0].content)}`,
                        })
                        .set('Authorization', `Bot ${global.BOT_TOKEN as string}`)
                        .catch(_ => global.logger.error(_ as string))
            })
    }
}
