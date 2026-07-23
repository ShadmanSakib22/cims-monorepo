import app from './app.js'
import logger from '@/core/logger.js'

const PORT = parseInt(process.env.PORT || '3000', 10)
const HOST = process.env.HOST || '0.0.0.0'

const server = app.listen(PORT, HOST, () => {
  logger.info({ port: PORT, host: HOST }, 'Server started')
})

function shutdown(signal: string) {
  logger.info({ signal }, 'Shutdown signal received')
  server.close(() => {
    logger.info('Server closed')
    process.exit(0)
  })
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
