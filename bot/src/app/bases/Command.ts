import cluster from 'cluster'
import { ExtendedWorker } from '../../../typings'
import i18next from 'i18next'

export default class Command {
  public name
  public description
  public examples
  public func
  public args
  public noDM
  public userPerm
  public botPerm
  public type
  public hidden
  public noThread
  public onlyCmdChannel

  constructor(data) {
    if (data.disabled) return

    if (!data.name)
      global.logger.fatal(
        `[WORKER ${cluster.worker!.id} | ${(cluster.worker as ExtendedWorker).rangeForShard}] A command is missing a name! Verify all commands are properly structured and try again.`,
      )
    else if (!data.func) global.logger.fatal(`[WORKER ${cluster.worker!.id} | ${(cluster.worker as ExtendedWorker).rangeForShard}] Command ${data.name} doesn't have a function to execute!`)

    if (!data.type) global.logger.warn(`[WORKER ${cluster.worker!.id} | ${(cluster.worker as ExtendedWorker).rangeForShard}] Command ${data.name} is missing a type.`)

    if (!data.description && !data.hidden && process.platform === 'win32') {
      global.logger.warn(`[WORKER ${cluster.worker!.id} | ${(cluster.worker as ExtendedWorker).rangeForShard}] Command ${data.name} is missing a description.`)
      data.quickHelp = 'None provided'
    }

    if (!data.examples && !data.hidden && process.platform === 'win32') {
      global.logger.warn(`[WORKER ${cluster.worker!.id} | ${(cluster.worker as ExtendedWorker).rangeForShard}] Command ${data.name} is missing examples.`)
      data.examples = 'None provided'
    }

    if (!data.args && !data.hidden && process.platform === 'win32')
      global.logger.warn(`[WORKER ${cluster.worker!.id} | ${(cluster.worker as ExtendedWorker).rangeForShard}] Command ${data.name} is missing arguments.`)

    this.name = data.name
    this.description = data.description
    this.examples = data.examples
    this.func = data.func
    this.args = data.args || ''
    this.noDM = data.noDM || true
    this.userPerm = data.userPerm
    this.botPerm = data.botPerm
    this.type = data.type || 'any'
    this.hidden = !!data.hidden
    this.noThread = !!data.noThread
    this.onlyCmdChannel = !!data.onlyCmdChannel

    global.bot.commands[data.name] = this
    global.bot.languages.forEach(lang => {
      const i18ns = i18next.t(`${data.type}.${data.name}.info.aliases`, { ns: 'commands', lng: lang })
      if (typeof i18ns === 'object')
        (Object.values(i18ns) as Array<string>).forEach(alias => {
          global.bot.aliases[alias] = data.name
        })
    })
  }

  run(msg) {
    return this.func(msg)
  }
}
