import { Router } from 'express'
import { requireAuth, requireRole } from '@/core/clerk.js'
import { list, getById, create, update } from './patients.controller.js'

const router = Router()

router.get('/patients', requireAuth, list)
router.get('/patients/:id', requireAuth, getById)
router.post('/patients', requireAuth, requireRole('ADMIN', 'RECEPTIONIST'), create)
router.put('/patients/:id', requireAuth, requireRole('ADMIN', 'RECEPTIONIST'), update)

export default router
