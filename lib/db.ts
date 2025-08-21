import { MongoClient } from 'mongodb'
import type { Db, Document, Collection } from 'mongodb'

type GlobalWithMongo = typeof globalThis & {
  __mongoClient?: MongoClient
  __mongoDb?: Db
}

const globalWithMongo = globalThis as GlobalWithMongo

function getMongoUri(): string {
  const uri = process.env.DATABASE_URL || process.env.MONGODB_URI
  if (!uri) {
    throw new Error('DATABASE_URL or MONGODB_URI must be set')
  }
  return uri
}

function getDatabaseNameFromUri(uri: string): string | undefined {
  try {
    const url = new URL(uri)
    // mongodb+srv URIs may not have pathname set to db name if omitted
    const pathname = url.pathname?.replace(/^\//, '')
    return pathname || process.env.MONGODB_DB || process.env.DATABASE_NAME || undefined
  } catch {
    return process.env.MONGODB_DB || process.env.DATABASE_NAME
  }
}

export async function getDb(): Promise<Db> {
  if (globalWithMongo.__mongoDb) return globalWithMongo.__mongoDb

  const uri = getMongoUri()
  const client = globalWithMongo.__mongoClient ?? new MongoClient(uri)
  if (!globalWithMongo.__mongoClient) {
    await client.connect()
    globalWithMongo.__mongoClient = client
  }

  const dbName = getDatabaseNameFromUri(uri) || 'smart_grocery'
  const db = client.db(dbName)
  globalWithMongo.__mongoDb = db
  return db
}

export async function getCollection<TSchema extends Document = Document>(name: string): Promise<Collection<TSchema>> {
  const db = await getDb()
  return db.collection<TSchema>(name)
}