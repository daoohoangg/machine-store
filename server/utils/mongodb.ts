import { MongoClient, Db } from 'mongodb'

let client: MongoClient | null = null
let db: Db | null = null

export const useMongo = async () => {
  const config = useRuntimeConfig()
  const uri = config.mongodbUri

  if (!uri) {
    console.error('MONGODB_URI is MISSING from runtimeConfig')
    throw new Error('MONGODB_URI is not defined in runtimeConfig')
  }

  if (client && db) {
    return { client, db }
  }

  try {
    const maskedUri = uri.replace(/:([^@]+)@/, ':****@')
    console.log(`Connecting to MongoDB... (URI: ${maskedUri})`)
    
    client = new MongoClient(uri, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000
    })
    await client.connect()
    db = client.db('machine_store')
    console.log('Successfully connected to MongoDB Atlas')
    return { client, db }
  } catch (error: any) {
    console.error('MongoDB Connection Error:', error.message)
    if (error.message.includes('IP')) {
       console.error('PROBABLE CAUSE: IP not whitelisted on MongoDB Atlas')
    }
    client = null
    db = null
    throw error
  }
}
