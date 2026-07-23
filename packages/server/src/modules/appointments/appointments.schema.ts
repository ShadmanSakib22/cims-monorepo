import { z } from 'zod'
import { AppointmentStatus, VisitType } from '@prisma/client'

const appointmentStatusValues = Object.values(AppointmentStatus) as [string, ...string[]]
const visitTypeValues = Object.values(VisitType) as [string, ...string[]]

export const bookAppointmentSchema = z.object({
  patientId: z.string(),
  doctorId: z.string(),
  date: z.string().datetime(),
  duration: z.number().int().positive().default(15),
  type: z.enum(visitTypeValues).default('REGULAR'),
  notes: z.string().optional(),
})

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(appointmentStatusValues),
})

export const cancelAppointmentSchema = z.object({
  reason: z.string().optional(),
})

export const listAppointmentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  doctorId: z.string().optional(),
  patientId: z.string().optional(),
  status: z.enum(appointmentStatusValues).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
})
