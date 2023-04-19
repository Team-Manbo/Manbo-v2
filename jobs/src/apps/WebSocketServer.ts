import { Server as WS } from 'ws'

function sleep(ms: number) {
  return new Promise(resolveFunc => setTimeout(resolveFunc, ms))
}

const secret = process.env.WEBSOCKET_SECRET as string

const Server = new WS({
  port: Number(process.env.WEBSOCKET_PORT),
})

global.logger.info(`[WEBSOCKET] Server starting...`)

Server.on('connection', socket => {
  socket.on('message', msg => handle(socket, msg))
  socket.on('close', () => {})
  socket.on('error', console.error)
  send(socket, {
    op: '1001',
  })
})

function handle(socket, msg) {
  if (socket.readyState !== 1) return
  try {
    msg = JSON.parse(msg)
    validate(socket, msg)
  } catch (e) {
    return socket.close(4001)
  }

  switch (msg.op) {
    case '1': {
      Server.clients.forEach(x => {
        send(x, {
          op: '2',
          c: {
            ...msg.c,
          },
        })
      })
      break
    }
    case '1000': {
      // test - idk
      console.log(msg)
      break
    }
    case '1003': {
      // IDENTIFY_SUPPLY
      if (socket.type) return socket.close(4002) // ALREADY_AUTHENTICATED
      if (msg.c.secret === secret) {
        send(socket, {
          op: '1002',
          c: {
            success: true,
          },
        })
        if (msg.c.shard) {
          socket.type = 'shard'
          socket.shardid = msg.c.shard
        } else {
          socket.type = 'listener'
        }
      } else {
        send(socket, {
          op: '1002',
          c: {
            success: false,
          },
        })
      }
      break
    }
    case '2002': {
      // REQUEST_REPLY
      if (socket.type === 'shard') {
        Server.clients.forEach(x => {
          if (x.type === 'listener') {
            send(x, {
              op: '2002',
              c: msg.c,
            })
          }
        })
      }
      break
    }
    case '3000': {
      // stats
      Server.clients.forEach(x => {
        send(x, {
          op: '3001',
          c: {
            ...msg.c,
          },
        })
      })
      break
    }
    case '3002': {
      Server.clients.forEach(x => {
        send(x, {
          op: '3003',
          c: {
            ...msg.c,
          },
        })
      })
      break
    }
    case '5000': {
      // CANNOT_COMPLY
      Server.clients.forEach(x => {
        if (x.type !== socket.type) send(x, msg)
      })
      break
    }
    case '10010': {
      // command - reload
      ;(async loop => {
        for (const x of Server.clients) {
          send(x, {
            op: '10011',
            c: {
              ...msg.c,
            },
          })
          await sleep(loop)
        }
      })(1500)
      break
    }
  }
}

export function send(socket, payload) {
  if (socket.readyState !== 1) return
  if (typeof payload === 'object') payload = JSON.stringify(payload)
  socket.send(payload)
}

function validate(socket, msg) {
  if (socket.readyState !== 1) return
  if (msg.op === undefined) throw new Error()
  if (msg.c === undefined) throw new Error()
  return true
}
