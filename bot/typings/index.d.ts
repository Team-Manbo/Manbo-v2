import { Worker } from 'cluster'
import { Redis } from 'ioredis'
import Manbo from 'manbo'
import Shoukaku from 'shoukaku'
import { Queue } from '../src/app/modules/Queue'
import BaseClient from '../src/app/structures/BaseClient'
import AesChiper from '../src/miscellaneous/AesChiper'
import Logger from '../src/miscellaneous/Logger'
import WebhookLogger from '../src/miscellaneous/WebhookLogger'

declare global {
    var bot: BaseClient
    var queue: Queue
    var redis: Redis
    var aes: AesChiper
    var logger: Logger
    var webhook: WebhookLogger
}

interface Lavalink {
    name: string
    url: string
    auth: string
    secure?: boolean
    group?: string
}

export interface ExtendedTrack extends Shoukaku.Track {
    requester: Manbo.User
}

export interface Config {
    defaultPrefix: string
    defaultLanguage: string
    developers: Array<string>
    owners: Array<string>
    lavalink: Array<Lavalink>
    support: string
}

export interface WorkerInfo {
    type: string //'bot' | 'startup'
    processType?: 'bot'
    shardStart: number
    shardEnd: number
    rangeForShard: string
    totalShards: number
}

export interface ExtendedWorker extends Worker {
    type: string //'bot' | 'startup'
    processType?: 'bot'
    shardStart: number
    shardEnd: number
    rangeForShard: string
    totalShards: number
    zeroDowntimeUUID: string
}

export interface EventEmitter {
    name: string
    handle
    requiredPerms?: Array<string>
}

export interface PostgresMessages {
    id: string
    author_id: string
    content: string | ArrayBuffer
    attachment_b64: string | ArrayBuffer
    ts: number
}

export interface PostgresGuilds {
    id: string
    owner_id: string
    ignored_channels: Array<string>
    disabled_events: Array<string>
    event_logs: object
    log_bots: boolean
    custom_settings: object
}

export interface PostgresSettings {
    id: string
    language: string
    prefix: string
    // cmd_channel_ids: Array<string>
}

export interface PostgresEconomy {
    user_id: string
    guild_id: Array<string>
    coin: string
    percentage: number
    daily: string
    topgg: string
}

export interface PostgresStarboard {
    guild_id: string
    channel_id: string
    minimum: number
    emoji_name: string
    emoji_id: string
    locked: boolean
    ids: Array<StarboardIds>
}

interface StarboardIds {
    starboard_message_id: string
    actual_channel_id: string
    actual_message_id: string
    stars: number
}