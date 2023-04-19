import Manbo from 'manbo'
import { fetch } from 'undici'

export = {
    func: async function (message: Manbo.Message<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, suffix: Array<string>, language: string) {
        const res = await fetch(`https://www.reddit.com/r/memes/random/.json`)
        const content: any = await res.json()
        return message.channel.createMessage({
            embed: {
                image: {
                    url: `${content[0].data.children[0].data.url}`,
                },
                title: `${content[0].data.children[0].data.title}`,
                footer: {
                    text: `👍 ${content[0].data.children[0].data.ups} 💬 ${content[0].data.children[0].data.num_comments}`,
                },
            },
        })
    },
    name: 'meme',
    description: 'meme generator',
    type: 'image',
    onlyCmdChannel: true,
}
