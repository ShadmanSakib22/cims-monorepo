import type { Server as SocketIOServer } from 'socket.io'
import logger from '@/core/logger.js'

export function registerQueueHandlers(io: SocketIOServer) {
  io.on('connection', (socket) => {
    const user = (socket as any).user

    if (user.role === 'DOCTOR') {
      socket.join(`doctor:${user.userId}`)
      logger.info({ userId: user.id }, 'Doctor joined queue room')
    }

    if (user.role === 'RECEPTIONIST' || user.role === 'ADMIN') {
      socket.join('reception')
      logger.info({ userId: user.id }, 'Reception joined queue room')
    }

    socket.on('queue:request-update', () => {
      if (user.role === 'DOCTOR') {
        socket.emit('queue:refresh')
      }
    })
  })
}
