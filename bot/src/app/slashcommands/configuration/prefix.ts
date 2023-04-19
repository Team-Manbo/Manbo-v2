import i18next from 'i18next'
import pool from '../../../database/clients/postgres'
import Manbo, { Constants, CommandInteraction } from 'manbo'

export = {
  func: async function (interaction: CommandInteraction<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, language) {
    const prefix = interaction.data.options?.find(i => i.name === 'prefix')
    return interaction.createMessage('test')
  },
  name: 'prefix',
  description: 'Change the prefix of the bot',
  options: [
    {
      name: 'prefix',
      description: 'A new prefix for the bot',
      type: Constants.ApplicationCommandOptionTypes.STRING,
      required: true,
    },
  ] as Manbo.ApplicationCommandOptions[],
  interactionType: Constants.ApplicationCommandTypes.CHAT_INPUT,
  type: 'configuration',
  userPerm: ['manageGuild'],
}
