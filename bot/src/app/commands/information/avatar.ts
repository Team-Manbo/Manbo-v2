import i18next from 'i18next'
import Manbo, { Member, Message, TextChannel, User } from 'manbo'
import { InteractionCollector } from 'manbo-collector'

export = {
    func: async function (message: Manbo.Message<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, suffix: Array<string>, language: string) {
        if (suffix[0]) {
            const checkID =
                message.mentions[message.mentions.length - 1]?.id ||
                message.channel.guild.members.get(suffix[0])?.id ||
                (await global.bot.getRESTGuildMember(message.guildID, suffix[0]).catch(() => null))?.id ||
                null
            if (checkID) {
                const target: Member = await global.bot.getRESTGuildMember(message.guildID, checkID)
                await MemberAvatar(message, target, language, this.type, this.name)
            } else {
                const checkRESTUser = await global.bot.getRESTUser(suffix[0]).catch(() => {})
                if (checkRESTUser) {
                    await UserAvatar(message, checkRESTUser, language, this.type, this.name)
                } else {
                    return message.channel.createMessage({
                        content: `${i18next.t(`${this.type}.${this.name}.invalid_user`, {
                            ns: 'commands',
                            lng: language,
                        })}`,
                        messageReference: { messageID: message.id },
                    })
                }
            }
        } else {
            await MemberAvatar(message, message.member, language, this.type, this.name)
        }
    },
    name: 'avatar',
    description: "See a user's avatar",
    type: 'information',
    onlyCmdChannel: true,
}

async function MemberAvatar(message: Manbo.Message<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, target: Member, language: string, type: string, name: string): Promise<void> {
    const msg = await message.channel.createMessage({
        embed: {
            image: {
                url: target.user.dynamicAvatarURL('png', 2048),
            },
            description: `${i18next.t(`${type}.${name}.user_profile`, { ns: 'commands', lng: language })} | [${i18next.t(`${type}.${name}.download`, {
                ns: 'commands',
                lng: language,
            })}](${target.user.dynamicAvatarURL('png', 2048)})`,
        },
        components: [
            {
                type: Manbo.Constants.ComponentTypes.ACTION_ROW,
                components: [
                    {
                        type: Manbo.Constants.ComponentTypes.BUTTON,
                        style: Manbo.Constants.ButtonStyles.SECONDARY,
                        label: `${i18next.t(`${type}.${name}.server_profile`, { ns: 'commands', lng: language })}`,
                        custom_id: `server_profile`,
                        disabled: target.avatar === null,
                    },
                ],
            },
        ],
    })

    const collector = new InteractionCollector(global.bot, {
        interactionType: Manbo.Constants.InteractionTypes.MESSAGE_COMPONENT,
        componentType: Manbo.Constants.ComponentTypes.BUTTON,
        time: 60_000,
        dispose: true,
        filter: interaction => interaction.member!.id === message.author.id,
    })

    collector.on('collect', async collected => {
        await collected.deferUpdate()
        if (collected.data.custom_id === 'server_profile')
            await msg.edit({
                embeds: [
                    {
                        image: {
                            url: `https://cdn.discordapp.com/guilds/${message.guildID}/users/${target.id}/avatars/${target.avatar}.png?size=2048`,
                        },
                        description: `${i18next.t(`${type}.${name}.server_profile`, { ns: 'commands', lng: language })} | [${i18next.t(`${type}.${name}.download`, {
                            ns: 'commands',
                            lng: language,
                        })}](https://cdn.discordapp.com/guilds/${message.guildID}/users/${target.id}/avatars/${target.avatar}.png?size=2048)`,
                    },
                ],
                components: [
                    {
                        type: Manbo.Constants.ComponentTypes.ACTION_ROW,
                        components: [
                            {
                                type: Manbo.Constants.ComponentTypes.BUTTON,
                                style: Manbo.Constants.ButtonStyles.SECONDARY,
                                label: `${i18next.t(`${type}.${name}.user_profile`, {
                                    ns: 'commands',
                                    lng: language,
                                })}`,
                                custom_id: `user_profile`,
                            },
                        ],
                    },
                ],
            })
        else if (collected.data.custom_id === 'user_profile')
            await msg.edit({
                embeds: [
                    {
                        image: {
                            url: target.user.dynamicAvatarURL('png', 2048),
                        },
                        description: `${i18next.t(`${type}.${name}.user_profile`, { ns: 'commands', lng: language })} | [${i18next.t(`${type}.${name}.download`, {
                            ns: 'commands',
                            lng: language,
                        })}](${target.user.dynamicAvatarURL('png', 2048)})`,
                    },
                ],
                components: [
                    {
                        type: Manbo.Constants.ComponentTypes.ACTION_ROW,
                        components: [
                            {
                                type: Manbo.Constants.ComponentTypes.BUTTON,
                                style: Manbo.Constants.ButtonStyles.SECONDARY,
                                label: `${i18next.t(`${type}.${name}.server_profile`, {
                                    ns: 'commands',
                                    lng: language,
                                })}`,
                                custom_id: `server_profile`,
                            },
                        ],
                    },
                ],
            })
    })

    collector.on('end', async () => {
        await msg.edit({
            components: [],
        })
    })
}

async function UserAvatar(message: Manbo.Message<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, target: User, language: string, type: string, name: string): Promise<void> {
    await message.channel.createMessage({
        embed: {
            image: {
                url: target.dynamicAvatarURL('png', 2048),
            },
            description: `${i18next.t(`${type}.${name}.user_profile`, { ns: 'commands', lng: language })} | [${i18next.t(`${type}.${name}.download`, {
                ns: 'commands',
                lng: language,
            })}](${target.dynamicAvatarURL('png', 2048)})`,
        },
    })
}
