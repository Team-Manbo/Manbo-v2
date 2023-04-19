import Manbo from 'manbo'
import i18next from 'i18next'
import PostgresRead from '../../../database/interfaces/postgres/read'
import pool from '../../../database/clients/postgres'

export = {
    func: async function (message: Manbo.Message<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, suffix: Array<string>, language: string) {
        const res = await PostgresRead.getEconomyValue(message.member.id)
        if (!res) {
            return message.channel.createMessage({
                content: `${i18next.t(`${this.type}.${this.name}.not_signouted`, {
                    ns: 'commands',
                    lng: language,
                })}`,
            })
        }

        await pool.query('DELETE FROM economy WHERE user_id=$1;', [message.author.id])
        await global.redis.set(`economy-cooldown-${message.author.id}`, res.coin, 'EX', 60 * 30)

        return message.channel.createMessage({
            content: `${i18next.t(`${this.type}.${this.name}.signouted`, {
                ns: 'commands',
                lng: language,
            })}`,
        })
    },
    name: 'signout',
    description: 'signout',
    type: 'economy',
    onlyCmdChannel: true,
}
