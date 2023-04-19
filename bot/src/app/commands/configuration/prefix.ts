import Manbo from 'manbo'
import i18next from 'i18next'
import pool from '../../../database/clients/postgres'
import PostgresRead from '../../../database/interfaces/postgres/read'

export = {
  func: async function (message: Manbo.Message<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, suffix: Array<string>, language: string) {
    if (!suffix[0])
      return message.channel.createMessage({
        content: `${i18next.t(`${this.type}.${this.name}.need_prefix`, { lng: language, ns: 'commands' })}`,
        messageReference: {
          messageID: message.id,
        },
        allowedMentions: {
          repliedUser: true,
        },
      })
    else if (suffix[0].length > 10)
      return message.channel.createMessage({
        content: `${i18next.t(`${this.type}.${this.name}.prefix_too_long`, { lng: language, ns: 'commands' })}`,
        messageReference: {
          messageID: message.id,
        },
        allowedMentions: {
          repliedUser: true,
        },
      })
    await pool.query('UPDATE settings SET prefix=$1 WHERE id=$2;', [suffix[0], message.guildID])
    const postgresData = await PostgresRead.getSetting(message.guildID)
    await global.redis.set(`setting-${message.guildID}`, JSON.stringify(postgresData), 'EX', 60)
    return message.channel.createMessage({
      content: `${i18next.t(`${this.type}.${this.name}.changed_prefix`, { lng: language, ns: 'commands', prefix: suffix[0] })}`,
    })
  },
  name: 'prefix',
  description: 'Change the prefix of the bot',
  type: 'configuration',
  userPerm: ['manageGuild'],
}
