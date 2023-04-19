import cluster from 'cluster'
import { Client, ClientOptions } from 'manbo'
import fs from 'fs'
import Redis from 'ioredis'
import i18next from 'i18next'
import Backend from 'i18next-fs-backend'
import childProcess from 'child_process'
import * as Constants from '../data/Constants'
import config from '../../config'
import { AudioManager } from './AudioManager'
import { SweeperManager } from './SweeperManager'
import { Queue } from '../modules/Queue'

import { ExtendedWorker } from '../../../typings'

export default class BaseClient extends Client {
  /**
   * bot info
   */
  public VERSION: string = require(process.cwd() + '/package.json').version
  public NAME: string = require(process.cwd() + '/package.json').name

  public gitInfo() {
    return new Promise((res, rej) =>
      childProcess.exec('git log -n 3 --no-color --pretty=format:\'[ "%h", "%s", "%cr", "%an" ],\'', (err, stdout) => {
        if (err) {
          return rej(err)
        }

        let str = stdout.split('\n').join('')
        str = str.substr(0, str.length - 1)

        let lines = JSON.parse(`[${str}]`)
        lines = lines.map(l => `[${l[0]}] ${l[1]} - ${l[2]}`)
        console.log(`${lines.join('\n')}\n`)
        // @ts-ignore
        return res()
      }),
    )
  }
  /**
   * Zero-Downtime project
   */
  public zeroDowntimeUUID!: string
  public typeOnEvent!: Array<string>
  public typeOnceEvent!: Array<string>
  public checkUUID: boolean = true

  public checkZeroDowntimeUUID

  /**
   * commands, slash-commands, guild settings
   */
  public commands = {}
  public aliases = {}
  public slashCommands = {}
  public slashCommandsJSON: any[] = []
  public slashCommandAliases: Map<string, string> = new Map<string, string>()
  public ignoredChannels = []
  public guildSettingsCache = {}

  /**
   * database
   */
  public redis!: Redis

  /**
   * localized ms
   */
  public ms = {}

  /**
   * constants 
   */
  public Constants = Constants

  /**
   * languages, bot stats
   */
  public languages: string[] = ['en-US', 'ko']
  public guildCount: number = 0
  public userCount: number = 0
  public memberCount: number = 0
  public workerInfo: Array<string> = []

  /**
   * managers
   */
  public manager: AudioManager
  public sweeper: SweeperManager

  /**
   * audio
   */
  public queue: Queue

  constructor(token: string, options: ClientOptions) {
    super(token, options)

    this.manager = new AudioManager(this)
    this.queue = new Queue(this)
    this.sweeper = new SweeperManager(this, {
      sweep: [/* "manager", "emojis", "stickers", 'guildMembers' */],
      timeout: 1000 * 60 * 60 * 6,
    })
  }

  public stringToComma(x): string {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  async addMsLocales() {
    const msVars = ['second', 'minute', 'hour', 'day', 'year']
    global.bot.languages.forEach(lang => {
      if (lang !== 'en-US')
        msVars.forEach(msVar => {
          const res = i18next.t(`ms.${msVar}`, { ns: 'translations', lng: lang })
          if (typeof res === 'object') {
            ;(Object.values(res) as Array<string>).forEach(r => {
              global.bot.ms[r] = msVar
            })
          }
        })
    })
  }

  public async loadLocales(path: string): Promise<void> {
    try {
      await i18next.use(Backend).init({
        initImmediate: false,
        ns: ['translations', 'commands', 'events', 'slashcommands', 'localizations'],
        defaultNS: 'translations',
        preload: fs.readdirSync(path),
        fallbackLng: config.defaultLanguage,
        supportedLngs: this.languages,
        backend: {
          loadPath: `${path}/{{lng}}/{{ns}}.json`,
        },
        interpolation: {
          escapeValue: false,
          useRawValueToEscape: true,
          skipOnVariables: false,
        },
        returnEmptyString: false,
        returnObjects: true,
      })
      return global.logger.info(`[WORKER ${cluster.worker!.id} | ${(cluster.worker as ExtendedWorker).rangeForShard}] Loaded ${this.languages.length} languages - ${this.languages.join(', ')}`)
    } catch (error) {
      return global.logger.error(`[WORKER ${cluster.worker!.id} | ${(cluster.worker as ExtendedWorker).rangeForShard}] Error while loading languages`, error)
    }
  }
}
