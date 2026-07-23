### Task 6: Queue Module (WebSocket Gateway)

**Files:**
- Create: `packages/server/src/modules/queue/queue.gateway.ts`
- Modify: `packages/server/src/index.ts`

This module sets up Socket.IO event handlers for the real-time queue. The actual state transitions are driven by appointment status changes (handled in the appointments service which already emits events). This file just registers the queue-specific room management.

- [ ] **Step 1: Create `packages/server/src/modules/queue/queue.gateway.ts`**

```typescript
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
```

- [ ] **Step 2: Wire queue gateway into server entry point**

Read `I:\SmartClinic\smart-clinic-scheduler\packages\server\src\index.ts`, then edit to add the import and call:

Add at the top:
```typescript
import { registerQueueHandlers } from '@/modules/queue/queue.gateway.js'
```

Replace the `initSocket(httpServer)` line with:
```typescript
const io = initSocket(httpServer)
registerQueueHandlers(io)
```

The current index.ts contains:
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
...
```

Change `initSocket(httpServer)` to `const io = initSocket(httpServer); registerQueueHandlers(io)` and add the import.
