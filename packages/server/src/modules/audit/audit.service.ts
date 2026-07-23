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
