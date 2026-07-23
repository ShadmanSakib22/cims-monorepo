### Task 2: Audit Logging Module

**Files:**
- Create: `packages/server/src/modules/audit/audit.service.ts`
- Create: `packages/server/src/modules/audit/audit.controller.ts`
- Create: `packages/server/src/modules/audit/audit.routes.ts`

**Interfaces:**
- Produces: `createAuditLog(params)` service, `GET /api/audit-logs` endpoint (admin only)

- [ ] **Step 1: Create `packages/server/src/modules/audit/audit.service.ts`**

```typescript
import prisma from '@/core/prisma.js'
import type { AuditLog } from '@prisma/client'

interface CreateAuditLogParams {
  userId: string
  entity: string
  entityId: string
  action: string
  changes?: Record<string, { old: any; new: any }>
  reason?: string
}

export async function createAuditLog(params: CreateAuditLogParams): Promise<AuditLog> {
  return prisma.auditLog.create({
    data: {
      userId: params.userId,
      entity: params.entity,
      entityId: params.entityId,
      action: params.action,
      changes: params.changes ?? undefined,
      reason: params.reason,
    },
  })
}

interface GetAuditLogsParams {
  page: number
  limit: number
  userId?: string
  entity?: string
  action?: string
}

export async function getAuditLogs(params: GetAuditLogsParams) {
  const where: any = {}
  if (params.userId) where.userId = params.userId
  if (params.entity) where.entity = params.entity
  if (params.action) where.action = params.action

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    }),
    prisma.auditLog.count({ where }),
  ])

  return { logs, total, page: params.page, limit: params.limit }
}
```

- [ ] **Step 2: Create `packages/server/src/modules/audit/audit.controller.ts`**

```typescript
import type { Request, Response, NextFunction } from 'express'
import { getAuditLogs } from './audit.service.js'

export async function listAuditLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20))

    const result = await getAuditLogs({
      page,
      limit,
      userId: req.query.userId as string | undefined,
      entity: req.query.entity as string | undefined,
      action: req.query.action as string | undefined,
    })

    res.json(result)
  } catch (err) {
    next(err)
  }
}
```

- [ ] **Step 3: Create `packages/server/src/modules/audit/audit.routes.ts`**

```typescript
import { Router } from 'express'
import { requireAuth, requireRole } from '@/core/clerk.js'
import { listAuditLogs } from './audit.controller.js'

const router = Router()

router.get('/audit-logs', requireAuth, requireRole('ADMIN'), listAuditLogs)

export default router
```

NOTE: Do NOT do Step 4 (register routes in app.ts) — Task 7 will handle all route registration in a single app.ts rewrite.
