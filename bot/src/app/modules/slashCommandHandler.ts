import Manbo, { CommandInteraction, TextChannel, Constants } from 'manbo'
import i18next from 'i18next'
import PostgresRead from '../../database/interfaces/postgres/read'
import config from '../../config'

export default async (interaction: CommandInteraction) => {
    if (!interaction.guildID)
        return interaction.createMessage({
            content: `You cannot use slash command in a DM!`,
        })

    if ((await global.redis.get(`blacklist-user-${interaction.member!.id}`)) || (await global.redis.get(`blacklist-guild-${interaction!.guildID}`))) {
        await interaction.acknowledge()
        return interaction.deleteOriginalMessage()
    }
    if (
        !config!.developers.includes(interaction.member!.id) &&
        !config!.owners.includes(interaction.member!.id) &&
        !(await global.redis.get(`tester-${interaction.member!.id}`)) &&
        !(interaction.guildID === '1019780126109618258')
    ) {
        await interaction.acknowledge()
        return interaction.deleteOriginalMessage()
    }

    const setting = interaction.guildID ? await redisCache(interaction.guildID) : null
    const language = setting?.language ?? config.defaultLanguage

    /*
    if (interaction.channel instanceof Manbo.TextVoiceChannel)
        return interaction.createMessage({
            content: `${i18next.t('slashCommandHandler.no_textvoicechannel', {lng: language, ns: "translations"})}`
        })
    */
    await processSlashCommand(interaction, language)
}

async function redisCache(guildID: string) {
    const redisCacheCheck = await global.redis.get(`setting-${guildID}`)
    if (redisCacheCheck) return JSON.parse(redisCacheCheck)
    else {
        const postgresData = await PostgresRead.getSetting(guildID)
        await global.redis.set(`setting-${guildID}`, JSON.stringify(postgresData), 'EX', 60)
        return postgresData
    }
}

async function processSlashCommand(interaction: CommandInteraction, language: string) {
    const command = global.bot.slashCommands[interaction.data.name]

    // this cannot happen unless global.bot.slashCommands/global.bot.slashCommandsJSON is not modified
    if (!command) {
        await interaction.acknowledge()
        return interaction.deleteOriginalMessage()
    }

    if (command.type === 'owner' && !config.owners.includes(interaction.member!.id)) {
        await interaction.acknowledge()
        return interaction.deleteOriginalMessage()
    } else if (command.type === 'developer' && !config.developers.includes(interaction.member!.id))
        return interaction.createMessage({
            content: `${i18next.t('slashCommandHandler.developer_only_command', { lng: language, ns: 'translations' })}`,
        })
    else if (
        command.userPerm &&
        !(
            interaction.member!.permissions.has(command.userPerm?.map((a: string) => Constants.Permissions[a]).reduce((b: bigint, c: bigint) => b | c)) ||
            interaction.member!.id === (interaction.channel as TextChannel).guild.ownerID
        )
    )
        return interaction.createMessage({
            content: `${i18next.t('slashCommandHandler.missing_user_perm', {
                lng: language,
                ns: 'translations',
                perms: command.userPerm.map(r => `\`${i18next.t(`permissions.${r}`, { ns: 'translations', lng: language })}\``).join(', '),
                s: command.userPerm.length > 1 ? 's' : '',
            })}`,
        })
    else if (
        command.botPerm &&
        !(interaction.channel as TextChannel).permissionsOf(global.bot.user.id).has(command.botPerm?.map((a: string) => Constants.Permissions[a]).reduce((b: bigint, c: bigint) => b | c))
    )
        return interaction.createMessage({
            content: `${i18next.t('slashCommandHandler.missing_bot_perm', {
                lng: language,
                ns: 'translations',
                perms: command.userPerm.map(r => `\`${i18next.t(`permissions.${r}`, { ns: 'translations', lng: language })}\``).join(', '),
                s: command.userPerm.length > 1 ? 's' : '',
            })}`,
        })

    await command.func(interaction, language)

    /*
    const bp = interaction.channel.permissionsOf(global.bot.user.id).json

    if (!bp.viewChannel)
        return

    if (!bp.sendMessages)
        return interaction.createMessage({
            content: `${i18next.t('commandHandler.need_send_messages_permission', { lng: language, ns: 'translations' })}`
        })

    if (!bp.embedLinks)
        return interaction.channel.createMessage({
            content: `${i18next.t('commandHandler.need_embed_link_permission', { lng: language, ns: 'translations' })}`
        })
*/
}
