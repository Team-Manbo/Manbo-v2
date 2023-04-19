export = {
    name: 'error',
    type: 'on',
    handle: async e => {
        if (await global.bot.checkZeroDowntimeUUID('error')) return
        // Discord sessions reconnect
        if (e?.message.includes('Connection reset by peer')) return
        console.error('[Manbo.js] ERROR: ', e)
    },
}
