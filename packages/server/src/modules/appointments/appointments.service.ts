import { VisitType } from '@prisma/client'
import prisma from '@/core/prisma.js'
import { NotFoundError, ValidationError } from '@/core/errors.js'
import { getIO } from '@/core/socket.js'
import { createAuditLog } from '@/modules/audit/audit.service.js'
import type { BookAppointmentInput, CancelAppointmentInput, ListAppointmentsQuery } from './appointments.types.js'

export async function listAppointments(query: ListAppointmentsQuery) {
  const where: any = {}

  if (query.doctorId) where.doctorId = query.doctorId
  if (query.patientId) where.patientId = query.patientId
  if (query.status) where.status = query.status
  if (query.dateFrom || query.dateTo) {
    where.date = {}
    if (query.dateFrom) where.date.gte = new Date(query.dateFrom)
    if (query.dateTo) where.date.lte = new Date(query.dateTo)
  }

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: {
        patient: { include: { user: { select: { name: true, phone: true } } } },
        doctor: { include: { user: { select: { name: true } } } },
        consultation: { select: { id: true, status: true } },
      },
      orderBy: { date: 'desc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
    prisma.appointment.count({ where }),
  ])

  return { appointments, total, page: query.page, limit: query.limit }
}

export async function getAppointmentById(appointmentId: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      patient: { include: { user: { select: { id: true, name: true, email: true, phone: true } } } },
      doctor: { include: { user: { select: { name: true } }, schedules: true } },
      consultation: true,
    },
  })
  if (!appointment) throw new NotFoundError('Appointment')
  return appointment
}

export async function bookAppointment(data: BookAppointmentInput, userId: string) {
  const doctor = await prisma.doctor.findUnique({ where: { id: data.doctorId } })
  if (!doctor) throw new NotFoundError('Doctor')
  if (doctor.isOnVacation) throw new ValidationError('Doctor is on vacation')

  const patient = await prisma.patient.findUnique({ where: { id: data.patientId } })
  if (!patient) throw new NotFoundError('Patient')

  const appointment = await prisma.appointment.create({
    data: {
      patientId: data.patientId,
      doctorId: data.doctorId,
      date: new Date(data.date),
      duration: data.duration,
      type: data.type as VisitType,
      status: 'BOOKED',
      notes: data.notes,
    },
    include: {
      patient: { include: { user: { select: { name: true } } } },
      doctor: { include: { user: { select: { name: true } } } },
    },
  })

  await createAuditLog({ userId, entity: 'Appointment', entityId: appointment.id, action: 'BOOKED' })
  return appointment
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: string,
  userId: string,
  cancelReason?: string
) {
  const existing = await prisma.appointment.findUnique({ where: { id: appointmentId } })
  if (!existing) throw new NotFoundError('Appointment')

  const updateData: any = { status: status as any }
  if (status === 'CANCELLED') {
    updateData.cancelledAt = new Date()
    if (cancelReason) updateData.cancelReason = cancelReason
  }

  const appointment = await prisma.appointment.update({
    where: { id: appointmentId },
    data: updateData,
    include: {
      patient: { include: { user: { select: { id: true, name: true } } } },
      doctor: { include: { user: { select: { id: true, name: true } } } },
    },
  })

  await createAuditLog({
    userId,
    entity: 'Appointment',
    entityId: appointment.id,
    action: 'STATUS_CHANGED',
    changes: { status: { old: existing.status, new: status } },
  })

  // Emit WebSocket events for queue updates
  try {
    const io = getIO()
    const doctorId = appointment.doctorId

    io.to(`doctor:${doctorId}`).emit('queue:update', {
      appointmentId: appointment.id,
      patientName: appointment.patient.user.name,
      status: appointment.status,
      doctorId,
    })

    io.to('reception').emit('queue:update', {
      appointmentId: appointment.id,
      patientName: appointment.patient.user.name,
      status: appointment.status,
      doctorId,
    })

    if (status === 'CANCELLED') {
      io.to(`doctor:${doctorId}`).emit('appointment:cancelled', {
        appointmentId: appointment.id,
        patientName: appointment.patient.user.name,
      })
      io.to('reception').emit('appointment:cancelled', {
        appointmentId: appointment.id,
        patientName: appointment.patient.user.name,
      })
    }
  } catch {
    // Socket.IO not initialized — skip events
  }

  return appointment
}

export async function cancelAppointment(appointmentId: string, data: CancelAppointmentInput, userId: string) {
  return updateAppointmentStatus(appointmentId, 'CANCELLED', userId, data.reason)
}

export async function getDoctorQueue(doctorId: string) {
  return prisma.appointment.findMany({
    where: {
      doctorId,
      status: { in: ['CHECKED_IN', 'WAITING', 'IN_CONSULTATION'] },
      date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    },
    include: {
      patient: { include: { user: { select: { name: true } } } },
    },
    orderBy: { date: 'asc' },
  })
}
