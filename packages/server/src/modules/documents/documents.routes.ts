import { Router } from 'express'
import { requireAuth } from '@/core/clerk.js'
import { upload } from './upload.config.js'
import { listByPatient, uploadFile, remove } from './documents.controller.js'

const router = Router()

router.get('/patients/:patientId/documents', requireAuth, listByPatient)
router.post('/documents/upload', requireAuth, upload.single('file'), uploadFile)
router.delete('/documents/:id', requireAuth, remove)

export default router
