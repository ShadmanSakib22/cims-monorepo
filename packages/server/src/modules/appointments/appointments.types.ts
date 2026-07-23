import type { z } from 'zod'
import type { bookAppointmentSchema, updateAppointmentStatusSchema, cancelAppointmentSchema, listAppointmentsQuerySchema } from './appointments.schema.js'

export type BookAppointmentInput = z.infer<typeof bookAppointmentSchema>
export type UpdateAppointmentStatusInput = z.infer<typeof updateAppointmentStatusSchema>
export type CancelAppointmentInput = z.infer<typeof cancelAppointmentSchema>
export type ListAppointmentsQuery = z.infer<typeof listAppointmentsQuerySchema>
