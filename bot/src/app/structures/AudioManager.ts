import { Shoukaku, Connectors, Player, Node } from 'shoukaku'
import BaseClient from './BaseClient'
import config from '../../config'

interface Cooldown {
    userID: string
    last_cmd: number
}

export class AudioManager extends Shoukaku {
    client: BaseClient
    cache: Array<any>
    cooldowns: Array<Cooldown>

    constructor(client: BaseClient) {
        super(new Connectors.Eris(client), config.lavalink, {
            alwaysSendResumeKey: true,
            moveOnDisconnect: true,
            reconnectInterval: 0, //
            reconnectTries: 25,
            restTimeout: 15000,
            resume: true,
            resumeByLibrary: true,
            // resumeKey
            resumeTimeout: 1500
            // structures
            // userAgent
            // what's this -> closedEventDelay: 1e3,
        })
        this.client = client
        this.cooldowns = []
        this.cache = []

        this.on('error', (NodeName: string, error: Error) => {
            global.logger.error(`[Lavalink] Node ${NodeName} got an error:\n${error}`)
        })

        this.on('disconnect', (name: string, players: Array<Player>, moved: boolean) => {
            global.logger.warn(`[Lavalink] Node ${name} just lost connection to lavalink WebSocket`)

            if (!moved)
                players.forEach(pl => {
                    this.client.queue.delete(pl.connection.guildId)
                    pl.connection.disconnect()
                })
        })
    }

    checkURL(url: string) {
        try {
            return new URL(url), true
        } catch (err) {
            return false
        }
    }

    async search(audioNode: Node, searchQuery: string) {
        if (this.cache.find(s => s.id === searchQuery)) return { tracks: [this.cache.find(s => s.id === searchQuery).info] }
        const res = await audioNode.rest.resolve(this.checkURL(searchQuery) ? searchQuery : `scsearch:${searchQuery}`)
        if (this.checkURL(searchQuery) && res && res.tracks.length) this.cache.push({
            id: res.tracks[0].info.uri,
            info: res.tracks[0]
        })
        return res
    }
}