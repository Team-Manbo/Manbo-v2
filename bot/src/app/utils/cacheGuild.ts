import PostgresRead from '../../database/interfaces/postgres/read'
import GuildSettings from '../bases/GuildSettings'

export default async (guildID: string) => {
  const doc = await PostgresRead.getGuild(guildID)
  global.bot.guildSettingsCache[guildID] = new GuildSettings(doc)
}
