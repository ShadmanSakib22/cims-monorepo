import { Router } from 'express'
import { requireAuth, requireRole } from '@/core/clerk.js'
import { dashboard, doctorAnalytics, clinicalAnalytics, appointmentTrends, aiInsights } from './analytics.controller.js'

const router = Router()

router.get('/analytics/dashboard', requireAuth, requireRole('ADMIN'), dashboard)
router.get('/analytics/doctors/:doctorId', requireAuth, requireRole('ADMIN'), doctorAnalytics)
router.get('/analytics/clinical', requireAuth, requireRole('ADMIN'), clinicalAnalytics)
router.get('/analytics/trends', requireAuth, requireRole('ADMIN'), appointmentTrends)
router.get('/analytics/insights', requireAuth, requireRole('ADMIN'), aiInsights)

export default router
