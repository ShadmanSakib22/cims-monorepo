import { Router } from 'express'
import { requireAuth, requireRole } from '@/core/clerk.js'
import {
  getById,
  update,
  addPrescriptionHandler,
  removePrescriptionHandler,
  finalize,
  revise,
} from './consultations.controller.js'

const router = Router()

router.get('/consultations/:id', requireAuth, getById)
router.put('/consultations/:id', requireAuth, requireRole('DOCTOR', 'ADMIN'), update)
router.post('/consultations/:id/prescriptions', requireAuth, requireRole('DOCTOR', 'ADMIN'), addPrescriptionHandler)
router.delete('/consultations/:id/prescriptions/:prescriptionId', requireAuth, requireRole('DOCTOR', 'ADMIN'), removePrescriptionHandler)
router.post('/consultations/:id/finalize', requireAuth, requireRole('DOCTOR', 'ADMIN'), finalize)
router.post('/consultations/:id/revision', requireAuth, requireRole('DOCTOR', 'ADMIN'), revise)

export default router
