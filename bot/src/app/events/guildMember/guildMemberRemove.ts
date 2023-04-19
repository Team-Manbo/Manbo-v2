import { Guild, Member } from 'manbo'

export = {
    name: 'guildMemberRemove',
    type: 'on',
    handle: async (guild: Guild, member: Member) => {
        if (await global.bot.checkZeroDowntimeUUID('guildMemberRemove')) return

        if (guild?.id !== '1019780126109618258') return
        try {
            // await global.redis.del(`tester-${member.id}`)
        } catch (err) {
            console.log(err)
        }
    },
}
