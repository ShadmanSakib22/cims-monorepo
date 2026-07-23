import { z } from 'zod'

export const createDoctorSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().optional(),
  specialty: z.string().min(1),
  qualifications: z.string(),
  experience: z.number().int().nonnegative().optional(),
  consultationDuration: z.number().int().positive().default(15),
  maxAppointmentsPerDay: z.number().int().positive().default(30),
  photoUrl: z.string().url().optional(),
})

export const updateDoctorSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  phone: z.string().optional(),
  specialty: z.string().optional(),
  qualifications: z.string().optional(),
  experience: z.number().int().nonnegative().optional(),
  consultationDuration: z.number().int().positive().optional(),
  maxAppointmentsPerDay: z.number().int().positive().optional(),
  isOnVacation: z.boolean().optional(),
  photoUrl: z.string().url().nullable().optional(),
})

export const createScheduleSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
})

export const updateScheduleSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  isActive: z.boolean().optional(),
})
