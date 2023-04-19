import * as dotenv from 'dotenv'
dotenv.config()

import Manbo from 'manbo'
import cluster from 'cluster'
import path from 'path'
import * as Sentry from '@sentry/node'
import BaseClient from './structures/BaseClient'
import indexCommands from './utils/commandIndexer'
import addBotListeners from './utils/addBotListener'
import cacheGuildInfo from './utils/cacheGuildSettings'
import redisClient from '../database/clients/redis'
import pool from '../database/clients/postgres'
import { send } from '../miscellaneous/WebsocketClient'

import { ExtendedWorker } from '../../typings'

if (process.env.SENTRY_URI) {
    Sentry.init({
        dsn: process.env.SENTRY_URI,
        maxBreadcrumbs: 1,
    })
} else {
    global.logger.warn('No sentry URI provided. Error logging will be restricted to messages only.')
}

function connect() {
    global.bot.connect().then(async () => {
        //global.bot.on('debug', (message, id) => {
        //    global.logger.info(`[Debug | Shard #${id}] ${message}`)
        //})
    })
}

async function init() {
    global.redis = redisClient
    global.bot = new BaseClient(global.BOT_TOKEN as string, {
        gateway: {
            firstShardID: (cluster.worker as ExtendedWorker).shardStart,
            lastShardID: (cluster.worker as ExtendedWorker).shardEnd,
            maxShards: (cluster.worker as ExtendedWorker).totalShards,
            disableEvents: {
                TYPING_START: true,
            },
        },
        rest: {
            baseURL: '/api/v10',
            ...(process.env.USE_TWILIGHT === 'true'
                ? {
                      https: false,
                      domain: process.env.TWILIGHT_HOST,
                      requestTimeout: 1000 * 60 * 30,
                      port: Number(process.env.TWILIGHT_PORT) || 6972,
                  }
                : {}),
        },
        allowedMentions: {
            everyone: false,
            roles: false,
            users: true,
        },
        restMode: true,
        messageLimit: 100,
        intents: [
            'guilds',
            'guildMembers',
            'guildBans',
            'guildEmojisAndStickers',
            'guildIntegrations',
            'guildWebhooks',
            'guildInvites',
            'guildVoiceStates',
            'guildPresences',
            'guildMessages',
            'guildMessageReactions',
            // "guildMessageTyping",
            'directMessages',
            // "directMessageReactions",
            // "directMessageTyping",
            'messageContent',
            'guildScheduledEvents',
            'autoModerationConfiguration',
            'autoModerationExecution',
        ],
        defaultImageFormat: 'png',
    })

    // Zero-Downtime project
    global.bot.checkZeroDowntimeUUID = async (eventName: string): Promise<boolean> => {
        if (!global.bot.checkUUID) return false
        const checkRedisEventData = (await global.redis.get(`event-${eventName}`)) || 'uuid'
        return checkRedisEventData !== (process.env.uuid as string)
    }

    // typescript build cannot build .json files, need a way to solve this
    await global.bot.loadLocales(path.resolve('dist', 'src', 'locales'))

    global.bot.commands = {}
    global.bot.aliases = {}
    global.bot.slashCommands = {}
    global.bot.slashCommandsJSON = []
    global.bot.ignoredChannels = []
    global.bot.guildSettingsCache = {}

    await global.bot.addMsLocales()

    indexCommands('commands')
    indexCommands('slashcommands')
    await cacheGuildInfo()

    await addBotListeners()

    if (process.env.WEBSOCKET_URI && process.env.WEBSOCKET_SECRET) {
        require('../miscellaneous/WebsocketClient')
    }

    send({
        op: '1',
        c: {
            restart: true,
            uuid: 'all',
        },
    })

    connect()
}

process.on('exit', code => {
    global.logger.error(`[WORKER ${cluster.worker!.id} | ${(cluster.worker as ExtendedWorker).rangeForShard}] The process is exiting with code ${code}.`)
    /* pool.end(() => {
        global.logger.info(`PostgreSQL end.`)
    }) */
})

process.on('SIGINT', async () => {
    global.logger.error(`[WORKER ${cluster.worker!.id} | ${(cluster.worker as ExtendedWorker).rangeForShard}] SIGINT caught. Cleaning up and exiting...`)
    /* pool.end(() => {
        global.logger.info(`PostgreSQL end.`)
    }) */
    process.exit()
})

process.on('unhandledRejection', (e: Error) => {
    if (
        !e.message.includes('[50013]') &&
        !e.message.includes('Request timed out') &&
        !e.message.startsWith('500 INTERNAL SERVER ERROR') &&
        !e.message.includes('503 Service Temporarily Unavailable') &&
        !e.message.includes('global ratelimit') &&
        !e.message.includes('hang up')
    ) {
        global.logger.error_nosentry(e)
        // sentry catches these already, stop double reporting
        // Sentry.captureException(e.stack, { level: 'error' }) // handle when Discord freaks out
    }
})

process.on('uncaughtException', e => {
    if (
        !e.message.includes('[50013]') &&
        !e.message.includes('Request timed out') &&
        !e.message.startsWith('500 INTERNAL SERVER ERROR') &&
        !e.message.includes('503 Service Temporarily Unavailable') &&
        !e.message.includes('global ratelimit') &&
        !e.message.includes('hang up')
    ) {
        global.logger.error_nosentry(e)
        Sentry.captureException(e.stack, { level: 'fatal' })
    }
})

init()
