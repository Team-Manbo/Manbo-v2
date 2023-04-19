import { Guild, Member } from 'manbo'

export = {
  name: 'guildMemberAdd',
  type: 'on',
  handle: async (guild: Guild, member: Member) => {
    if (await global.bot.checkZeroDowntimeUUID('guildMemberAdd')) return

    if (guild?.id !== '1019780126109618258') return
    try {
      // await global.redis.set(`tester-${member.id}`, Date.now())
      await member.addRole('1019780126130581584')
    } catch (err) {
      console.log(err)
    }
  },
}
