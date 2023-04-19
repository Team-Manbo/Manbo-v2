import Manbo, { Constants, CommandInteraction } from 'manbo'
import util from 'util'

export = {
    func: async function (interaction: CommandInteraction<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, language) {
        const codeOption = interaction.data.options?.find(i => i.name === 'code')
        try {
            const returned = eval(codeOption!.value as string)
            let str = util.inspect(returned, {
                depth: 1,
            })
            if (str.length > 1900) {
                str = `${str.substring(0, 1897)}...`
            }
            str = str.replace(new RegExp(global.BOT_TOKEN as string, 'gi'), '( ͡° ͜ʖ ͡°)')
            interaction
                .createMessage('```xl\n' + str + '\n```')
                .then(() => {
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
                                interaction.editOriginalMessage('```xl\n' + str + '\n```')
                            },
                            e => {
                                str = util.inspect(e, {
                                    depth: 1,
                                })
                                if (str.length > 1900) {
                                    str = str.substring(0, 1897)
                                    str = str + '...'
                                }
                                interaction.editOriginalMessage('```xl\n' + str + '\n```')
                            },
                        )
                    }
                })
                .catch(() => {})
        } catch (e) {
            if (interaction.acknowledged) return interaction.createFollowup('```xl\n' + e + '\n```')
            else return interaction.createMessage('```xl\n' + e + '\n```')
        }
    },
    name: 'eval',
    description: 'eval',
    options: [
        {
            name: 'code',
            description: 'a code to eval',
            type: Constants.ApplicationCommandOptionTypes.STRING,
            required: true,
        },
    ] as Manbo.ApplicationCommandOptions[],
    interactionType: Constants.ApplicationCommandTypes.CHAT_INPUT,
    type: 'owner',
}
