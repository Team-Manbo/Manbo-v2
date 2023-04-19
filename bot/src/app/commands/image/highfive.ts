import Manbo from 'manbo'
import i18next from 'i18next'
import { request } from 'undici'

export = {
    func: async function (message: Manbo.Message<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, suffix: Array<string>, language: string) {
        const { body } = await request(`https://api.waifu.pics/sfw/highfive`)
        return message.channel.createMessage({
            embed: {
                image: {
                    url: (await body.json()).url,
                },
                title: `${i18next.t(`${this.type}.${this.name}.title`, { ns: 'commands', lng: language })}`,
            },
        })
    },
    name: 'highfive',
    description: 'highfive image',
    type: 'image',
    onlyCmdChannel: true,
}
