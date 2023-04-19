import cluster from 'cluster'
import Manbo, { Interaction } from 'manbo'
import slashCommandHandler from '../../modules/slashCommandHandler'
import cacheGuild from '../../utils/cacheGuild'
import PostgresCreate from '../../../database/interfaces/postgres/create'

export = {
  name: 'interactionCreate',
  type: 'on',
  handle: async (interaction: Interaction) => {
    if (await global.bot.checkZeroDowntimeUUID('interactionCreate')) return

    if (interaction instanceof Manbo.CommandInteraction) {
      if (!interaction.guildID) {
        // console.log(interaction)
        return interaction.createMessage({
          content: `You can't use slash command in a DM!`,
        })
      } else {
        // console.log(interaction.data)
        await slashCommandHandler(interaction)
        // await interaction.acknowledge()
        // return interaction.deleteOriginalMessage()
      }
    } else if (interaction instanceof Manbo.ComponentInteraction) {
      // await interaction.acknowledge()
      // return interaction.deleteOriginalMessage()
    }
  },
}
