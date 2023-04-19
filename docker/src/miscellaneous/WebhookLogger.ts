import sa from 'superagent'

let globalHookErrors: number = 0

setInterval(() => {
  globalHookErrors--
}, 5_000)

function fatal(message: string) {
  if (globalHookErrors < 5) {
    sa.post(process.env.DOCKER_WEBHOOK_URL as string)
      .send({
        avatar_url: 'https://cdn.discordapp.com/avatars/846770591231246336/cf600c0028d21776aae00d58ae8f7631.png',
        username: `Docker - Fatal`,
        embeds: [
          {
            title: 'Fatal Error',
            description: message,
            color: 16777215,
          },
        ],
      })
      .end(err => {
        if (err) globalHookErrors += 1
      })
  }
}

function error(message: string) {
  if (globalHookErrors < 5) {
    sa.post(process.env.DOCKER_WEBHOOK_URL as string)
      .send({
        avatar_url: 'https://cdn.discordapp.com/avatars/846770591231246336/cf600c0028d21776aae00d58ae8f7631.png',
        username: `Docker - Error`,
        embeds: [
          {
            title: 'Error',
            description: message,
            color: 16711680,
          },
        ],
      })
      .end(err => {
        if (err) globalHookErrors = globalHookErrors + 1
      })
  }
}

function warn(message: string) {
  if (globalHookErrors < 5) {
    sa.post(process.env.DOCKER_WEBHOOK_URL as string)
      .send({
        avatar_url: 'https://cdn.discordapp.com/avatars/846770591231246336/cf600c0028d21776aae00d58ae8f7631.png',
        username: `Docker - Warn`,
        embeds: [
          {
            title: 'Warning',
            description: message,
            color: 15466375,
          },
        ],
      })
      .end(err => {
        if (err) globalHookErrors = globalHookErrors + 1
      })
  }
}

function generic(message: string) {
  if (globalHookErrors < 5) {
    sa.post(process.env.DOCKER_WEBHOOK_URL as string)
      .send({
        avatar_url: 'https://cdn.discordapp.com/avatars/846770591231246336/cf600c0028d21776aae00d58ae8f7631.png',
        username: `Docker - Generic`,
        embeds: [
          {
            title: 'Generic',
            description: message,
            color: 6052351,
          },
        ],
      })
      .end(err => {
        if (err) globalHookErrors = globalHookErrors + 1
      })
  }
}

function custom(message) {
  if (globalHookErrors < 5) {
    sa.post(process.env.DOCKER_WEBHOOK_URL as string)
      .send({
        avatar_url: 'https://cdn.discordapp.com/avatars/846770591231246336/cf600c0028d21776aae00d58ae8f7631.png',
        username: `Docker - Custom`,
        embeds: [
          {
            title: message.title || 'Webhook Logger',
            color: message.color || 6052351,
            description: message.description || 'No description provided.',
          },
        ],
        timestamp: new Date(),
      })
      .end(err => {
        if (err) globalHookErrors = globalHookErrors + 1
      })
  }
}

export { error, warn, generic, fatal, custom }

if (!process.env.DOCKER_WEBHOOK_URL) {
  global.logger.warn('Discord webhook url not specified, disabling webhook notifier.')
  exports.error = () => {}
  exports.warn = () => {}
  exports.generic = () => {}
  exports.fatal = () => {}
}
