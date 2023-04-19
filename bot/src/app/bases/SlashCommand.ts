import _ from 'lodash'
import i18next from 'i18next'
import cluster from 'cluster'
import { ExtendedWorker } from '../../../typings'

export default class SlashCommand {
  public name
  public description
  public options
  public interactionType
  public examples
  public func
  public args
  public noDM
  public userPerm
  public botPerm
  public type
  public noThread

  constructor(data) {
    if (data.disabled) return

    if (!data.name)
      global.logger.fatal(
        `[WORKER ${cluster.worker!.id} | ${(cluster.worker as ExtendedWorker).rangeForShard}] A slash command is missing a name! Verify all commands are properly structured and try again.`,
      )
    else if (!data.func) global.logger.fatal(`[WORKER ${cluster.worker!.id} | ${(cluster.worker as ExtendedWorker).rangeForShard}] SlashCommand ${data.name} doesn't have a function to execute!`)

    if (!data.description && process.platform === 'win32') {
      global.logger.fatal(`[WORKER ${cluster.worker!.id} | ${(cluster.worker as ExtendedWorker).rangeForShard}] SlashCommand ${data.name} is missing a description.`)
      data.quickHelp = 'None provided'
    }

    if (!data.interactionType && process.platform === 'win32') {
      global.logger.fatal(`[WORKER ${cluster.worker!.id} | ${(cluster.worker as ExtendedWorker).rangeForShard}] SlashCommand ${data.name} is missing a interaction type`)
      data.quickHelp = 'None provided'
    }

    if (!data.type && process.platform === 'win32')
      global.logger.warn(`[WORKER ${cluster.worker!.id} | ${(cluster.worker as ExtendedWorker).rangeForShard}] SlashCommand ${data.name} is missing a type.`)

    if (!data.examples && process.platform === 'win32') {
      global.logger.warn(`[WORKER ${cluster.worker!.id} | ${(cluster.worker as ExtendedWorker).rangeForShard}] SlashCommand ${data.name} is missing examples.`)
      data.examples = 'None provided'
    }

    this.name = data.name
    this.description = data.description
    this.options = data.options
    this.interactionType = data.interactionType
    this.examples = data.examples
    this.func = data.func
    this.args = data.args || []
    this.noDM = data.noDM || true
    this.userPerm = data.userPerm
    this.botPerm = data.botPerm
    this.type = data.type || 'any'
    this.noThread = !!data.noThread

    global.bot.slashCommands[data.name] = this

    let slashCommandObject = {
      name: this.name,
      description: this.description,
      interactionType: this.interactionType,
      options: this.options,
    }
    for (let lang of global.bot.languages) {
        global.bot.slashCommandAliases.set(i18next.t(`${this.type}.${this.name}.name`, { lng: lang, ns: 'localizations' }), this.name)
      slashCommandObject = _.merge(slashCommandObject, i18next.t(`${this.type}.${this.name}`, { lng: lang, ns: 'localizations' }))
    }
    global.bot.slashCommandsJSON.push(slashCommandObject)
  }

  run(msg) {
    return this.func(msg)
  }
}
