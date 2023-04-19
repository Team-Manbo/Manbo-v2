import Manbo from 'manbo'
import PostgresRead from '../../../database/interfaces/postgres/read'
import i18next from 'i18next'

module.exports = async function (guildID: string, interaction: Manbo.CommandInteraction<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, lang: string) {
    const res = await PostgresRead.getStartboard(guildID)
    if (!res || !res.ids)
        return interaction.createMessage({
            content: `${i18next.t('starboard.starboard.show.doenst_exist', { ns: 'slashcommands', lng: lang })}`,
            flags: 64,
        })
    const id = (interaction.data.options!.find(r => r.name === 'show') as Manbo.InteractionDataOptionsSubCommand).options!.find(r => r.name === 'message_id')!.value as string
    const specificMessage = res.ids.find(r => r.actual_message_id === id)
    if (!specificMessage)
        return interaction.createMessage({
            content: `${i18next.t('starboard.starboard.show.invalid_id', { ns: 'slashcommands', lng: lang })}`
        })
    const msg = await global.bot.getMessage(specificMessage.actual_channel_id, specificMessage.actual_message_id).catch(() => null)
    if (msg)
        return interaction.createMessage({
            content: msg.content,
            embeds: msg.embeds,
        })
}
