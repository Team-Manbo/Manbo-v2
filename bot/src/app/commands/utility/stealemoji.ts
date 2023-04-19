import i18next from 'i18next'
import Manbo from 'manbo'
import {request} from 'undici'

export = {
    func: async function (message: Manbo.Message<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, suffix: Array<string>, language: string) {
        if (!suffix[0])
            return message.channel.createMessage({
                content: `${i18next.t(`${this.type}.${this.name}.no_emoji`, { ns: 'commands', lng: language })}`,
            })
        else if (suffix[0].split(':').length === 1)
            return message.channel.createMessage({
                content: `${i18next.t(`${this.type}.${this.name}.default_emoji`, { ns: 'commands', lng: language })}`,
            })
        const regex = new RegExp(/(<a?)?:\w+:(\d{18}>)?/g)
        if (!suffix[0].match(regex))
            return message.channel.createMessage({
                content: `${i18next.t(`${this.type}.${this.name}.not_an_emoji`, { ns: 'commands', lng: language })}`,
            })

        let text = suffix[0]
        if (text.includes('%')) text = decodeURIComponent(text)
        if (!text.includes(':')) return { animated: false, name: text, id: undefined }
        const match = text.match(/<?(?:(a):)?(\w{2,32}):(\d{17,19})?>?/)
        const info = match && { animated: Boolean(match[1]), name: match[2], id: match[3] }
        const type = info!.animated ? '.gif' : '.png'

        const {body} = await request(`https://cdn.discordapp.com/emojis/${info!.id + type}`)
        const res = await body.arrayBuffer()
        const emj = await message.channel.guild.createEmoji({
            image: Buffer.from(res).toString('base64'),
            name: info!.name,
        })

        await message.channel.createMessage({
            content: `${i18next.t(`${this.type}.${this.name}.uploaded_emoji`, { ns: 'commands', lng: language })}`,
        })
        await message.channel.createMessage({
            content: `${emj}`,
        })
    },
    name: 'stealemoji',
    description: 'stealemoji',
    type: 'utility',
    onlyCmdChannel: true,
    userPerm: ['manageEmojisAndStickers'],
    botPerm: ['manageEmojisAndStickers'],
}
