import PostgresRead from '../../database/interfaces/postgres/read'
import PostgresCreate from '../../database/interfaces/postgres/create'

export default async () => {
  const allGuilds = await PostgresRead.getAllGuilds()
  global.bot.guilds.forEach(async guild => {
    if (!allGuilds.find(g => g.id === guild.id)) {
      await PostgresCreate.createGuild(guild)
    }
  })
}
