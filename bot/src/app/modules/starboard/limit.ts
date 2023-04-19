import Manbo from 'manbo'
import PostgresRead from '../../../database/interfaces/postgres/read'
import pool from '../../../database/clients/postgres'
import i18next from 'i18next'

module.exports = async function (guildID: string, interaction: Manbo.CommandInteraction<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, lang: string) {
    if (!interaction.member!.permissions.has('manageGuild'))
        return interaction.createMessage({
            content: `${i18next.t('starboard.starboard.limit.no_perm', { ns: 'slashcommands', lng: lang })}`,
            flags: 64,
        })
    
    const res = await PostgresRead.getStartboard(guildID)
    if (!res)
        return interaction.createMessage({
            content: `${i18next.t('starboard.starboard.limit.doenst_exist', {ns: 'slashcommands', lng:lang })}`,
            flags: 64,
        })
    const limit = (interaction.data.options!.find(r => r.name === 'limit') as Manbo.InteractionDataOptionsSubCommand).options!.find(r => r.name === 'stars')!.value as number
    await pool.query('UPDATE starboard SET minimum=$1 WHERE guild_id=$2;', [limit, guildID])
    return interaction.createMessage({
        embeds: [
            {
                color: global.bot.Constants.EMBED_COLORS.DEFAULT,
                description: `${i18next.t('starboard.starboard.limit.set', {ns: 'slashcommands', lng: lang, num: `${limit}`})}`
            }
        ]
    })
}
