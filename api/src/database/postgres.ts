import { Pool } from 'pg'

const pool = new Pool({
  user: process.env.PG_USER,
  host: global.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: Number(process.env.PG_PORT) || 5432,
  max: 5,
})

pool.on('error', e => {
  global.logger.error('Postgres error', e)
})

export default {
  query: async (sqlString, formatArgs?) => {
    let transactionClient
    try {
      transactionClient = await pool.connect()
      const returnVals = await transactionClient.query(sqlString, formatArgs)
      transactionClient.release()
      return returnVals
    } catch (e) {
      if (transactionClient) transactionClient.release()
      throw new Error(e as string)
    }
  },
  getPostgresClient: async () => {
    try {
      return await pool.connect()
    } catch (e) {
      throw new Error(e as string)
    }
  },
  end: cb => {
    pool.end(cb)
  },
}
