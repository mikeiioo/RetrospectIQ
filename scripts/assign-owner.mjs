// Assigns every permit without an owner (uploaded before auth existed) to one account.
// Usage: npm run assign-owner -- <account-email>
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { MongoClient } from 'mongodb'

function loadEnvLocal() {
  let file
  try {
    file = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8')
  } catch {
    return
  }
  for (const line of file.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const index = trimmed.indexOf('=')
    if (index === -1) continue
    const key = trimmed.slice(0, index).trim()
    let value = trimmed.slice(index + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    process.env[key] ??= value
  }
}

loadEnvLocal()

const email = process.argv[2]
if (!email) {
  console.error('Usage: npm run assign-owner -- <account-email>')
  process.exit(1)
}
if (!process.env.MONGODB_URI) {
  console.error('Missing required environment variable: MONGODB_URI')
  process.exit(1)
}

const client = new MongoClient(process.env.MONGODB_URI)
try {
  await client.connect()
  const db = client.db()
  const user = await db.collection('user').findOne({ email: email.toLowerCase() })
  if (!user) {
    console.error(`No account found for ${email}. Sign up in the app first.`)
    process.exitCode = 1
  } else {
    const result = await db
      .collection('permits')
      .updateMany({ ownerId: { $exists: false } }, { $set: { ownerId: user._id.toString() } })
    console.log(`Assigned ${result.modifiedCount} unowned permit(s) to ${email}.`)
  }
} finally {
  await client.close()
}
