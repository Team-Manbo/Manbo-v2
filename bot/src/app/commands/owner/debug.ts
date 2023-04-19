import ManboDebugger from 'manbo-debugger'
import PostgresRead from '../../../database/interfaces/postgres/read'
import config from '../../../config'
import i18next from 'i18next'
import Manbo from 'manbo'

export = {
  func: async function (message: Manbo.Message<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, suffix: Array<string>, language: string) {
    const settings = await PostgresRead.getSetting(message.guildID)
    const BugHunter = new ManboDebugger(global.bot, {
      aliases: i18next.t(`${this.type}.${this.name}.aliases`, {
        ns: 'commands',
        lng: language,
      }),
      prefix: settings.prefix,
      owners: config.owners,
      secrets: [...config.lavalink.map(r => r.url), ...config.lavalink.map(r => r.auth)],
    })
    BugHunter.run(message)
  },
  name: 'debug',
  description: 'Bot owner debug command.',
  type: 'owner',
  hidden: true,
}
