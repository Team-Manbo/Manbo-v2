import fs from 'fs'
import path from 'path'

import { EventEmitter } from '../../../typings'

export default async () => {
  const once: Array<EventEmitter> = []
  const on: Array<EventEmitter> = []
  const loadFiles = (dir: string) => {
    const files = fs.readdirSync(dir)
    for (const file of files) {
      const pathToFile = path.resolve(dir, file)
      const isDirectory = fs.statSync(pathToFile).isDirectory()
      if (isDirectory) {
        loadFiles(pathToFile)
      } else {
        if (require.cache[pathToFile]) delete require.cache[pathToFile]
        const event = require(pathToFile)
        event.name = event.name.replace('.js', '')
        if (event.type === 'once') {
          once.push({ name: event.name, handle: event.handle })
        } else {
          on.push({ name: event.name, handle: event.handle, ...(event.requiredPerms?.length ? { requiredPerms: event.requiredPerms } : {}) })
        }
      }
    }
  }
  loadFiles(path.resolve('dist', 'src', 'app', 'events'))
  global.bot.typeOnEvent = on.map(r => r.name)
  global.bot.typeOnceEvent = once.map(r => r.name)
  return [on, once]
}
