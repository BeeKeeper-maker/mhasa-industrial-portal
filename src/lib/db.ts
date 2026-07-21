import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

let dbUrl = process.env.DATABASE_URL
if (process.env.VERCEL) {
  const sourcePath = path.join(process.cwd(), 'db', 'custom.db')
  const destPath = '/tmp/custom.db'
  try {
    if (fs.existsSync(sourcePath)) {
      // Copy to /tmp because Vercel root is read-only, preventing SQLite WAL creation
      fs.copyFileSync(sourcePath, destPath)
      dbUrl = 'file:/tmp/custom.db'
      console.log('Copied database to /tmp/custom.db for Vercel')
    }
  } catch (e) {
    console.error('Failed to copy db to /tmp', e)
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
    datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db