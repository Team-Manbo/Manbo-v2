import Manbo from 'manbo'
import canvas from '@napi-rs/canvas'
import i18next from 'i18next'

export = {
    func: async function (message: Manbo.Message<Manbo.TextChannel | Manbo.ThreadChannel | Manbo.TextVoiceChannel>, suffix: Array<string>, language: string) {
        let date = new Date(message.createdAt)
        let cy = date.getUTCFullYear()
        let notLeap = cy % 4
        const currentYear = new Date().getFullYear()
        const isLeapYear = (year: number) =>
            year % 400 == 0 || (year % 4 == 0 && year % 100 != 0)

        function getProgress(d: Date) {
            let full = 31536000
            let total = 0
            if (!notLeap) {
                full += 86400
                if (d.getUTCMonth() >= 2) total += 86400
            }
            let monthDays = [
                31,
                isLeapYear(currentYear) ? 29 : 28,
                31,
                30,
                31,
                30,
                31,
                31,
                30,
                31,
                30,
                31,
            ]
            total +=
                monthDays.slice(0, d.getUTCMonth()).reduce((a, b) => a + b, 0) * 86400
            total += (d.getUTCDate() - 1) * 86400
            total += d.getUTCHours() * 3600
            total += d.getUTCMinutes() * 60
            total += d.getUTCSeconds()
            return (total * 100) / full
        }

        function round(n: number, k: number) {
            let factor = 10 ** k
            return Math.round(n * factor) / factor
        }

        let cv = canvas.createCanvas(400, 40)
        let ctx = cv.getContext('2d')
        ctx.fillStyle = '#000000'
        ctx.fillRect(0, 0, 400, 40)
        ctx.fillStyle = '#747f8d'
        ctx.fillRect(5, 5, 390, 30)
        ctx.fillStyle = '#43b581'
        ctx.fillRect(5, 5, Math.floor((390 / 100) * getProgress(date)), 30)
        return message.channel.createMessage({
                content: `${i18next.t(`${this.type}.${this.name}.left`, {
                    ns: 'commands',
                    lng: language,
                    cy: `${cy}`,
                    percent: round(getProgress(date), 13).toFixed(8)
                })}`
            },
            { file: cv.toBuffer('image/png'), name: 'yearprogress.png' }
        )
    },
    name: 'yearleft',
    description: 'check year left',
    type: 'fun',
    onlyCmdChannel: true
}
