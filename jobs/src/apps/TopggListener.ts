import { Pool } from 'pg'
import express from 'express'
import Topgg from '@top-gg/sdk'

const pool = new Pool({
    user: process.env.PG_USER,
    host: global.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: Number(process.env.PG_PORT) || 5432,
    max: 5
})

const app = express()

const webhook = new Topgg.Webhook(process.env.TOPGG_TOKEN)

app.post("/dblwebhook", webhook.listener(async (vote) => {
    if (!vote) return
    if (vote.type !== 'upvote') return
    const check = await pool.query(`SELECT * FROM topgg WHERE id = $1;`, [vote.user])
    if (!check?.rows[0]?.userid)
        await pool.query(`INSERT INTO topgg ("id", "timestamp") VALUES ($1, current_timestamp);`, [vote.user])

    else
        await pool.query(`UPDATE topgg SET timestamp = current_timestamp WHERE userid = $1;`, [vote.user])

}))

app.listen(parseInt(process.env.TOPGG_PORT as string), "0.0.0.0", null, () => {
    global.logger.info(`Top-gg Webhook listening on port 6974`)
})
