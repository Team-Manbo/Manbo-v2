import { RequestHandler } from 'express'
import { listenerCount } from 'process'
import { endpoint } from '../functions/endpoint'
import { HttpError } from '../utils/httpError'
import axios from 'axios'
import pool from '../database/postgres'
import Manbo from 'manbo'

interface AccessToken {
    access_token: string
    token_type: string
    expires_in: number
    refresh_token: string
    scope: string
}

export const oauth = endpoint(async (req, res) => {
    const params = req.body
    // console.log(params)
    const data = new URLSearchParams({
        grant_type: "authorization_code",
        client_id: params.clientId,
        client_secret: params.clientSecret,
        redirect_uri: params.redirectUri,
        code: params.code
    }).toString()
    const reqToken = await axios(`https://discord.com/api/v10/oauth2/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        // @ts-ignore
        data
    }).catch((err) => console.log(err))
    
    const jsonToken: AccessToken = reqToken['data']
    console.log(jsonToken)
    const reqData = await axios.get('https://discord.com/api/v10/users/@me/guilds', {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jsonToken.access_token}`
        }
    })
    const reqUserData = await axios.get('https://discord.com/api/v10/users/@me', {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jsonToken.access_token}`
        }
    })
    const jsonData = reqData['data']
    const jsonUserData = reqUserData['data']
    const totalData = await transformOauthGuildsAndUser({user: jsonUserData, guilds: jsonData})
    //console.log(jsonData)
    //console.log(jsonUserData)
    res.status(200).json(totalData)
})

async function getManageable(id: string, oauthGuild): Promise<boolean> {
    if (oauthGuild.owner) return true
    return oauthGuild.permissions.has(Manbo.Constants.Permissions.manageGuild)
}

async function transformGuild(userId: string, data) {
    const serialized = {
        name: data.name,
        id: data.id,
        icon: data.icon,
        features: data.features
    }
    const res = await pool.query('SELECT * from settings WHERE id=$1;', [data.id])
    return {
        ...serialized,
        permissions: data.permissions,
        managable: await getManageable(userId, data),
        manboIsIn: res.rows.length > 0
    }
}

async function transformOauthGuildsAndUser({ user, guilds }) {
    if (!user || !guilds) return { user, guilds }

    const userId = user.id

    const transformedGuilds = await Promise.all(guilds.map((guild) => transformGuild(userId, guild)))
    return { user, transformedGuilds }
}