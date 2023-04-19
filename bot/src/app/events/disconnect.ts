import cluster from 'cluster'

import { ExtendedWorker } from '../../../typings'

let reconnects: number = 0

export = {
    name: 'disconnect',
    type: 'on',
    handle: async () => {
        if (await global.bot.checkZeroDowntimeUUID('disconnect')) return
        // statAggregator.incrementMisc('disconnect')
        reconnects++
        global.logger.error(
            `Worker instance hosting \`${(cluster.worker as ExtendedWorker).rangeForShard}\` on id ${(cluster.worker as ExtendedWorker).id} disconnected from the gateway. ${reconnects} out of 10.`,
        )
        if (reconnects >= 10) {
            global.bot.disconnect({ reconnect: true })
        }
    },
}

setInterval(() => {
    reconnects = 0
}, 120_000)
