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
