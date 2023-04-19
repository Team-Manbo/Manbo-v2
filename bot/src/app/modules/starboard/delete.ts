import Manbo from 'manbo'
import PostgresRead from '../../../database/interfaces/postgres/read'
import pool from '../../../database/clients/postgres'
import i18next from 'i18next'

module.exports = async function (guildID: string, interaction: Manbo.CommandInteraction<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, lang: string) {
    if (!interaction.member!.permissions.has('manageGuild'))
        return interaction.createMessage({
            content: `${i18next.t('starboard.starboard.delete.no_perm', { ns: 'slashcommands', lng: lang })}`,
            flags: 64,
        })

    const res = await PostgresRead.getStartboard(guildID)
    if (!res)
        return interaction.createMessage({
            content: `${i18next.t('starboard.starboard.delete.doenst_exist', { ns: 'slashcommands', lng: lang })}`,
            flags: 64,
        })

    await pool.query('DELETE FROM starboard WHERE guild_id=$1;', [guildID])
    return interaction.createMessage({
        content: `${i18next.t('starboard.starboard.delete.deleted', { ns: 'slashcommands', lng: lang })}`,
        flags: 64,
    })
}
