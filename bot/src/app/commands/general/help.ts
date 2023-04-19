import i18next from 'i18next'
import Manbo from 'manbo'
import { InteractionCollector } from 'manbo-collector'
import PostgresRead from '../../../database/interfaces/postgres/read'
import config from '../../../config'
import Command from '../../bases/Command'

export = {
    func: async function (message: Manbo.Message<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, suffix: Array<string>, language: string) {
        const res = await PostgresRead.getSetting(message.guildID)

        let commands: Array<Command> = Object.values(global.bot.commands)
        if (!config.owners.includes(message.author.id)) commands = commands.filter(r => r.type !== 'owner')
        if (!config.developers.includes(message.author.id)) commands = commands.filter(r => r.type !== 'developer')

        const categories = new Set([...commands.map(r => r.type)])

        if (!suffix[0]) {
            let embedFields: Array<Manbo.EmbedField> = []
            let selectMenuComponents: Array<Manbo.SelectMenuOptions> = [
                {
                    label: `home`,
                    description: `its a menu to home bozo`,
                    value: `home`,
                },
            ]
            for (const category of categories.values()) {
                embedFields.push({
                    name: `${category}`,
                    value: `${i18next.t(`${this.type}.${this.name}.no_suffix_description`, {
                        ns: 'commands',
                        lng: language,
                        category: `${category}`,
                        prefix: `${res.prefix}`,
                    })}`,
                    inline: true,
                })
                selectMenuComponents.push({
                    label: `${category}`,
                    description: `${i18next.t(`${this.type}.${this.name}.no_suffix_description`, {
                        ns: 'commands',
                        lng: language,
                        category: `${category}`,
                        prefix: `${res.prefix}`,
                    })}`,
                    value: `${category}`,
                })
            }

            const messageData = {
                embeds: [
                    {
                        color: global.bot.Constants.EMBED_COLORS.DEFAULT,
                        title: `${i18next.t(`${this.type}.${this.name}.no_suffix_title`, {
                            ns: 'commands',
                            lng: language,
                        })}`,
                        description: `${i18next.t(`${this.type}.${this.name}.no_suffix_description`, {
                            ns: 'commands',
                            lng: language,
                        })}`,
                        footer: {
                            text: `${i18next.t(`${this.type}.${this.name}.no_suffix_footer`, {
                                ns: 'commands',
                                lng: language,
                                prefix: `${res.prefix}`,
                            })}`,
                            icon_url: `${message.author.dynamicAvatarURL('png')}`,
                        },
                        fields: embedFields,
                    },
                ],
                components: [
                    {
                        type: Manbo.Constants.ComponentTypes.ACTION_ROW,
                        components: [
                            {
                                type: Manbo.Constants.ComponentTypes.STRING_SELECT,
                                custom_id: 'command_help',
                                placeholder: `${i18next.t(`${this.type}.${this.name}.selectmenu_placeholder`, {
                                    ns: 'commands',
                                    lng: language,
                                })}`,
                                options: selectMenuComponents,
                            },
                        ],
                    },
                ],
            }

            const msg = await message.channel.createMessage(messageData)

            const collector = new InteractionCollector(global.bot, {
                interactionType: Manbo.Constants.InteractionTypes.MESSAGE_COMPONENT,
                componentType: Manbo.Constants.ComponentTypes.STRING_SELECT,
                time: 60_000 * 3,
                dispose: true,
                message: msg,
            })

            collector.on('collect', async collected => {
                if (collected.member!.id !== message.author!.id) {
                    await collected.defer(64)
                    return collected.createFollowup({
                        content: `${i18next.t(`${this.type}.${this.name}.cannot_interact`, {
                            ns: 'commands',
                            lng: language,
                        })}`,
                        flags: 64,
                    })
                }

                const customID = collected.data.values[0]
                if (customID === 'home') await collected.editParent(messageData)
                else
                    await collected.editParent({
                        embeds: [
                            {
                                color: global.bot.Constants.EMBED_COLORS.DEFAULT,
                                title: `${customID}`,
                                description: commands
                                    .filter(r => r.type === customID)
                                    .map(
                                        r =>
                                            `\`${r.name} ${' '.repeat(
                                                commands.filter(r => r.type === customID).reduce((a, b) => (a.name.length > b.name.length ? a : b)).name.length - r.name.length,
                                            )}:\` ${i18next.t([`${r.type}.${r.name}.info.description`, `${r.description}`], {
                                                ns: 'commands',
                                                lng: language,
                                            })}`,
                                    )
                                    .join('\n'),
                                footer: {
                                    text: `${i18next.t(`${this.type}.${this.name}.no_suffix_footer`, {
                                        ns: 'commands',
                                        lng: language,
                                        prefix: `${res.prefix}`,
                                    })}`,
                                    icon_url: `${message.author.dynamicAvatarURL('png')}`,
                                },
                            },
                        ],
                    })
            })

            collector.on('end', () => {
                msg.edit({
                    components: [],
                })
            })
        } else if (categories.has(suffix[0].toLowerCase())) {
            const categoryCommands = commands.filter(r => r.type === suffix[0].toLowerCase())
            let selectMenuComponents: Array<Manbo.SelectMenuOptions> = [
                {
                    label: `home`,
                    description: `its a menu to home bozo`,
                    value: `home`,
                },
            ]

            for (const command of categoryCommands) {
                selectMenuComponents.push({
                    label: `${command.name}`,
                    description: `${i18next.t(`${this.type}.${this.name}.category_description`, {
                        ns: 'commands',
                        lng: language,
                        command: `${command.name}`,
                        prefix: `${res.prefix}`,
                    })}`,
                    value: `${command.name}`,
                })
            }

            const messageData = {
                embeds: [
                    {
                        color: global.bot.Constants.EMBED_COLORS.DEFAULT,
                        title: `${suffix[0].toLowerCase()} - TODO: make translation method/file for category only translations`,
                        footer: {
                            text: `${i18next.t(`${this.type}.${this.name}.category_footer`, {
                                ns: 'commands',
                                lng: language,
                                prefix: `${res.prefix}`,
                            })}`,
                            icon_url: `${message.author.dynamicAvatarURL('png')}`,
                        },
                        description: categoryCommands
                            .map(
                                r =>
                                    `\`${r.name} ${' '.repeat(categoryCommands.reduce((a, b) => (a.name.length > b.name.length ? a : b)).name.length - r.name.length)}:\` ${i18next.t(
                                        [`${r.type}.${r.name}.info.description`, `${r.description}`],
                                        {
                                            ns: 'commands',
                                            lng: language,
                                        },
                                    )}`,
                            )
                            .join('\n'),
                    },
                ],
                components: [
                    {
                        type: Manbo.Constants.ComponentTypes.ACTION_ROW,
                        components: [
                            {
                                type: Manbo.Constants.ComponentTypes.STRING_SELECT,
                                custom_id: 'command_category_help',
                                placeholder: `${i18next.t(`${this.type}.${this.name}.selectmenu_placeholder_category`, {
                                    ns: 'commands',
                                    lng: language,
                                })}`,
                                options: selectMenuComponents,
                            },
                        ],
                    },
                ],
            }

            const msg = await message.channel.createMessage(messageData)

            const collector = new InteractionCollector(global.bot, {
                interactionType: Manbo.Constants.InteractionTypes.MESSAGE_COMPONENT,
                componentType: Manbo.Constants.ComponentTypes.STRING_SELECT,
                time: 60_000 * 3,
                dispose: true,
            })

            collector.on('collect', async collected => {
                if (collected.member!.id !== message.author!.id) {
                    await collected.defer(64)
                    return collected.createFollowup({
                        content: `${i18next.t(`${this.type}.${this.name}.cannot_interact`, {
                            ns: 'commands',
                            lng: language,
                        })}`,
                        flags: 64,
                    })
                }

                const customID = collected.data.values[0]
                if (customID === 'home') await collected.editParent(messageData)
                else {
                    const cmd: Command = commands.find(r => r.name === customID)!
                    await collected.editParent({
                        embeds: [
                            {
                                color: global.bot.Constants.EMBED_COLORS.DEFAULT,
                                title: `${cmd.name}`,
                                description: `${i18next.t([`${cmd.type}.${cmd.name}.info.description`, cmd.description], {
                                    ns: 'commands',
                                    lng: language,
                                })}`,
                                footer: {
                                    text: `${i18next.t(`${this.type}.${this.name}.category_footer`, {
                                        ns: 'commands',
                                        lng: language,
                                        prefix: `${res.prefix}`,
                                    })}`,
                                    icon_url: `${message.author.dynamicAvatarURL('png')}`,
                                },
                            },
                        ],
                    })
                }
            })

            collector.on('end', () => {
                msg.edit({
                    components: [],
                })
            })
        } else if (commands.find(r => r.name === suffix[0].toLowerCase())) {
            const cmd: Command = commands.find(r => r.name === suffix[0].toLowerCase())!
            return message.channel.createMessage({
                embeds: [
                    {
                        color: global.bot.Constants.EMBED_COLORS.DEFAULT,
                        title: `${i18next.t([`${cmd.type}.${cmd.name}.info.name`, cmd.name], {
                            ns: 'commands',
                            lng: language,
                        })}`,
                        description: `${i18next.t([`${cmd.type}.${cmd.name}.info.description`, cmd.description], {
                            ns: 'commands',
                            lng: language,
                        })}`,
                        footer: {
                            text: `${i18next.t(`${this.type}.${this.name}.requirements`, {
                                ns: 'commands',
                                lng: language,
                            })}`,
                            icon_url: `${message.author.dynamicAvatarURL('png')}`,
                        },
                        fields: [
                            {
                                name: 'titles here',
                                value: 'various descriptions here',
                                inline: true,
                            },
                        ],
                    },
                ],
            })
        } else {
            return message.channel.createMessage({
                content: `${i18next.t(`${this.type}.${this.name}.data_not_found`, {
                    ns: 'commands',
                    lng: language,
                })}`,
            })
        }
    },
    name: 'help',
    description: 'get help',
    type: 'general',
}
