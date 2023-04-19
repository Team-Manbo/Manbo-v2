import { Member } from 'manbo'
import ms from 'ms'

class System {
  static processUptime(): number {
    return Date.now() - process.uptime() * 1000
  }
}

class TimestampFormatter {
  static time(timestamp: number, type?: string): string {
    return `<t:${Math.floor(timestamp / 1000)}` + (type ? `:${type}` : '') + '>'
  }

  static relativeTime(timestamp: number): string {
    return this.time(timestamp, 'R')
  }
}

class Snowflake {
  static getCreatedAt(id) {
    return Snowflake.getDiscordEpoch(id) + 1420070400000
  }

  static getDiscordEpoch(id) {
    return Math.floor(id / 4194304)
  }
}

class GuildMember {
  static getDisplayHexColor(member: Member): number {
    const roles = member.roles.map(role => member.guild.roles.get(role)).sort((a, b) => b!.position - a!.position)
    return roles[0]!.color
  }
}

function sleep(ms) {
  return new Promise(resolveFunc => setTimeout(resolveFunc, ms))
}

function msLocalization(str: string) {
  for (let x of Object.entries(global.bot.ms) as any) {
    str = str.toLowerCase().replaceAll(x[0], x[1])
  }
  return ms(str)
}

export { System, TimestampFormatter, sleep, msLocalization, Snowflake, GuildMember }
