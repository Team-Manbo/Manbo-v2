import Manbo from 'manbo'
import PostgresRead from '../../../database/interfaces/postgres/read'
import _ from 'lodash'
import i18next from 'i18next'

module.exports = async function (guildID: string, interaction: Manbo.CommandInteraction<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, lang: string) {
    const res = await PostgresRead.getStartboard(guildID)
    if (!res || !res.ids)
        return interaction.createMessage({
            content: `${i18next.t('starboard.starboard.stats.doenst_exist', { ns: 'slashcommands', lng: lang })}`,
            flags: 64,
        })

    else if (res.ids.length < 3)
    return interaction.createMessage({
        content: `${i18next.t('starboard.starboard.stats.no_data', { ns: 'slashcommands', lng: lang })}`,
        flags: 64,
    })

    const sorted = Object.fromEntries(Object.entries(res.ids).sort(([, a], [, b]) => b.stars - a.stars))
    return interaction.createMessage({
        embeds: [
            {
                description: `${i18next.t('starboard.starboard.stats.most_star_msg', { ns: 'slashcommands', lng: lang })}\n🥇${msgLink(sorted[0].actual_channel_id, sorted[0].actual_message_id)}\n🥈${msgLink(sorted[2].actual_channel_id, sorted[2].actual_message_id)}\n🥉${msgLink(sorted[2].actual_channel_id, sorted[2].actual_message_id)}`
            }
        ]
    })

    function msgLink(channelID: string, messageID: string): string {
        return `https://discord.com/channels/${guildID}/${channelID}/${messageID}`
    }
}