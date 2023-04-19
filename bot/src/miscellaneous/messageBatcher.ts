import format from 'pg-format'
import pool from '../database/clients/postgres'
import { PostgresMessages } from '../../typings'

const BATCH_SIZE = parseInt(process.env.MESSAGE_BATCH_SIZE as string) ?? 1000
const batch: Array<PostgresMessages> = []

async function addItem(messageAsArray) {
  batch.push(messageAsArray)
  if (batch.length >= BATCH_SIZE) {
    await submitBatch()
  }
}

async function submitBatch(): Promise<void> {
  const toSubmit = batch.splice(0, BATCH_SIZE)
  const poolClient = await pool.getPostgresClient()
  await poolClient.query(format('INSERT INTO messages (id, author_id, content, attachment_b64, ts) VALUES %L ON CONFLICT DO NOTHING', toSubmit))
  poolClient.release()
}

function getMessage(messageID: string): PostgresMessages | undefined {
  const message: PostgresMessages | undefined = batch.find(m => m[0] === messageID)
  if (!message) return
  return {
    id: message[0],
    author_id: message[1],
    content: global.aes.decrypt(message[2]),
    attachment_b64: '',
    ts: Date.parse(message[4]),
  }
}

function updateMessage(messageID: string, content: string) {
  for (let i = 0; i < batch.length; i++) {
    if (batch[i][0] === messageID) {
      batch[i][2] = global.aes.encrypt(content || 'None')
      break
    }
  }
}

export default {
  getMessage,
  addItem,
  updateMessage,
  submitBatch,
}
