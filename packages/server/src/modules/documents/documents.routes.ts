import { Router } from 'express'
import { requireAuth } from '@/core/clerk.js'
import { listByPatient, upload, remove } from './documents.controller.js'

const router = Router()

router.get('/patients/:patientId/documents', requireAuth, listByPatient)
router.post('/documents', requireAuth, upload)
router.delete('/documents/:id', requireAuth, remove)

export default router
