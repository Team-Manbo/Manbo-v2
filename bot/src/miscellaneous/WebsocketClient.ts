import WS from 'ws'
import cluster from 'cluster'
import i18next from 'i18next'

import cacheGuild from '../app/utils/cacheGuild'

const secret = process.env.WEBSOCKET_SECRET
const uri = process.env.WEBSOCKET_URI

import { ExtendedWorker } from '../../typings'
import addBotListeners from '../app/utils/addBotListener'
import commandIndexer from '../app/utils/commandIndexer'

let socket

function start() {
    global.logger.info(`[WORKER ${cluster.worker!.id} | ${(cluster.worker as ExtendedWorker).rangeForShard}] WS connection started with ${uri}`)
    socket = new WS(uri)
    socket.on('error', e => {
        global.logger.error(`[WORKER ${cluster.worker!.id} | ${(cluster.worker as ExtendedWorker).rangeForShard}] WS socket error, ${e.message}`)
    })
    socket.on('close', () => {
        global.logger.warn(`[WORKER ${cluster.worker!.id} | ${(cluster.worker as ExtendedWorker).rangeForShard}] WS socket got destroyed, reconnecting...`)
        setTimeout(start, 500)
    })
    socket.on('message', async m => {
        let msg
        try {
            msg = JSON.parse(m)
        } catch (e) {
            // @ts-ignore
            return global.logger.error(`[WORKER ${cluster.worker!.id} | ${(cluster.worker as ExtendedWorker).rangeForShard}] Failed to decrypt WS payload, ` + e.message)
        }
        switch (msg.op) {
            case '2': {
                if (msg.c.uuid === process.env.uuid || msg.c.uuid === 'all') global.bot.checkUUID = msg.c.restart
                break
            }
            case '1001': {
                // IDENTIFY
                return send({
                    op: '1003', // IDENTIFY_SUPPLY
                    c: {
                        secret: secret,
                        shard: (cluster.worker as ExtendedWorker).rangeForShard,
                    },
                })
            }
            case '1002': {
                // IDENTIFY_REPLY
                if (msg.c.success === true) {
                    global.logger.info(`[WORKER ${cluster.worker!.id} | ${(cluster.worker as ExtendedWorker).rangeForShard}] WS connection fully open.`)
                    global.logger.info(`[WORKER ${cluster.worker!.id} | ${(cluster.worker as ExtendedWorker).rangeForShard}] Successfully connected to WS.`)
                } else {
                    global.logger.warn(`[WORKER ${cluster.worker!.id} | ${(cluster.worker as ExtendedWorker).rangeForShard}] WS rejected authentication! Not reconnecting.`)
                }
                break
            }
            case '2001': {
                // REQUEST
                try {
                    if (msg.c.startsWith('recache')) {
                        msg.c = msg.c.replace('recache ', '')
                        await cacheGuild(msg.c)
                    } else {
                        const resp = eval(msg.c)
                        send({
                            op: '2002', // REQUEST_REPLY
                            c: resp,
                            uuid: msg.uuid,
                        })
                    }
                } catch (e) {
                    send({
                        op: '5000', // CANNOT_COMPLY
                        // @ts-ignore
                        c: e.message,
                        uuid: msg.uuid ? msg.uuid : 6334,
                    })
                }
                break
            }
            case '3001': {
                send({
                    op: '3002',
                    c: {
                        workerId: cluster.worker!.id,
                        shardId: (cluster.worker as ExtendedWorker).rangeForShard,
                        guilds: global.bot.guilds.size,
                        members: global.bot.guilds.reduce((a, b) => a + b.memberCount, 0),
                        users: global.bot.users.size,
                    },
                })
                break
            }
            case '3003': {
                global.bot.guildCount += msg.c.guilds
                global.bot.userCount += msg.c.users
                global.bot.memberCount += msg.c.members
                global.bot.workerInfo.push(`[Worker ${msg.c.workerId} | ${msg.c.shardId}] Guilds: \`${msg.c.guilds}\` Users: \`${msg.c.users}\``)
                break
            }
            case '10011': {
                // command - reload
                global.bot.VERSION = require(process.cwd() + '/package.json').version
                global.bot.NAME = require(process.cwd() + '/pacakge.json').name

                if (msg.c.type === 'events') {
                    const fetchedMessage = await global.bot.getMessage(msg.c.channelID, msg.c.messageID)
                    await global.bot.editMessage(
                        fetchedMessage.channel.id,
                        fetchedMessage.id,
                        `${fetchedMessage.content}\n> \`Worker ${cluster.worker!.id}\` (\`${(cluster.worker as ExtendedWorker).rangeForShard}\`) 🔄 (reloading)`,
                    )
                    try {
                        global.bot.removeAllListeners()
                        await addBotListeners()
                        await global.bot.editMessage(
                            fetchedMessage.channel.id,
                            fetchedMessage.id,
                            `${fetchedMessage.content}\n> \`Worker ${cluster.worker!.id}\` (\`${(cluster.worker as ExtendedWorker).rangeForShard}\`) ✅ (succeed)`,
                        )
                    } catch (e) {
                        global.logger.fatal(
                            `[WORKER ${cluster.worker!.id} | ${
                                (cluster.worker as ExtendedWorker).rangeForShard
                            }] There was an issue reloading events. The error has been logged, and this cluster is restarting for safety.`,
                        )
                        console.error(e)
                        await global.bot.editMessage(
                            fetchedMessage.channel.id,
                            fetchedMessage.id,
                            `${fetchedMessage.content}\n> \`Worker ${cluster.worker!.id}\` (\`${(cluster.worker as ExtendedWorker).rangeForShard}\`) ❌ (failed)`,
                        )
                    }
                } else if (msg.c.type === 'locales') {
                    const fetchedMessage = await global.bot.getMessage(msg.c.channelID, msg.c.messageID)
                    await global.bot.editMessage(
                        fetchedMessage.channel.id,
                        fetchedMessage.id,
                        `${fetchedMessage.content}\n> \`Worker ${cluster.worker!.id}\` (\`${(cluster.worker as ExtendedWorker).rangeForShard}\`) 🔄 (reloading)`,
                    )
                    try {
                        await i18next.reloadResources()
                        await global.bot.editMessage(
                            fetchedMessage.channel.id,
                            fetchedMessage.id,
                            `${fetchedMessage.content}\n> \`Worker ${cluster.worker!.id}\` (\`${(cluster.worker as ExtendedWorker).rangeForShard}\`) ✅ (succeed)`,
                        )
                    } catch (e) {
                        global.logger.fatal(
                            `[WORKER ${cluster.worker!.id} | ${
                                (cluster.worker as ExtendedWorker).rangeForShard
                            }] There was an issue reloading locales. The error has been logged, and this cluster is restarting for safety.`,
                        )
                        console.error(e)
                        await global.bot.editMessage(
                            fetchedMessage.channel.id,
                            fetchedMessage.id,
                            `${fetchedMessage.content}\n> \`Worker ${cluster.worker!.id}\` (\`${(cluster.worker as ExtendedWorker).rangeForShard}\`) ❌ (failed)`,
                        )
                    }
                } else if (msg.c.type === 'commands') {
                    const fetchedMessage = await global.bot.getMessage(msg.c.channelID, msg.c.messageID)
                    await global.bot.editMessage(
                        fetchedMessage.channel.id,
                        fetchedMessage.id,
                        `${fetchedMessage.content}\n> \`Worker ${cluster.worker!.id}\` (\`${(cluster.worker as ExtendedWorker).rangeForShard}\`) 🔄 (reloading)`,
                    )
                    try {
                        global.bot.commands = {}
                        commandIndexer('commands')
                        await global.bot.editMessage(
                            fetchedMessage.channel.id,
                            fetchedMessage.id,
                            `${fetchedMessage.content}\n> \`Worker ${cluster.worker!.id}\` (\`${(cluster.worker as ExtendedWorker).rangeForShard}\`) ✅ (succeed)`,
                        )
                    } catch (e) {
                        global.logger.fatal(
                            `[WORKER ${cluster.worker!.id} | ${
                                (cluster.worker as ExtendedWorker).rangeForShard
                            }] There was an issue reloading commands. The error has been logged, and this cluster is restarting for safety.`,
                        )
                        console.error(e)
                        await global.bot.editMessage(
                            fetchedMessage.channel.id,
                            fetchedMessage.id,
                            `${fetchedMessage.content}\n> \`Worker ${cluster.worker!.id}\` (\`${(cluster.worker as ExtendedWorker).rangeForShard}\`) ❌ (failed)`,
                        )
                    }
                } else if (msg.c.type === 'slash') {
                    const fetchedMessage = await global.bot.getMessage(msg.c.channelID, msg.c.messageID)
                    await global.bot.editMessage(
                        fetchedMessage.channel.id,
                        fetchedMessage.id,
                        `${fetchedMessage.content}\n> \`Worker ${cluster.worker!.id}\` (\`${(cluster.worker as ExtendedWorker).rangeForShard}\`) 🔄 (reloading)`,
                    )
                    try {
                        global.bot.slashCommands = {}
                        global.bot.slashCommandsJSON = []
                        commandIndexer('slashcommands')
                        await global.bot.editMessage(
                            fetchedMessage.channel.id,
                            fetchedMessage.id,
                            `${fetchedMessage.content}\n> \`Worker ${cluster.worker!.id}\` (\`${(cluster.worker as ExtendedWorker).rangeForShard}\`) ✅ (succeed)`,
                        )
                    } catch (e) {
                        global.logger.fatal(
                            `[WORKER ${cluster.worker!.id} | ${
                                (cluster.worker as ExtendedWorker).rangeForShard
                            }] There was an issue reloading slash commands. The error has been logged, and this cluster is restarting for safety.`,
                        )
                        console.error(e)
                        await global.bot.editMessage(
                            fetchedMessage.channel.id,
                            fetchedMessage.id,
                            `${fetchedMessage.content}\n> \`Worker ${cluster.worker!.id}\` (\`${(cluster.worker as ExtendedWorker).rangeForShard}\`) ❌ (failed)`,
                        )
                    }
                }
                break
            }
        }
    })
}

export function send(payload) {
    if (typeof payload === 'object') payload = JSON.stringify(payload)
    socket.send(payload)
}

if (uri && secret) start()

export default socket
