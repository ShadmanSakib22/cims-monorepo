import { Router } from 'express'
import { requireAuth, requireRole } from '@/core/clerk.js'
import {
  list, getById, create, update,
  listSchedules, addSchedule, editSchedule, removeSchedule,
} from './doctors.controller.js'

const router = Router()

router.get('/doctors', requireAuth, list)
router.get('/doctors/:id', requireAuth, getById)
router.post('/doctors', requireAuth, requireRole('ADMIN'), create)
router.put('/doctors/:id', requireAuth, requireRole('ADMIN'), update)

router.get('/doctors/:id/schedules', requireAuth, listSchedules)
router.post('/doctors/:id/schedules', requireAuth, requireRole('ADMIN'), addSchedule)
router.put('/doctors/:id/schedules/:scheduleId', requireAuth, requireRole('ADMIN'), editSchedule)
router.delete('/doctors/:id/schedules/:scheduleId', requireAuth, requireRole('ADMIN'), removeSchedule)

export default router
