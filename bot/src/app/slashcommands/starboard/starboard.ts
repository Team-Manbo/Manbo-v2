import Manbo, { Constants, CommandInteraction } from 'manbo'
import util from 'util'
import path from 'path'

export = {
    func: async function (interaction: CommandInteraction<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, language) {
        console.log(util.inspect(interaction.data.options, false, null, true))
        require(path.resolve('dist', 'src', 'app', 'modules', 'starboard', `${interaction.data.options![0].name}`))(interaction.guildID, interaction, language)
    },
    name: 'starboard',
    description: 'starboard command',
    options: [
        {
            name: 'limit',
            description: 'set a minimum emoji count for startboard',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            options: [
                {
                    name: 'stars',
                    description: 'minimum emoji count to set',
                    type: Constants.ApplicationCommandOptionTypes.INTEGER,
                    min_value: 1,
                    max_value: 10,
                    required: true,
                },
            ],
        },
        {
            name: 'lock',
            description: 'lock startboard to stop it work',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        },
        {
            name: 'unlock',
            description: 'unlock startboard to make it work',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        },
        {
            name: 'create',
            description: 'create starboard',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            options: [
                {
                    name: 'channel',
                    description: 'channel to set starboard',
                    type: Constants.ApplicationCommandOptionTypes.CHANNEL,
                    required: true
                },
                {
                    name: 'emoji',
                    description: 'set emoji to work with startboard',
                    type: Constants.ApplicationCommandOptionTypes.STRING,
                    required: false
                }
            ]
        },
        {
            name: 'delete',
            description: 'delete starboard',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND
        },
        {
            name: 'stats',
            description: 'stats of this server\'s starboard',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            options: [
                {
                    name: 'user',
                    description: 'user to see starboard stat' ,
                    type: Constants.ApplicationCommandOptionTypes.USER,
                    required: false
                }
            ]
        },
        {
            name: 'random',
            description: 'show random starboard message',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND
        },
        {
            name: 'show',
            description: 'show starboard message',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            options: [
                {
                    name: 'message_id',
                    description: 'message id to show its message',
                    type: Constants.ApplicationCommandOptionTypes.STRING,
                    min_length: 17,
                    max_length: 21,
                    required: true
                }
            ]
        },
        {
            name: 'settings',
            description: 'starboard settings',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND_GROUP,
            options: [
                {
                    name: 'channel',
                    description: 'set a starboard channel',
                    type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
                    options: [
                        {
                            name: 'channel',
                            description: 'a channel to set starboard',
                            type: Constants.ApplicationCommandOptionTypes.CHANNEL,
                            required: true
                        }
                    ]
                },
                {
                    name: 'emoji',
                    description: 'set a starboard emoji',
                    type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
                    options: [
                        {
                            name: 'emoji',
                            description: 'emoji to work with starboard',
                            type: Constants.ApplicationCommandOptionTypes.STRING,
                            required: true
                        }
                    ]
                }
            ]
        },
    ] as Manbo.ApplicationCommandOptions[],
    interactionType: Constants.ApplicationCommandTypes.CHAT_INPUT,
    type: 'starboard'
}
