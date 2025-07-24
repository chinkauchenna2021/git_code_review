import { PrismaClient } from '@prisma/client'

// Ensure this only runs on server-side
if (typeof window !== 'undefined') {
  throw new Error('❌ Prisma Client cannot be used in browser environment')
}

declare global {
  var __prisma: PrismaClient | undefined
}

let prisma: PrismaClient

try {
  if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient({
      log: ['error'],
      errorFormat: 'minimal',
    })
  } else {
    // In development, reuse connection to prevent too many connections
    if (!global.__prisma) {
      global.__prisma = new PrismaClient({
        log: ['query', 'error', 'warn'],
        errorFormat: 'pretty',
      })
    }
    prisma = global.__prisma
  }
} catch (error) {
  console.error('❌ Failed to initialize Prisma Client:', error)
  console.log('💡 Make sure to run: npx prisma generate')
  throw error
}

export { prisma }
export default prisma

// Graceful shutdown
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
  
  process.on('SIGINT', async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
  
  process.on('SIGTERM', async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
}
