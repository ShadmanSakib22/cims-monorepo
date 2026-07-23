import prisma from '@/core/prisma.js'
import { NotFoundError } from '@/core/errors.js'
import { createAuditLog } from '@/modules/audit/audit.service.js'
import type { CreateDoctorInput, UpdateDoctorInput, CreateScheduleInput, UpdateScheduleInput } from './doctors.types.js'

export async function listDoctors() {
  return prisma.doctor.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, role: true } },
      schedules: { where: { isActive: true }, orderBy: { dayOfWeek: 'asc' } },
    },
    orderBy: { id: 'asc' },
  })
}

export async function getDoctorById(doctorId: string) {
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, role: true, isActive: true } },
      schedules: { orderBy: { dayOfWeek: 'asc' } },
    },
  })
  if (!doctor) throw new NotFoundError('Doctor')
  return doctor
}

export async function createDoctor(data: CreateDoctorInput, userId: string) {
  const user = await prisma.user.create({
    data: {
      clerkId: `manual_${Date.now()}`,
      email: data.email,
      phone: data.phone,
      name: data.name,
      role: 'DOCTOR',
    },
  })

  const doctor = await prisma.doctor.create({
    data: {
      userId: user.id,
      specialty: data.specialty,
      qualifications: data.qualifications,
      experience: data.experience,
      consultationDuration: data.consultationDuration,
      maxAppointmentsPerDay: data.maxAppointmentsPerDay,
      photoUrl: data.photoUrl,
    },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, role: true } },
    },
  })

  await createAuditLog({ userId, entity: 'Doctor', entityId: doctor.id, action: 'CREATED' })
  return doctor
}

export async function updateDoctor(doctorId: string, data: UpdateDoctorInput, userId: string) {
  const existing = await prisma.doctor.findUnique({ where: { id: doctorId } })
  if (!existing) throw new NotFoundError('Doctor')

  const doctor = await prisma.doctor.update({
    where: { id: doctorId },
    data: {
      specialty: data.specialty,
      qualifications: data.qualifications,
      experience: data.experience,
      consultationDuration: data.consultationDuration,
      maxAppointmentsPerDay: data.maxAppointmentsPerDay,
      isOnVacation: data.isOnVacation,
      photoUrl: data.photoUrl,
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

  await createAuditLog({ userId, entity: 'Doctor', entityId: doctor.id, action: 'UPDATED' })
  return doctor
}

export async function getDoctorSchedules(doctorId: string) {
  const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } })
  if (!doctor) throw new NotFoundError('Doctor')

  return prisma.weeklySchedule.findMany({
    where: { doctorId },
    orderBy: { dayOfWeek: 'asc' },
  })
}

export async function createSchedule(doctorId: string, data: CreateScheduleInput, userId: string) {
  const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } })
  if (!doctor) throw new NotFoundError('Doctor')

  const schedule = await prisma.weeklySchedule.create({
    data: {
      doctorId,
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime,
    },
  })

  await createAuditLog({ userId, entity: 'WeeklySchedule', entityId: schedule.id, action: 'CREATED' })
  return schedule
}

export async function updateSchedule(scheduleId: string, data: UpdateScheduleInput, userId: string) {
  const existing = await prisma.weeklySchedule.findUnique({ where: { id: scheduleId } })
  if (!existing) throw new NotFoundError('Schedule')

  const schedule = await prisma.weeklySchedule.update({
    where: { id: scheduleId },
    data,
  })

  await createAuditLog({ userId, entity: 'WeeklySchedule', entityId: schedule.id, action: 'UPDATED' })
  return schedule
}

export async function deleteSchedule(scheduleId: string, userId: string) {
  const existing = await prisma.weeklySchedule.findUnique({ where: { id: scheduleId } })
  if (!existing) throw new NotFoundError('Schedule')

  await prisma.weeklySchedule.delete({ where: { id: scheduleId } })
  await createAuditLog({ userId, entity: 'WeeklySchedule', entityId: scheduleId, action: 'DELETED' })
}
