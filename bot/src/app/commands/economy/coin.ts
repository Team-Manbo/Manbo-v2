import Manbo from 'manbo'
import i18next from 'i18next'
import PostgresRead from '../../../database/interfaces/postgres/read'

export = {
    func: async function (message: Manbo.Message<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, suffix: Array<string>, language: string) {
        let target: Manbo.User
        if (!suffix[0]) 
            target = message.author
        else {
            const checkRESTUser = await global.bot.getRESTUser(message.mentions[message.mentions.length - 1]?.id || suffix[0]).catch(() => null)
            if (!checkRESTUser)
                return message.channel.createMessage({
                    content: `${i18next.t(`${this.type}.${this.name}.invalid_user`, {
                        ns: 'commands',
                        lng: language,
                    })}`,
                })
            else target = checkRESTUser
        }

        const res = await PostgresRead.getEconomyValue(target.id)
        if (!res) {
            const postgresData = await PostgresRead.getSetting(message.guildID)
            return message.channel.createMessage({
                content: `${i18next.t(`${this.type}.${this.name}.not_registered_${target.id === message.member.id ? 'member' : 'user'}`, {
                    ns: 'commands',
                    lng: language,
                    prefix: `${postgresData.prefix}`,
                })}`,
            })
        }

        return message.channel.createMessage({
            content: `${i18next.t(`${this.type}.${this.name}.content`, {
                ns: 'commands',
                lng: language,
                coin: `${global.bot.stringToComma(res.coin)}`,
                percent: `${res.percentage}`,
            })}`,
        })
    },
    name: 'coin',
    description: 'coin',
    type: 'economy',
    onlyCmdChannel: true,
}
