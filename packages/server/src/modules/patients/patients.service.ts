import prisma from '@/core/prisma.js'
import { NotFoundError } from '@/core/errors.js'
import { createAuditLog } from '@/modules/audit/audit.service.js'
import type { CreatePatientInput, UpdatePatientInput } from './patients.types.js'

export async function listPatients(page: number, limit: number, search?: string) {
  const where: any = {}

  if (search) {
    where.OR = [
      { user: { name: { contains: search, mode: 'insensitive' } } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
      { user: { phone: { contains: search, mode: 'insensitive' } } },
    ]
  }

  const [patients, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, role: true } },
      },
      orderBy: { id: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.patient.count({ where }),
  ])

  return { patients, total, page, limit }
}

export async function getPatientById(patientId: string) {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, role: true, isActive: true } },
      appointments: {
        orderBy: { date: 'desc' },
        take: 10,
        include: {
          doctor: { include: { user: { select: { name: true } } } },
        },
      },
      documents: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!patient) throw new NotFoundError('Patient')
  return patient
}

export async function createPatient(data: CreatePatientInput, userId: string) {
  const user = await prisma.user.create({
    data: {
      clerkId: `manual_${Date.now()}`,
      email: data.email,
      phone: data.phone,
      name: data.name,
      role: 'PATIENT',
    },
  })

  const patient = await prisma.patient.create({
    data: {
      userId: user.id,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      gender: data.gender,
      bloodGroup: data.bloodGroup,
      address: data.address,
      allergies: data.allergies,
      chronicConditions: data.chronicConditions,
      surgicalHistory: data.surgicalHistory,
      familyHistory: data.familyHistory,
    },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, role: true } },
    },
  })

  await createAuditLog({
    userId,
    entity: 'Patient',
    entityId: patient.id,
    action: 'CREATED',
    changes: { data: { old: null, new: data } },
  })

  return patient
}

export async function updatePatient(patientId: string, data: UpdatePatientInput, userId: string) {
  const existing = await prisma.patient.findUnique({ where: { id: patientId } })
  if (!existing) throw new NotFoundError('Patient')

  const patient = await prisma.patient.update({
    where: { id: patientId },
    data: {
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      gender: data.gender,
      bloodGroup: data.bloodGroup,
      address: data.address,
      allergies: data.allergies,
      chronicConditions: data.chronicConditions,
      surgicalHistory: data.surgicalHistory,
      familyHistory: data.familyHistory,
    },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, role: true } },
    },
  })

  if (data.name || data.phone) {
    await prisma.user.update({
      where: { id: existing.userId },
      data: { name: data.name, phone: data.phone },
    })
  }

  await createAuditLog({
    userId,
    entity: 'Patient',
    entityId: patient.id,
    action: 'UPDATED',
    changes: { data: { old: existing, new: data } },
  })

  return patient
}
