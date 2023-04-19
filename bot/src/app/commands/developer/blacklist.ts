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
        content: 'Provide user or guild id to blacklist',
        messageReference: { messageID: message.id },
        allowedMentions: { repliedUser: true },
      })

    let [type, id, ...reason_args] = suffix

    let user, guild

    const reason = reason_args.join(' ').length > 1 ? reason_args.join(' ') : 'No reason specified'

    if (type.toLowerCase() === 'guild') {
      guild = await global.bot.getRESTGuild(id).catch(() => {
        return null
      })
      if (!guild)
        return message.channel.createMessage({
          content: 'Invalid guild id',
          messageReference: { messageID: message.id },
          allowedMentions: { repliedUser: true },
        })
      if (await global.redis.get(`blacklist-guild-${guild.id}`))
        return message.channel.createMessage({
          content: 'This guild is already blacklisted',
          messageReference: { messageID: message.id },
          allowedMentions: { repliedUser: true },
        })
      await global.redis.set(`blacklist-guild-${guild.id}`, Date.now())
      return message.channel.createMessage({
        content: `Blacklisted guild \`${guild.name}\` (\`${guild.id}\`)\n> ${reason}`,
      })
    } else if (type.toLowerCase() === 'user') {
      user = await global.bot.getRESTUser(id).catch(() => {
        return null
      })
      if (!user)
        return message.channel.createMessage({
          content: 'Invalid user id',
          messageReference: { messageID: message.id },
          allowedMentions: { repliedUser: true },
        })
      if (await global.redis.get(`blacklist-user-${user.id}`))
        return message.channel.createMessage({
          content: 'This user is already blacklisted',
          messageReference: { messageID: message.id },
          allowedMentions: { repliedUser: true },
        })
      await global.redis.set(`blacklist-user-${user.id}`, Date.now())
      return message.channel.createMessage({
        content: `Blacklisted user \`${user.username}#${user.discriminator}\` (\`${user.id}\`)\n> ${reason}`,
      })
    }
  },
  name: 'blacklist',
  description: 'Blacklist user or guild',
  type: 'developer',
  hidden: true,
}
