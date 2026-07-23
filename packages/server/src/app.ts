import express from 'express'
import cors from 'cors'
import logger from '@/core/logger.js'
import { AppError } from '@/core/errors.js'
import authRoutes from '@/modules/auth/auth.routes.js'
import auditRoutes from '@/modules/audit/audit.routes.js'
import patientsRoutes from '@/modules/patients/patients.routes.js'
import doctorsRoutes from '@/modules/doctors/doctors.routes.js'
import appointmentsRoutes from '@/modules/appointments/appointments.routes.js'
import consultationsRoutes from '@/modules/consultations/consultations.routes.js'
import documentsRoutes from '@/modules/documents/documents.routes.js'
import analyticsRoutes from '@/modules/analytics/analytics.routes.js'
import searchRoutes from '@/modules/search/search.routes.js'

const app: express.Application = express()

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))

app.use('/api/webhooks', express.raw({ type: 'application/json' }))
app.use(express.json({ limit: '10mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api', authRoutes)
app.use('/api', auditRoutes)
app.use('/api', patientsRoutes)
app.use('/api', doctorsRoutes)
app.use('/api', appointmentsRoutes)
app.use('/api', consultationsRoutes)
app.use('/api', documentsRoutes)
app.use('/api', analyticsRoutes)
app.use('/api', searchRoutes)

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err }, 'Unhandled error')

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    })
  }

  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON' })
  }

  res.status(500).json({
    error: 'Internal server error',
  })
})

export default app
