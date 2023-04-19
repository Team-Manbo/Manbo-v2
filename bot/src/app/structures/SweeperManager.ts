import { Constants, Guild } from 'manbo'
import BaseClient from './BaseClient'

interface sweeperOptions {
  sweep: Array<'guildMembers' | 'stickers' | 'emojis' | 'guildCategories'>
  timeout: number
}

export class SweeperManager {
  private client: BaseClient
  public options: sweeperOptions

  constructor(client: BaseClient, options: sweeperOptions) {
    this.client = client
    this.options = options
    this._setup()
  }

  private _setup() {
    if (this.options.timeout === 0) return
    setInterval(() => {
      this.sweep()
      /*
            this.client.shards.forEach(shard => {
                shard.editStatus('online', { name: this.options.changeStatus, type: 3 })
            })
            */
    }, this.options.timeout)
  }

  private sweep() {
    if (this.options.sweep.includes('guildMembers')) this.sweepMembers()
    if (this.options.sweep.includes('emojis')) this.sweepMembers()
    if (this.options.sweep.includes('stickers')) this.sweepStickers()
    if (this.options.sweep.includes('guildCategories')) this.sweepGuildCategories()
  }

  private _baseSweep(func: Function) {
    this.client.guilds.forEach(guild => {
      func(guild)
    })
  }

  public sweepMembers() {
    return this._baseSweep((g: Guild) => {
      g.members.forEach(m => {
        if (!m.voiceState.channelID && m.id !== this.client.user.id) g.members.delete(m.id)
      })
    })
  }

  public sweepStickers() {
    return this._baseSweep((g: Guild) => {
      if (g?.stickers && g.stickers.length > 0) g.stickers.length = 0
    })
  }

  public sweepEmojis() {
    return this._baseSweep((g: Guild) => {
      g.emojis.length = 0
    })
  }

  public sweepGuildCategories() {
    return this._baseSweep((g: Guild) => {
      g.channels.forEach(c => {
        if (c.type === Constants.ChannelTypes.GUILD_CATEGORY) return g.channels.delete(c.id)
      })
    })
  }
}
