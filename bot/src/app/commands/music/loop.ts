import Manbo from 'manbo'
import i18next from 'i18next'
import { InteractionCollector } from 'manbo-collector'
import { checkBasic, getDispatcher } from '../../utils/audio'

export = {
    func: async function (message: Manbo.Message<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, suffix: Array<string>, language: string) {
        const basicCheck = checkBasic(message.member, language)
        if (typeof basicCheck === 'string')
            return message.channel.createMessage({
                content: `${basicCheck}`,
            })
        const dispatcher = getDispatcher(message.guildID, language)
        if (typeof dispatcher === 'string')
            return message.channel.createMessage({
                content: `${dispatcher}`,
            })

        const msg = await message.channel.createMessage({
            content: `${i18next.t(`${this.type}.${this.name}.choose_mode`, { ns: 'commands', lng: language })}`,
            components: [
                {
                    type: Manbo.Constants.ComponentTypes.ACTION_ROW,
                    components: [
                        {
                            type: Manbo.Constants.ComponentTypes.BUTTON,
                            label: `${capLetter(i18next.t(`${this.type}.${this.name}.off`, { ns: 'commands', lng: language }))}`,
                            custom_id: `off`,
                            style: Manbo.Constants.ButtonStyles.PRIMARY,
                        },
                        {
                            type: Manbo.Constants.ComponentTypes.BUTTON,
                            label: `${capLetter(i18next.t(`${this.type}.${this.name}.track`, { ns: 'commands', lng: language }))}`,
                            custom_id: `track`,
                            style: Manbo.Constants.ButtonStyles.PRIMARY,
                        },
                        {
                            type: Manbo.Constants.ComponentTypes.BUTTON,
                            label: `${capLetter(i18next.t(`${this.type}.${this.name}.queue`, { ns: 'commands', lng: language }))}`,
                            custom_id: `queue`,
                            style: Manbo.Constants.ButtonStyles.PRIMARY,
                        },
                    ],
                },
            ],
        })

        const collector = new InteractionCollector(global.bot, {
            interactionType: Manbo.Constants.InteractionTypes.MESSAGE_COMPONENT,
            componentType: Manbo.Constants.ComponentTypes.BUTTON,
            time: 30_000,
            dispose: true,
            message: msg,
        })

        collector.on('collect', async collected => {
            // member shouldnt be undefined
            const checkInVC = checkBasic(collected.member!, language)
            if (typeof checkInVC === 'string') {
                await collected.defer(64)
                return collected.createFollowup({
                    content: `${checkInVC}`,
                    flags: 64,
                })
            }

            const mode = collected.data.custom_id
            switch (mode) {
                case 'off': {
                    dispatcher.repeat = 'off'
                    collector.stop()
                    break
                }
                case 'track': {
                    dispatcher.repeat = 'track'
                    collector.stop()
                    break
                }
                case 'queue': {
                    dispatcher.repeat = 'queue'
                    collector.stop()
                    break
                }
            }

            const i18n_mode = i18next.t(`${this.type}.${this.name}.${mode}`, {ns: 'commmands', lng: language})
            await collected.editParent({
                content: `${i18next.t(`${this.type}.${this.name}.changed_mode`, { ns: 'commands', lng: language, mode: `${i18n_mode}` })}`,
            })
        })

        collector.on('end', (collected, reason) => {
            if (reason === 'time')
                return msg.edit({
                    content: `${i18next.t(`${this.type}.${this.name}.timed_out`, { ns: 'commands', lng: language })}`,
                    components: [],
                })
            else
                return msg.edit({
                    components: [],
                })
        })
    },
    name: 'loop',
    description: 'loop',
    type: 'music',
    onlyCmdChannel: true,
}

function capLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
}