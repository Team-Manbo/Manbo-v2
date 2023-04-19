import Manbo from 'manbo'
import i18next from 'i18next'

export = {
    func: async function (message: Manbo.Message<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, suffix: Array<string>, language: string) {
        const start = new Date().getTime()
        const msg = await message.channel.createMessage(`${i18next.t(`${this.type}.${this.name}.fetching`, { ns: 'commands', lng: language })}`)
        await msg.edit(
            `${i18next.t(`${this.type}.${this.name}.content`, {
                ns: 'commands',
                lng: language,
                msg: `${new Date().getTime() - start}`,
                shard: `${message.channel.guild.shard.latency}`,
                rest: `${global.bot.requestHandler.latencyRef.latency}`,
            })}`,
        )
    },
    name: 'ping',
    description: 'ping',
    type: 'general',
    onlyCmdChannel: true,
}
