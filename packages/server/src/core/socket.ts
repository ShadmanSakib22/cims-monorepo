import { Server as HttpServer } from 'http'
import { Server, Socket } from 'socket.io'
import { clerkClient } from '@clerk/clerk-sdk-node'
import prisma from './prisma.js'
import logger from './logger.js'

let io: Server | null = null

export function initSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  })

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token
      if (!token) {
        return next(new Error('Authentication required'))
      }

      const { sub } = await clerkClient.verifyToken(token as string)
      const user = await prisma.user.findUnique({ where: { clerkId: sub } })
      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'))
      }

      ;(socket as any).user = user
      next()
    } catch (err) {
      next(new Error('Authentication failed'))
    }
  })

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user
    logger.info({ userId: user.id, role: user.role }, 'Socket connected')

    socket.on('disconnect', () => {
      logger.info({ userId: user.id }, 'Socket disconnected')
    })
  })

  logger.info('Socket.IO initialized')
  return io
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initSocket first.')
  }
  return io
}
