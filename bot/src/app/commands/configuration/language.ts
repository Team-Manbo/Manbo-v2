import Manbo from 'manbo'
import i18next from 'i18next'
import { InteractionCollector } from 'manbo-collector'
import * as Constants from '../../data/Constants'
import PostgresUpdate from '../../../database/interfaces/postgres/update'
import PostgresRead from '../../../database/interfaces/postgres/read'

export = {
  func: async function (message: Manbo.Message<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, suffix: Array<string>, language: string) {
    let buttons: Array<Manbo.InteractionButton> = []
    /* Need to use Array of Components(loop twice) if we has over 5 languages */
    global.bot.languages.forEach(lang => {
      buttons.push({
        type: Manbo.Constants.ComponentTypes.BUTTON,
        custom_id: `language|${message.author.id}|${lang}`,
        label: `${Constants.NATIVE_NAME[lang]}`,
        style: Manbo.Constants.ButtonStyles.SECONDARY,
        emoji: {
          id: null,
          name: Constants.LANGUAGE_FLAG[lang],
        },
      })
    })
    const msg = await message.channel.createMessage({
      embed: {
        description: `${i18next.t(`${this.type}.${this.name}.current_language`, { ns: 'commands', lng: language })}`,
      },
      components: [
        {
          type: Manbo.Constants.ComponentTypes.ACTION_ROW,
          components: buttons,
        },
      ],
    })

    const collector = new InteractionCollector(global.bot, {
      interactionType: Manbo.Constants.InteractionTypes.MESSAGE_COMPONENT,
      componentType: Manbo.Constants.ComponentTypes.BUTTON,
      time: 60_000,
      dispose: true,
    })

    collector.on('collect', async collected => {
      const lang = collected.data.custom_id.split('|')[2]

      await collected.defer(64)

      if (collected.member!.id !== message.author.id)
        await collected.createFollowup({
          content: `${i18next.t(`${this.type}.${this.name}.cannot_interact`, { ns: 'commands', lng: lang })}`,
          flags: 64,
        })
      else {
        await collected.createFollowup({
          content: `${i18next.t(`${this.type}.${this.name}.changed_language`, { ns: 'commands', lng: lang })}`,
          flags: 64,
        })
        msg.edit({
          embed: {
            description: `${i18next.t(`${this.type}.${this.name}.current_language`, { ns: 'commands', lng: lang })}`,
          },
        })
        await PostgresUpdate.updateLanguage(message.guildID, lang)
        const postgresData = await PostgresRead.getSetting(message.guildID)
        await global.redis.set(`setting-${message.guildID}`, JSON.stringify(postgresData), 'EX', 60)
      }
    })

    collector.on('end', () => {
      msg.edit({
        components: [],
      })
    })
  },
  name: 'language',
  description: 'Change the language of the bot',
  type: 'configuration',
  userPerm: ['manageGuild'],
}
