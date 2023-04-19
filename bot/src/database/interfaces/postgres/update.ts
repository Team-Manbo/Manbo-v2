import pool from '../../clients/postgres'
import PostgresCreate from './create'
import config from '../../../config'

async function updateLanguage(guildID: string, language: string): Promise<void> {
  const res = await pool.query('SELECT language from settings WHERE id=$1;', [guildID])
  if (res.rows.lengthh === 0) {
    const guild = global.bot.guilds.get(guildID)
    if (guild) {
      await PostgresCreate.createSetting(guild)
      return await updateLanguage(guildID, config.defaultLanguage)
    }
  } else {
    await pool.query('UPDATE settings SET language = $1 WHERE id = $2;', [language, guildID])
  }
}

export default {
  updateLanguage,
}
