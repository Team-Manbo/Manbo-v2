import Manbo from 'manbo'

export = {
  func: async function (message: Manbo.Message<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, suffix: Array<string>, language: string) {
    if (suffix[0]) {
      const guild = global.bot.guilds.get(suffix[0])
      if (!guild) return message.channel.createMessage('invalid guild id asshole')
      try {
        await global.bot.bulkEditGuildCommands(guild.id, global.bot.slashCommandsJSON)
      } catch (e) {
        global.logger.error(e)
        return message.channel.createMessage(`failed to push slash commands, see some console shits bozo`)
      }
      return message.channel.createMessage(`successfully pushed ${global.bot.slashCommandsJSON.length} slash commands to \`${guild.name}\` guild`)
    } else {
      try {
        await global.bot.bulkEditCommands(global.bot.slashCommandsJSON)
      } catch (e) {
        global.logger.error(e)
        return message.channel.createMessage(`failed to push slash commands, see some console shits bozo`)
      }
      return message.channel.createMessage(`successfully pushed ${global.bot.slashCommandsJSON.length} slash commands globally`)
    }
  },
  name: 'deploy-slash',
  description: 'Deploy slash commands global or to a guild',
  type: 'developer',
}
