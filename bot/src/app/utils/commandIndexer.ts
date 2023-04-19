import Command from '../bases/Command'
import SlashCommand from '../bases/SlashCommand'
import fs from 'fs'
import path from 'path'

export default (type: 'commands' | 'slashcommands') => {
  if (type === 'commands') loadCommandFiles(path.resolve('dist', 'src', 'app', 'commands'))
  else if (type === 'slashcommands') loadSlashCommandFiles(path.resolve('dist', 'src', 'app', 'slashcommands'))
}

function loadCommandFiles(dir: string): void {
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const pathToFile = path.resolve(dir, file)
    const isDirectory = fs.statSync(pathToFile).isDirectory()
    if (isDirectory) {
      loadCommandFiles(pathToFile)
    } else {
      if (require.cache[pathToFile]) delete require.cache[pathToFile]
      new Command(require(pathToFile))
    }
  }
}

function loadSlashCommandFiles(dir: string): void {
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const pathToFile = path.resolve(dir, file)
    const isDirectory = fs.statSync(pathToFile).isDirectory()
    if (isDirectory) {
      loadSlashCommandFiles(pathToFile)
    } else {
      if (require.cache[pathToFile]) delete require.cache[pathToFile]
      new SlashCommand(require(pathToFile))
    }
  }
}
