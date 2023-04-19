import Manbo from 'manbo'
import i18next from 'i18next'
import Shoukaku from 'shoukaku'
import BaseClient from '../structures/BaseClient'
import { convertTime } from '../utils/audio'
import { ExtendedTrack } from '../../../typings'

export default class AudioDispatcher {
    public client: BaseClient
    public guild: Manbo.Guild
    public channel: Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel
    public player: Shoukaku.Player
    public queue: Array<ExtendedTrack>
    public repeat: string
    public current: ExtendedTrack
    public stopped: boolean

    constructor({ client, guild, channel, player }) {
        this.client = client
        this.guild = guild
        this.channel = channel
        this.player = player
        this.queue = []
        this.repeat = 'off'
        this.current = {} as ExtendedTrack
        this.stopped = false

        let _notifiedOnce = false
        let _errorHandler = data => {
            if (data instanceof Error || data instanceof Object) global.logger.error(data)
            this.queue.length = 0
            this.destroy()
        }

        this.player
            .on('start', () => {
                if (this.repeat === 'track') {
                    if (_notifiedOnce) return
                    else _notifiedOnce = true
                } else if (this.repeat === 'queue' || this.repeat === 'off') {
                    _notifiedOnce = false
                }
                this.channel
                    .createMessage({
                        embed: {
                            color: global.bot.Constants.EMBED_COLORS.DEFAULT,
                            description: `${i18next.t(`music.now_playing`, { nc: 'translations', title: `${this.current.info.title}`, time: `${convertTime(this.current.info.length)}`, req: `${this.current.requester.mention}` })}`,
                        },
                    })
                    .catch(() => null)
            })
            .on('end', () => {
                if (this.repeat === 'track') this.queue.unshift(this.current)
                if (this.repeat === 'queue') this.queue.push(this.current)
                this.play()
            })
            .on('stuck', () => {
                if (this.repeat === 'track') this.queue.unshift(this.current)
                if (this.repeat === 'queue') this.queue.push(this.current)
                this.play()
            })
            .on('closed', _errorHandler)
            .on('exception', _errorHandler)
    }

    get exists() {
        return this.client.queue.has(this.guild.id)
    }

    play() {
        if (!this.exists || !this.queue.length) return this.destroy()
        this.current = this.queue.shift()!
        this.player.setVolume(0.3).playTrack({ track: this.current.track })
    }

    destroy() {
        this.queue.length = 0
        this.player.connection.disconnect()
        this.client.queue.delete(this.guild.id)
        if (this.stopped) return
        // this.channel.createMessage('no songs left in queue').catch(() => null)
    }
}
