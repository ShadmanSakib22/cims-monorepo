import { Router } from 'express'
import { requireAuth } from '@/core/clerk.js'
import { search } from './search.controller.js'

const router = Router()

router.post('/search', requireAuth, search)

export default router
