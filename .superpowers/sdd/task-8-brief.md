### Task 8: Consultations Module

**Files:**
- Create: `packages/server/src/modules/consultations/consultations.schema.ts`
- Create: `packages/server/src/modules/consultations/consultations.types.ts`
- Create: `packages/server/src/modules/consultations/consultations.service.ts`
- Create: `packages/server/src/modules/consultations/consultations.controller.ts`
- Create: `packages/server/src/modules/consultations/consultations.routes.ts`

- [ ] **Step 1: Create `packages/server/src/modules/consultations/consultations.schema.ts`**

```typescript
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

export const labOrderSchema = z.object({
  test: z.string().min(1),
  notes: z.string().optional(),
})

export const imagingOrderSchema = z.object({
  test: z.string().min(1),
  notes: z.string().optional(),
})
```

- [ ] **Step 2: Create `packages/server/src/modules/consultations/consultations.types.ts`**

```typescript
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
```

- [ ] **Step 3: Create `packages/server/src/modules/consultations/consultations.service.ts`**

```typescript
import prisma from '@/core/prisma.js'
import { NotFoundError, ValidationError } from '@/core/errors.js'
import { getIO } from '@/core/socket.js'
import { createAuditLog } from '@/modules/audit/audit.service.js'
import type {
  UpdateConsultationInput,
  AddPrescriptionInput,
  UpdatePrescriptionInput,
  FinalizeConsultationInput,
  CreateRevisionInput,
} from './consultations.types.js'

export async function getConsultationById(consultationId: string) {
  const consultation = await prisma.consultation.findUnique({
    where: { id: consultationId },
    include: {
      appointment: true,
      patient: { include: { user: { select: { name: true, phone: true } } } },
      doctor: { include: { user: { select: { name: true } } } },
      prescriptions: true,
      revisedFrom: true,
    },
  })
  if (!consultation) throw new NotFoundError('Consultation')
  return consultation
}

export async function updateConsultation(
  consultationId: string,
  data: UpdateConsultationInput,
  userId: string
) {
  const existing = await prisma.consultation.findUnique({ where: { id: consultationId } })
  if (!existing) throw new NotFoundError('Consultation')
  if (existing.status === 'FINALIZED') {
    throw new ValidationError('Cannot edit a finalized consultation. Create a revision instead.')
  }

  const consultation = await prisma.consultation.update({
    where: { id: consultationId },
    data: {
      chiefComplaint: data.chiefComplaint,
      historyOfPresentIllness: data.historyOfPresentIllness,
      vitals: data.vitals ?? undefined,
      examination: data.examination,
      diagnosis: data.diagnosis,
      clinicalNotes: data.clinicalNotes,
      followUp: data.followUp ? new Date(data.followUp) : null,
    },
    include: {
      appointment: true,
      prescriptions: true,
    },
  })

  await createAuditLog({ userId, entity: 'Consultation', entityId: consultation.id, action: 'UPDATED' })
  return consultation
}

export async function addPrescription(
  consultationId: string,
  data: AddPrescriptionInput,
  userId: string
) {
  const consultation = await prisma.consultation.findUnique({ where: { id: consultationId } })
  if (!consultation) throw new NotFoundError('Consultation')
  if (consultation.status === 'FINALIZED') {
    throw new ValidationError('Cannot modify a finalized consultation')
  }

  const prescription = await prisma.prescription.create({
    data: { ...data, consultationId },
  })

  await createAuditLog({
    userId,
    entity: 'Prescription',
    entityId: prescription.id,
    action: 'ADDED',
    changes: { consultationId: { old: null, new: consultationId } },
  })

  return prescription
}

export async function removePrescription(prescriptionId: string, userId: string) {
  const existing = await prisma.prescription.findUnique({ where: { id: prescriptionId } })
  if (!existing) throw new NotFoundError('Prescription')

  await prisma.prescription.delete({ where: { id: prescriptionId } })
  await createAuditLog({ userId, entity: 'Prescription', entityId: prescriptionId, action: 'REMOVED' })
}

export async function finalizeConsultation(
  consultationId: string,
  data: FinalizeConsultationInput,
  userId: string
) {
  const existing = await prisma.consultation.findUnique({ where: { id: consultationId } })
  if (!existing) throw new NotFoundError('Consultation')
  if (existing.status === 'FINALIZED') {
    throw new ValidationError('Consultation is already finalized')
  }

  const consultation = await prisma.consultation.update({
    where: { id: consultationId },
    data: { status: 'FINALIZED', finalizedAt: new Date() },
    include: {
      appointment: { include: { doctor: true } },
      prescriptions: true,
    },
  })

  // Update appointment status to COMPLETED
  await prisma.appointment.update({
    where: { id: consultation.appointmentId },
    data: { status: 'COMPLETED' },
  })

  // Emit WebSocket event
  try {
    const io = getIO()
    io.to(`doctor:${consultation.appointment.doctorId}`).emit('consultation:completed', {
      appointmentId: consultation.appointmentId,
      consultationId: consultation.id,
    })
    io.to('reception').emit('consultation:completed', {
      appointmentId: consultation.appointmentId,
      consultationId: consultation.id,
    })
  } catch { /* skip */ }

  await createAuditLog({
    userId,
    entity: 'Consultation',
    entityId: consultation.id,
    action: 'FINALIZED',
    changes: { status: { old: 'DRAFT', new: 'FINALIZED' } },
  })

  return consultation
}

export async function createRevision(
  originalConsultationId: string,
  data: CreateRevisionInput,
  userId: string
) {
  const original = await prisma.consultation.findUnique({
    where: { id: originalConsultationId },
    include: { prescriptions: true },
  })
  if (!original) throw new NotFoundError('Consultation')
  if (original.status !== 'FINALIZED') {
    throw new ValidationError('Can only create revisions from finalized consultations')
  }

  const revision = await prisma.consultation.create({
    data: {
      appointmentId: original.appointmentId,
      patientId: original.patientId,
      doctorId: original.doctorId,
      status: 'DRAFT',
      version: original.version + 1,
      revisedFromId: original.id,
      revisionReason: data.reason,
      chiefComplaint: original.chiefComplaint,
      historyOfPresentIllness: original.historyOfPresentIllness,
      vitals: original.vitals,
      examination: original.examination,
      diagnosis: original.diagnosis,
      clinicalNotes: original.clinicalNotes,
    },
  })

  // Copy prescriptions from original
  if (original.prescriptions.length > 0) {
    await prisma.prescription.createMany({
      data: original.prescriptions.map((p) => ({
        consultationId: revision.id,
        medicineName: p.medicineName,
        strength: p.strength,
        dosage: p.dosage,
        frequency: p.frequency,
        duration: p.duration,
        route: p.route,
        notes: p.notes,
      })),
    })
  }

  // Revert appointment status to IN_CONSULTATION
  await prisma.appointment.update({
    where: { id: original.appointmentId },
    data: { status: 'IN_CONSULTATION' },
  })

  await createAuditLog({
    userId,
    entity: 'Consultation',
    entityId: revision.id,
    action: 'REVISION_CREATED',
    changes: { originalId: { old: null, new: original.id }, reason: { old: null, new: data.reason } },
  })

  return prisma.consultation.findUnique({
    where: { id: revision.id },
    include: { prescriptions: true },
  })
}
```

- [ ] **Step 4: Create `packages/server/src/modules/consultations/consultations.controller.ts`**

```typescript
import type { Request, Response, NextFunction } from 'express'
import {
  getConsultationById,
  updateConsultation,
  addPrescription,
  removePrescription,
  finalizeConsultation,
  createRevision,
} from './consultations.service.js'
import {
  updateConsultationSchema,
  addPrescriptionSchema,
  finalizeConsultationSchema,
  createRevisionSchema,
} from './consultations.schema.js'

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const consultation = await getConsultationById(req.params.id)
    res.json(consultation)
  } catch (err) { next(err) }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const data = updateConsultationSchema.parse(req.body)
    const consultation = await updateConsultation(req.params.id, data, req.user!.userId)
    res.json(consultation)
  } catch (err) { next(err) }
}

export async function addPrescriptionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data = addPrescriptionSchema.parse(req.body)
    const prescription = await addPrescription(req.params.id, data, req.user!.userId)
    res.status(201).json(prescription)
  } catch (err) { next(err) }
}

export async function removePrescriptionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await removePrescription(req.params.prescriptionId, req.user!.userId)
    res.status(204).send()
  } catch (err) { next(err) }
}

export async function finalize(req: Request, res: Response, next: NextFunction) {
  try {
    const data = finalizeConsultationSchema.parse(req.body)
    const consultation = await finalizeConsultation(req.params.id, data, req.user!.userId)
    res.json(consultation)
  } catch (err) { next(err) }
}

export async function revise(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createRevisionSchema.parse(req.body)
    const revision = await createRevision(req.params.id, data, req.user!.userId)
    res.status(201).json(revision)
  } catch (err) { next(err) }
}
```

- [ ] **Step 5: Create `packages/server/src/modules/consultations/consultations.routes.ts`**

```typescript
import { Router } from 'express'
import { requireAuth, requireRole } from '@/core/clerk.js'
import {
  getById,
  update,
  addPrescriptionHandler,
  removePrescriptionHandler,
  finalize,
  revise,
} from './consultations.controller.js'

const router = Router()

router.get('/consultations/:id', requireAuth, getById)
router.put('/consultations/:id', requireAuth, requireRole('DOCTOR', 'ADMIN'), update)
router.post('/consultations/:id/prescriptions', requireAuth, requireRole('DOCTOR', 'ADMIN'), addPrescriptionHandler)
router.delete('/consultations/:id/prescriptions/:prescriptionId', requireAuth, requireRole('DOCTOR', 'ADMIN'), removePrescriptionHandler)
router.post('/consultations/:id/finalize', requireAuth, requireRole('DOCTOR', 'ADMIN'), finalize)
router.post('/consultations/:id/revision', requireAuth, requireRole('DOCTOR', 'ADMIN'), revise)

export default router
```

NOTE: Do NOT register routes in app.ts — Task 7 handles all route registration.
