import Manbo from 'manbo'
import PostgresRead from '../../../database/interfaces/postgres/read'
import pool from '../../../database/clients/postgres'

export = {
    name: 'messageReactionAdd',
    type: 'on',
    handle: async (message: Manbo.Message<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, emoji: Manbo.Emoji, reactor: Manbo.Member) => {
        if (!message.guildID) return
        if (message.author && message.author.bot) return

        /**
         * Starboard
         */
        const guildID = message.guildID
        const res = await PostgresRead.getStartboard(guildID)
        if (!res) return
        else if (res.locked === true) return
        else if (!(res.emoji_name === emoji.name && (res.emoji_id ? res.emoji_id === emoji.id : true))) return

        const msgReaction = message.reactions[`${res.emoji_name}${res.emoji_id ? `:${res.emoji_id}` : ''}`]
        if (!msgReaction) return
        else if (msgReaction.count < res.minimum) return

        const checkStarboard = res.ids?.find(r => r.actual_message_id === message.id)

        if (checkStarboard) {
            // edit embed
            return await global.bot
                .editMessage(res.channel_id, checkStarboard.starboard_message_id, {
                    content: `starcount: ${msgReaction.count}`,
                })
                .catch(() => {})
        } else {
            // create a new message
            const msg = await global.bot
                .createMessage(res.channel_id, {
                    content: `starcount: ${msgReaction.count}`,
                })
                .catch(() => null)
            if (!msg)
                return message.channel.createMessage({
                    content: `cannot send message`,
                })
            const obj = [
                {
                    starboard_message_id: `${msg.id}`,
                    actual_channel_id: `${message.channel.id}`,
                    actual_message_id: `${message.id}`,
                    stars: msgReaction.count
                },
            ]
            if (res.ids) return await pool.query('UPDATE starboard SET ids = ids || $1::jsonb WHERE guild_id=$2;', [JSON.stringify(obj), guildID])
            else return await pool.query('UPDATE starboard SET ids = $1::jsonb WHERE guild_id=$2;', [JSON.stringify(obj), guildID])
        }
    },
}
