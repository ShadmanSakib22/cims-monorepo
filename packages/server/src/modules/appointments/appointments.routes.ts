import { Router } from 'express'
import { requireAuth, requireRole } from '@/core/clerk.js'
import {
  list, getById, book, updateAppointmentStatus, cancelAppointment, doctorQueue,
} from './appointments.controller.js'

const router = Router()

router.get('/appointments', requireAuth, list)
router.get('/appointments/:id', requireAuth, getById)
router.post('/appointments', requireAuth, book)
router.patch('/appointments/:id/status', requireAuth, updateAppointmentStatus)
router.post('/appointments/:id/cancel', requireAuth, cancelAppointment)
router.get('/doctors/:doctorId/queue', requireAuth, doctorQueue)

export default router
