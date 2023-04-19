import Manbo from 'manbo'
import { send } from '../../../miscellaneous/WebsocketClient'

export = {
  func: async function (message: Manbo.Message<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, suffix: Array<string>, language: string) {
    if (!suffix[0])
      return message.channel.createMessage({
        content: 'Provide `commands` or `slash` or `events` or `locales`',
        messageReference: { messageID: message.id },
        allowedMentions: { repliedUser: true },
      })

    if (!['commands', 'slash', 'events', 'locales'].includes(suffix[0].toLowerCase()))
      return message.channel.createMessage({
        content: 'Provide `commands` or `slash` or `events` or `locales`',
        messageReference: { messageID: message.id },
        allowedMentions: { repliedUser: true },
      })

    const msg = await message.channel.createMessage({
      content: `🔄 **Reloading ${suffix[0].toLowerCase()}...**`,
    })
    send({
      op: '10010',
      c: {
        type: `${suffix[0].toLowerCase()}`,
        channelID: msg.channel.id,
        messageID: msg.id,
      },
    })
  },
  name: 'reload',
  description: 'Reload events and commands and locales',
  type: 'developer',
  hidden: true,
}
