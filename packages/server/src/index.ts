import { createServer } from 'http'
import app from './app.js'
import { initSocket } from '@/core/socket.js'
import { registerQueueHandlers } from '@/modules/queue/queue.gateway.js'
import logger from '@/core/logger.js'

const PORT = parseInt(process.env.PORT || '3000', 10)
const HOST = process.env.HOST || '0.0.0.0'

const httpServer = createServer(app)
const io = initSocket(httpServer)
registerQueueHandlers(io)

httpServer.listen(PORT, HOST, () => {
  logger.info({ port: PORT, host: HOST }, 'Server started')
})

function shutdown(signal: string) {
  logger.info({ signal }, 'Shutdown signal received')
  httpServer.close(() => {
    logger.info('Server closed')
    process.exit(0)
  })
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
