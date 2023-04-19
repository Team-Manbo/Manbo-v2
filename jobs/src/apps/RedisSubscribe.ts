import Redis from 'ioredis'
import remindme from './redis/remindme'

const pub = new Redis({
    host: global.REDIS_HOST,
    port: Number(process.env.REDIS_PORT as string) || 6379
})

const sub = pub.duplicate()

const configKey = 'Ex'
const subKey = '__keyevent@0__:expired'

pub.config('SET', 'notify-keyspace-events', configKey)

sub.subscribe(subKey, function() {
    global.webhook.custom({
        title: `Redis Sub Event`,
        description: `Subscribed: \`${subKey}\`, notify-keyspace-event: \`${configKey}\``
    })
})

sub.on('message', function (channel, message) {
    const [cmd, ...args] = message.split('-')
    switch (cmd) {
        case 'remindme': // remindme-userID-guildID-messageID
            remindme(args[0], args[1], args[2], pub)
            break
    }
})