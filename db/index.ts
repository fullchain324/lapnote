const connectionString = process.env.DATABASE_URL

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const sql = postgres(connectionString, { max: 1 })
export const db = drizzle(sql)
