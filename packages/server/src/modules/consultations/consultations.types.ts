import type { z } from 'zod'
import type {
  updateConsultationSchema,
  addPrescriptionSchema,
  updatePrescriptionSchema,
  finalizeConsultationSchema,
  createRevisionSchema,
} from './consultations.schema.js'

export type UpdateConsultationInput = z.infer<typeof updateConsultationSchema>
export type AddPrescriptionInput = z.infer<typeof addPrescriptionSchema>
export type UpdatePrescriptionInput = z.infer<typeof updatePrescriptionSchema>
export type FinalizeConsultationInput = z.infer<typeof finalizeConsultationSchema>
export type CreateRevisionInput = z.infer<typeof createRevisionSchema>
