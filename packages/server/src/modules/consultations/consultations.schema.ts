import { z } from 'zod'

export const vitalsSchema = z.object({
  bp: z.string().optional(),
  pulse: z.number().optional(),
  temperature: z.number().optional(),
  weight: z.number().optional(),
  height: z.number().optional(),
}).optional()

export const updateConsultationSchema = z.object({
  chiefComplaint: z.string().optional(),
  historyOfPresentIllness: z.string().optional(),
  vitals: vitalsSchema,
  examination: z.string().optional(),
  diagnosis: z.string().optional(),
  clinicalNotes: z.string().optional(),
  followUp: z.string().datetime().nullable().optional(),
})

export const addPrescriptionSchema = z.object({
  medicineName: z.string().min(1),
  strength: z.string(),
  dosage: z.string(),
  frequency: z.string(),
  duration: z.string(),
  route: z.string(),
  notes: z.string().optional(),
})

export const updatePrescriptionSchema = addPrescriptionSchema.partial()

export const finalizeConsultationSchema = z.object({
  reason: z.string().optional(),
})

export const createRevisionSchema = z.object({
  reason: z.string().min(1),
})


