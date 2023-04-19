import Manbo from 'manbo'
import PostgresRead from '../../../database/interfaces/postgres/read'
import pool from '../../../database/clients/postgres'
import i18next from 'i18next'

module.exports = async function (guildID: string, interaction: Manbo.CommandInteraction<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, lang: string) {
    if (!interaction.member!.permissions.has('manageGuild'))
        return interaction.createMessage({
            content: `${i18next.t('starboard.starboard.settings.no_perm', { ns: 'slashcommands', lng: lang })}`,
            flags: 64,
        })

    const res = await PostgresRead.getStartboard(guildID)
    if (!res)
        return interaction.createMessage({
            content: `${i18next.t('starboard.starboard.settings.doesnt_exist', { ns: 'slashcommands', lng: lang })}`,
            flags: 64,
        })
    
    const checkChannel = ((interaction.data.options!.find(r => r.name === 'settings') as Manbo.InteractionDataOptionsSubCommandGroup).options!.find(r => r.name === 'channel') as Manbo.InteractionDataOptionsSubCommand)?.options?.find(r => r.name === 'channel')?.value as string | null
    let checkEmoji = ((interaction.data.options!.find(r => r.name === 'settings') as Manbo.InteractionDataOptionsSubCommandGroup).options!.find(r => r.name === 'emoji') as Manbo.InteractionDataOptionsSubCommand)?.options?.find(r => r.name === 'emoji')?.value as string | null

    if (checkChannel) {
        await pool.query('UPDATE starboard SET channel_id=$1 WHERE guild_id=$2;', [checkChannel, guildID])
        return await interaction.createMessage({
            content: `${i18next.t('starboard.starboard.settings.set_channel', { ns: 'slashcommands', lng: lang, channel: `${interaction.channel.guild.channels.get(checkChannel)!.mention}` })}`
        })
    } else if (checkEmoji) {
        let emojiName, emojiID
        const default_regex = new RegExp(/<a?:.+?:\d{18}>|\p{Extended_Pictographic}/gu)
        const regex = new RegExp(/(<a?)?:\w+:(\d{18}>)?/g)
        if (regex.test(checkEmoji) === false && default_regex.test(checkEmoji) === false)
            return interaction.createMessage({
                content: `${i18next.t('starboard.starboard.settings.invalid_emoji', { ns: 'slashcommands', lng: lang })}`,
                flags: 64,
            })
        if (checkEmoji.includes('%')) checkEmoji = decodeURIComponent(checkEmoji)
        if (!checkEmoji.includes(':')) {
            emojiName = checkEmoji
            emojiID = undefined
        } else {
            const match = checkEmoji.match(/<?(?:(a):)?(\w{2,32}):(\d{17,19})?>?/)
            const info = match && { animated: Boolean(match[1]), name: match[2], id: match[3] }
            emojiName = info!.name
            emojiID = info!.id
        }
        await pool.query('UPDATE starboard SET emoji_name=$1, emoji_id=$2 WHERE guild_id=$3;', [emojiName, emojiID. guildID])
        return await interaction.createMessage({
            content: `${i18next.t('starboard.starboard.settings.set_emoji', { ns: 'slashcommands', lng: lang, emoji: `${checkEmoji}` })}`
        })
    }
}
