export = {
    name: 'warn',
    type: 'on',
    handle: async w => {
        if (await global.bot.checkZeroDowntimeUUID('warn')) return
        if (typeof w === 'string') {
            if (w?.includes('Invalid session')) return
        }
        global.logger.warn(`[Manbo.js] ${w}`)
    },
}
