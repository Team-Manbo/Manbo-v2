import i18next from 'i18next'
import { msLocalization, TimestampFormatter } from '../../utils/utils'
import PostgresCreate from '../../../database/interfaces/postgres/create'
import Manbo from 'manbo'

export = {
  func: async function (message: Manbo.Message<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, suffix: Array<string>, language: string) {
    if (!suffix[0])
      return message.channel.createMessage({
        content: `${i18next.t(`${this.type}.${this.name}.no_suffix`, { ns: 'commands', lng: language })}`,
      })

    const time = msLocalization(suffix[0])

    if (!time)
      return message.channel.createMessage({
        content: `${i18next.t(`${this.type}.${this.name}.provide_valid_time`, {
          lng: language,
          ns: 'commands',
        })}`,
      })
    else if (time < 1000 * 60)
      return message.channel.createMessage({
        content: `${i18next.t(`${this.type}.${this.name}.minute`, {
          lng: language,
          ns: 'commands',
        })}`,
      })
    else if (time > 1000 * 60 * 60 * 24 * 7 * 52 * 3)
      return message.channel.createMessage({
        content: `${i18next.t(`${this.type}.${this.name}.3_years`, {
          lng: language,
          ns: 'commands',
        })}`,
      })

    if (suffix.slice(1, suffix.length).join(' ').length > 1000)
      return message.channel.createMessage({
        content: `${i18next.t(`${this.type}.${this.name}.content_limit`, {
          lng: language,
          ns: 'commands',
        })}`,
      })

    const reason = suffix.length > 1 ? suffix.slice(1, suffix.length).join(' ') : i18next.t(`${this.type}.${this.name}.no_context`, { ns: 'commands', lng: language })

    // still testing
    await global.redis.set(`remindme-${message.author.id}-${message.guildID}-${message.id}`, `${Date.now()}`, 'EX', Number((time / 1000).toFixed(0)))
    await PostgresCreate.createRemindme(message.guildID, message.id, message.channel.id, global.aes.encrypt(reason))

    return message.channel.createMessage({
      content: `${TimestampFormatter.relativeTime(Date.now() + time)}, ${reason}`,
      messageReference: {
        messageID: message.id,
      },
      allowedMentions: {
        repliedUser: true,
      },
    })
  },
  name: 'remindme',
  description: 'remindme',
  type: 'utility',
  onlyCmdChannel: true,
}
