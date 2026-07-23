import type { z } from 'zod'
import type { createPatientSchema, updatePatientSchema } from './patients.schema.js'

export type CreatePatientInput = z.infer<typeof createPatientSchema>
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>
