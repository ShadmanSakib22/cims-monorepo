import { Router } from 'express'
import { requireAuth, requireRole } from '@/core/clerk.js'
import { listAuditLogs } from './audit.controller.js'

const router = Router()

router.get('/audit-logs', requireAuth, requireRole('ADMIN'), listAuditLogs)

export default router
