import Manbo from 'manbo'
import i18next from 'i18next'
import PostgresRead from '../../../database/interfaces/postgres/read'
import PostgresCreate from '../../../database/interfaces/postgres/create'

export = {
    func: async function (message: Manbo.Message<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, suffix: Array<string>, language: string) {
        const res = await PostgresRead.getEconomyValue(message.member.id)
        if (res) {
            return message.channel.createMessage({
                content: `${i18next.t(`${this.type}.${this.name}.alr_registered`, {
                    ns: 'commands',
                    lng: language,
                })}`,
            })
        }

        const check = await global.redis.get(`economy-cooldown-${message.author.id}`)
        if (check)
        return message.channel.createMessage({
            content: `${i18next.t(`${this.type}.${this.name}.cooldown`, {
                ns: 'commands',
                lng: language,
            })}`,
        })

        await PostgresCreate.registerEconomy(message.member.id, message.guildID)

        return message.channel.createMessage({
            content: `${i18next.t(`${this.type}.${this.name}.registered`, {
                ns: 'commands',
                lng: language,
            })}`,
        })
    },
    name: 'register',
    description: 'register',
    type: 'economy',
    onlyCmdChannel: true,
}
