import type { Request, Response, NextFunction } from 'express'
import {
  getDashboardStats,
  getDoctorAnalytics,
  getClinicalAnalytics,
  getAppointmentTrends,
} from './analytics.service.js'

export async function dashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await getDashboardStats()
    res.json(stats)
  } catch (err) { next(err) }
}

export async function doctorAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await getDoctorAnalytics(req.params.doctorId as string)
    res.json(stats)
  } catch (err) { next(err) }
}

export async function clinicalAnalytics(_req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await getClinicalAnalytics()
    res.json(stats)
  } catch (err) { next(err) }
}

export async function appointmentTrends(req: Request, res: Response, next: NextFunction) {
  try {
    const days = parseInt(req.query.days as string) || 30
    const stats = await getAppointmentTrends(days)
    res.json(stats)
  } catch (err) { next(err) }
}
