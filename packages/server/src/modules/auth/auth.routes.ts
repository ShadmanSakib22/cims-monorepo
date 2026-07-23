import { Router } from 'express'
import { handleClerkWebhook } from './auth.controller.js'

const router = Router()

router.post('/webhooks/clerk', handleClerkWebhook)

export default router
