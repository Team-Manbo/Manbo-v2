import Manbo from 'manbo'
import PostgresRead from '../../../database/interfaces/postgres/read'
import PostgresCreate from '../../../database/interfaces/postgres/create'
import i18next from 'i18next'

module.exports = async function (guildID: string, interaction: Manbo.CommandInteraction<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, lang: string) {
    if (!interaction.member!.permissions.has('manageGuild'))
        return interaction.createMessage({
            content: `${i18next.t('starboard.starboard.create.no_perm', { ns: 'slashcommands', lng: lang })}`,
            flags: 64,
        })

    const res = await PostgresRead.getStartboard(guildID)
    if (res)
        return interaction.createMessage({
            content: `${i18next.t('starboard.starboard.create.alr_exists', { ns: 'slashcommands', lng: lang })}`,
            flags: 64,
        })
    const channelID = (interaction.data.options!.find(r => r.name === 'create') as Manbo.InteractionDataOptionsSubCommand).options!.find(r => r.name === 'channel')!.value as string
    // console.log(util.inspect(interaction.data.options!.find(r => r.name === 'create').options, false, null, true))
    let emojiName: string, emojiID: string | undefined
    let checkEmoji = (interaction.data.options!.find(r => r.name === 'create') as Manbo.InteractionDataOptionsSubCommand).options!.find(r => r.name === 'emoji')?.value as string | null
    if (checkEmoji) {
        const default_regex = new RegExp(/<a?:.+?:\d{18}>|\p{Extended_Pictographic}/gu)
        const regex = new RegExp(/(<a?)?:\w+:(\d{18}>)?/g)
        if (regex.test(checkEmoji) === false && default_regex.test(checkEmoji) === false)
            return interaction.createMessage({
                content: `${i18next.t('starboard.starboard.create.invalid_emoji', { ns: 'slashcommands', lng: lang })}`,
                flags: 64,
            })
        if (checkEmoji.includes('%')) checkEmoji = decodeURIComponent(checkEmoji)
        if (!checkEmoji.includes(':')) {
            emojiName = checkEmoji
            emojiID = undefined
        } else {
            const match = checkEmoji.match(/<?(?:(a):)?(\w{2,32}):(\d{17,19})?>?/)
            const info = match && { animated: Boolean(match[1]), name: match[2], id: match[3] }
            // const type = info!.animated ? '.gif' : '.png'
            emojiName = info!.name
            emojiID = info!.id
        }
    } else {
        checkEmoji = '⭐'
        emojiName = '⭐'
        emojiID = undefined
    }
    await PostgresCreate.createStartboard(guildID, channelID, emojiName, emojiID)

    return interaction.createMessage({
        embeds: [
            {
                color: global.bot.Constants.EMBED_COLORS.DEFAULT,
                description: `${i18next.t('starboard.starboard.create.added', {
                    ns: 'slashcommands',
                    lng: lang,
                    channel: `${interaction.channel.guild.channels.get(channelID)!.mention}`,
                    emoji: `${checkEmoji}`,
                })}`,
            },
        ],
    })
}
