import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

let dbUrl = process.env.DATABASE_URL
if (process.env.VERCEL) {
  const sourcePath = path.join(process.cwd(), 'db', 'custom.db')
  const destPath = '/tmp/custom.db'
  try {
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath)
      dbUrl = 'file:/tmp/custom.db'
      console.log('Copied database to /tmp/custom.db for Vercel')
    }
  } catch (e) {
    console.error('Failed to copy db to /tmp', e)
  }
} else {
  // Ensure local db URL points to valid path if absolute path is invalid
  const localDbPath = path.join(process.cwd(), 'db', 'custom.db')
  if (dbUrl?.startsWith('file:/') && !fs.existsSync(dbUrl.replace('file:', ''))) {
    dbUrl = `file:${localDbPath}`
  } else if (!dbUrl && fs.existsSync(localDbPath)) {
    dbUrl = `file:${localDbPath}`
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