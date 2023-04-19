import util from 'util'
import Manbo from 'manbo'

export = {
    func: async function (message: Manbo.Message<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, suffix: Array<string>, language: string) {
        try {
            const returned = eval(suffix.join(' '))
            let str = util.inspect(returned, {
                depth: 1,
            })
            if (str.length > 1900) {
                str = `${str.substring(0, 1897)}...`
            }
            str = str.replace(new RegExp(global.BOT_TOKEN as string, 'gi'), '( ͡° ͜ʖ ͡°)')
            message.channel
                .createMessage('```xl\n' + str + '\n```')
                .then(ms => {
                    if (returned !== undefined && returned !== null && typeof returned.then === 'function') {
                        returned.then(
                            () => {
                                str = util.inspect(returned, {
                                    depth: 1,
                                })
                                if (str.length > 1900) {
                                    str = str.substring(0, 1897)
                                    str = str + '...'
                                }
                                ms.edit('```xl\n' + str + '\n```')
                            },
                            e => {
                                str = util.inspect(e, {
                                    depth: 1,
                                })
                                if (str.length > 1900) {
                                    str = str.substring(0, 1897)
                                    str = str + '...'
                                }
                                ms.edit('```xl\n' + str + '\n```')
                            },
                        )
                    }
                })
                .catch(() => {})
        } catch (e) {
            message.channel.createMessage('```xl\n' + e + '\n```').catch(() => {})
        }
    },
    name: 'eval',
    description: 'Bot owner debug command.',
    type: 'owner',
    hidden: true,
}
