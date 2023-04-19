import cacheGuild from '../utils/cacheGuild'

export default class GuildSettings {
  public id
  public ignoredChannels
  public logBots
  public event_logs
  public allLog
  public ownerID
  public disabledEvents
  public feeds
  public joinlog
  public mod
  public messageLog
  public serverLog
  public voice
  public premium
  public ignoredUsers
  public customSettings

  constructor(data) {
    if (data.disabled) return
    if (!data.ownerID && !data.owner_id) {
      global.logger.info(JSON.stringify(data))
      global.logger.fatal('A guild settings doc is missing an ownerID!', data)
    }
    this.id = data.id
    this.ignoredChannels = data.ignoredChannels || data.ignored_channels
    this.logBots = data.logBots || data.log_bots
    this.event_logs = data.event_logs
    this.allLog = data.logchannel
    this.ownerID = data.ownerID || data.owner_id
    this.disabledEvents = data.disabledEvents || data.disabled_events
    this.feeds = data.feeds ? data.feeds : ''
    this.joinlog = this.feeds ? this.feeds.joinlog.channelID : ''
    this.mod = data.feeds ? data.feeds.mod.channelID : ''
    this.messageLog = data.feeds ? data.feeds.messages.channelID : ''
    this.serverLog = data.feeds ? data.feeds.server.channelID : ''
    this.voice = data.feeds ? data.feeds.voice.channelID : ''
    this.premium = data.premium ? data.premium : false
    this.ignoredUsers = data.ignoredUsers
    this.customSettings = data.custom_settings

    global.bot.guildSettingsCache[data.id] = this // someday, this will be replaced because it's dumb
  }

  getEventLogID(eventName: string) {
    return this.event_logs[eventName]
  }

  isChannelIgnored(channelID: string): boolean {
    return this.ignoredChannels.includes(channelID)
  }

  isPremium(): boolean {
    return this.premium
  }

  isLogBots(): boolean {
    return this.logBots
  }

  isUserIgnored(userID: string): boolean {
    return this.ignoredUsers.includes(userID)
  }

  getID(): string {
    return this.id
  }

  getOwnerID(): string {
    return this.ownerID
  }

  getEventLogRaw() {
    return this.event_logs
  }

  getEventByName(name: string) {
    return this.event_logs[name]
  }

  eventLogByNames(channelID: string) {
    return Object.keys(this.event_logs).filter(event => this.event_logs[event] === channelID)
  }

  clearEventByID(id: string): void {
    const events = this.eventLogByNames(id)
    events.forEach(name => {
      this.event_logs[name] = ''
    })
  }

  clearEventByName(name: string): void {
    this.event_logs[name] = ''
  }

  clearEventLog(): void {
    Object.keys(this.event_logs).forEach(event => {
      this.event_logs[event] = ''
    })
  }

  eventIsDisabled(event): boolean {
    return this.disabledEvents.includes(event)
  }

  recache() {
    cacheGuild(this.id)
  }
}
