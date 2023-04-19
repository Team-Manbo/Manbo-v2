import PostgresRed from '../../database/interfaces/postgres/read'
import GuildSettings from '../bases/GuildSettings'

export default async () => {
  const allDBGuilds = await PostgresRed.getAllGuilds()
  allDBGuilds.forEach(guild => {
    global.bot.guildSettingsCache[guild.id] = new GuildSettings(guild)
  })
}
