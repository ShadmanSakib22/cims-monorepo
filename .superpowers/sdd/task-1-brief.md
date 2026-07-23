### Task 1: Core Socket.IO Setup

**Files:**
- Create: `packages/server/src/core/socket.ts`
- Modify: `packages/server/src/index.ts`

**Interfaces:**
- Produces: `initSocket(httpServer)` that returns `io` instance
- Consumes Clerk JWT from socket handshake auth
- Room naming convention: `doctor:<doctorId>`, `reception:<receptionistId>`

- [ ] **Step 1: Create `packages/server/src/core/socket.ts`**

```typescript
import { Server as HttpServer } from 'http'
import { Server, Socket } from 'socket.io'
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

      const parts = (token as string).split('.')
      if (parts.length !== 3) {
        return next(new Error('Invalid token'))
      }

      const claims = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'))
      if (!claims?.sub) {
        return next(new Error('Invalid token claims'))
      }

      const user = await prisma.user.findUnique({ where: { clerkId: claims.sub } })
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

    socket.on('join:doctor-queue', (doctorId: string) => {
      socket.join(`doctor:${doctorId}`)
    })

    socket.on('join:reception', () => {
      socket.join('reception')
    })

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
```

- [ ] **Step 2: Modify `packages/server/src/index.ts` — integrate Socket.IO**

Read the file first, then replace content with:

```typescript
import { createServer } from 'http'
import app from './app.js'
import { initSocket } from '@/core/socket.js'
import logger from '@/core/logger.js'

const PORT = parseInt(process.env.PORT || '3000', 10)
const HOST = process.env.HOST || '0.0.0.0'

const httpServer = createServer(app)
initSocket(httpServer)

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
```

- [ ] **Step 3: Verify typecheck**

Run: `cd I:\SmartClinic\smart-clinic-scheduler\packages\server && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Install socket.io types**

Run: `cd I:\SmartClinic\smart-clinic-scheduler && pnpm --filter @smartclinic/server add socket.io`
(The `@types/socket.io` is bundled with socket.io package itself.)
