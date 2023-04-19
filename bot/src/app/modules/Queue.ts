import Manbo from 'manbo'
import Shoukaku from 'shoukaku'
import { ExtendedTrack } from '../../../typings'
import BaseClient from '../structures/BaseClient'
import AudioDispatcher from './AudioDispatcher'

export class Queue extends Map<string, AudioDispatcher> {
    public client: BaseClient

    constructor(client: BaseClient) {
        super()
        this.client = client
    }

    async handle(
        guild: Manbo.Guild,
        member: Manbo.Member,
        channel: Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel,
        node: Shoukaku.Node,
        track: Shoukaku.Track,
        requester?: Manbo.User,
    ) {
        const existing = this.get(guild.id)
        if (!existing) {
            if (this.client.manager.players.has(guild.id)) return 'Busy'
            const player = await node.joinChannel({
                guildId: guild.id,
                shardId: guild.shard.id,
                channelId: member.voiceState.channelID!,
            })
            const dispatcher = new AudioDispatcher({
                client: this.client,
                guild,
                channel,
                player,
            })
            dispatcher.queue.push({ ...track, requester: requester! })
            this.set(guild.id, dispatcher)
            global.logger.debug(dispatcher.constructor.name, `New dispatcher @ guild "${guild.id}"`)
            return dispatcher
        }
        existing.queue.push({ ...track, requester: requester! })
        if (!existing.current) existing.play()
        return null
    }
}
