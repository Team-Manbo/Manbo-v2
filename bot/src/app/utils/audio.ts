import Manbo from 'manbo'
import i18next from 'i18next'
import AudioDispatcher from '../modules/AudioDispatcher'

function checkBasic(member: Manbo.Member, lang: string) {
    if (!member.voiceState.channelID) return `${i18next.t(`music.no_vc`, { ns: 'translations', lng: lang })}`
    if (member.voiceState.channelID !== member.guild.voiceStates.get(global.bot.user.id)?.channelID) return `${i18next.t(`music.not_same_vc`, { ns: 'translations', lng: lang })}`
    else return true
}

function getDispatcher(guildID: string, lang: string): AudioDispatcher | string {
    const res = global.bot.queue.get(guildID)
    if (!res) return `${i18next.t(`music.no_dispatcher`, { ns: 'translations', lng: lang })}`
    else return res
}

function convertTime(ms: number): string {
    const seconds = Number(((ms / 1000) % 60).toFixed(0)),
        minutes = Number(((ms / (1000 * 60)) % 60).toFixed(0)),
        hours = Number(((ms / (1000 * 60 * 60)) % 24).toFixed(0))

    const hours_str = hours < 10 ? '0' + `${hours}` : `${hours}`,
        minutes_str = minutes < 10 ? '0' + `${minutes}` : `${minutes}`,
        seconds_str = seconds < 10 ? '0' + `${seconds}` : `${seconds}`

    return ms < 3_600_000 ? `${minutes_str}:${seconds_str}` : `${hours_str}:${minutes_str}:${seconds_str}`
}

export { checkBasic, getDispatcher, convertTime }
