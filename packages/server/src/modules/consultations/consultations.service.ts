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
      vitals: (data.vitals ?? undefined) as any,
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
      vitals: original.vitals as any,
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
