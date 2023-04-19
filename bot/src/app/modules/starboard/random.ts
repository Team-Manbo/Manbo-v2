import Manbo from 'manbo'
import PostgresRead from '../../../database/interfaces/postgres/read'
import _ from 'lodash'
import i18next from 'i18next'

module.exports = async function (guildID: string, interaction: Manbo.CommandInteraction<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, lang: string) {
    const res = await PostgresRead.getStartboard(guildID)
    if (!res || !res.ids)
        return interaction.createMessage({
            content: `${i18next.t('starboard.starboard.random.doenst_exist', { ns: 'slashcommands', lng: lang })}`,
            flags: 64,
        })

    const randomMessage = _.sample(res.ids)
    const msg = await global.bot.getMessage(randomMessage.actual_channel_id, randomMessage.actual_message_id).catch(() => null)
    if (msg)
        return interaction.createMessage({
            content: msg.content,
            embeds: msg.embeds,
        })
}
