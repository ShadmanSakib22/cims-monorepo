import type { z } from 'zod'
import type { createDoctorSchema, updateDoctorSchema, createScheduleSchema, updateScheduleSchema } from './doctors.schema.js'

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>
export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>
export type CreateScheduleInput = z.infer<typeof createScheduleSchema>
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>
