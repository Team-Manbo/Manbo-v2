import Manbo from 'manbo'

export = {
  func: async function (message: Manbo.Message<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, suffix: Array<string>, language: string) {
    if (!suffix[0])
      return message.channel.createMessage({
        content: 'Provide either `user` or `guild`',
        messageReference: { messageID: message.id },
        allowedMentions: { repliedUser: true },
      })
    else if (!['user', 'guild'].includes(suffix[0].toLowerCase()))
      return message.channel.createMessage({
        content: 'Provide either `user` or `guild`',
        messageReference: { messageID: message.id },
        allowedMentions: { repliedUser: true },
      })
    else if (!suffix[1])
      return message.channel.createMessage({
        content: 'Provide user or guild id to unblacklist',
        messageReference: { messageID: message.id },
        allowedMentions: { repliedUser: true },
      })

    const [type, id] = suffix

    if (type.toLowerCase() === 'guild') {
      if (await global.redis.get(`blacklist-guild-${id}`)) {
        await global.redis.del(`blacklist-guild-${id}`)
        return message.channel.createMessage({
          content: `Unblacklisted guild \`${id}\``,
          messageReference: { messageID: message.id },
          allowedMentions: { repliedUser: true },
        })
      }
      return message.channel.createMessage({
        content: 'this guild (or you provided wrong guild id dickhead) is not blacklisted',
        messageReference: { messageID: message.id },
        allowedMentions: { repliedUser: true },
      })
    } else if (type.toLowerCase() === 'user') {
      if (await global.redis.get(`blacklist-user-${id}`)) {
        await global.redis.del(`blacklist-user-${id}`)
        return message.channel.createMessage({
          content: `Unblacklisted user \`${id}\``,
          messageReference: { messageID: message.id },
          allowedMentions: { repliedUser: true },
        })
      }
      return message.channel.createMessage({
        content: 'this user (or you provided wrong user id dickhead) is not blacklisted',
        messageReference: { messageID: message.id },
        allowedMentions: { repliedUser: true },
      })
    }
  },
  name: 'unblacklist',
  description: 'Unblacklist user or guild',
  type: 'developer',
  hidden: true,
}
