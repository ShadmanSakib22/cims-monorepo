### Task 4: Doctors Module

**Files:**
- Create: `packages/server/src/modules/doctors/doctors.schema.ts`
- Create: `packages/server/src/modules/doctors/doctors.types.ts`
- Create: `packages/server/src/modules/doctors/doctors.service.ts`
- Create: `packages/server/src/modules/doctors/doctors.controller.ts`
- Create: `packages/server/src/modules/doctors/doctors.routes.ts`

- [ ] **Step 1: Create `packages/server/src/modules/doctors/doctors.schema.ts`**

```typescript
import { z } from 'zod'

export const createDoctorSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().optional(),
  specialty: z.string().min(1),
  qualifications: z.string(),
  experience: z.number().int().nonnegative().optional(),
  consultationDuration: z.number().int().positive().default(15),
  maxAppointmentsPerDay: z.number().int().positive().default(30),
  photoUrl: z.string().url().optional(),
})

export const updateDoctorSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  phone: z.string().optional(),
  specialty: z.string().optional(),
  qualifications: z.string().optional(),
  experience: z.number().int().nonnegative().optional(),
  consultationDuration: z.number().int().positive().optional(),
  maxAppointmentsPerDay: z.number().int().positive().optional(),
  isOnVacation: z.boolean().optional(),
  photoUrl: z.string().url().nullable().optional(),
})

export const createScheduleSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
})

export const updateScheduleSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  isActive: z.boolean().optional(),
})
```

- [ ] **Step 2: Create `packages/server/src/modules/doctors/doctors.types.ts`**

```typescript
import type { z } from 'zod'
import type { createDoctorSchema, updateDoctorSchema, createScheduleSchema, updateScheduleSchema } from './doctors.schema.js'

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>
export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>
export type CreateScheduleInput = z.infer<typeof createScheduleSchema>
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>
```

- [ ] **Step 3: Create `packages/server/src/modules/doctors/doctors.service.ts`**

```typescript
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
```

- [ ] **Step 4: Create `packages/server/src/modules/doctors/doctors.controller.ts`**

```typescript
import type { Request, Response, NextFunction } from 'express'
import {
  listDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  getDoctorSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from './doctors.service.js'
import {
  createDoctorSchema,
  updateDoctorSchema,
  createScheduleSchema,
  updateScheduleSchema,
} from './doctors.schema.js'

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const doctors = await listDoctors()
    res.json(doctors)
  } catch (err) { next(err) }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const doctor = await getDoctorById(req.params.id)
    res.json(doctor)
  } catch (err) { next(err) }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createDoctorSchema.parse(req.body)
    const doctor = await createDoctor(data, req.user!.userId)
    res.status(201).json(doctor)
  } catch (err) { next(err) }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const data = updateDoctorSchema.parse(req.body)
    const doctor = await updateDoctor(req.params.id, data, req.user!.userId)
    res.json(doctor)
  } catch (err) { next(err) }
}

export async function listSchedules(req: Request, res: Response, next: NextFunction) {
  try {
    const schedules = await getDoctorSchedules(req.params.id)
    res.json(schedules)
  } catch (err) { next(err) }
}

export async function addSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createScheduleSchema.parse(req.body)
    const schedule = await createSchedule(req.params.id, data, req.user!.userId)
    res.status(201).json(schedule)
  } catch (err) { next(err) }
}

export async function editSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    const data = updateScheduleSchema.parse(req.body)
    const schedule = await updateSchedule(req.params.scheduleId, data, req.user!.userId)
    res.json(schedule)
  } catch (err) { next(err) }
}

export async function removeSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteSchedule(req.params.scheduleId, req.user!.userId)
    res.status(204).send()
  } catch (err) { next(err) }
}
```

- [ ] **Step 5: Create `packages/server/src/modules/doctors/doctors.routes.ts`**

```typescript
import { Router } from 'express'
import { requireAuth, requireRole } from '@/core/clerk.js'
import {
  list, getById, create, update,
  listSchedules, addSchedule, editSchedule, removeSchedule,
} from './doctors.controller.js'

const router = Router()

router.get('/doctors', requireAuth, list)
router.get('/doctors/:id', requireAuth, getById)
router.post('/doctors', requireAuth, requireRole('ADMIN'), create)
router.put('/doctors/:id', requireAuth, requireRole('ADMIN'), update)

router.get('/doctors/:id/schedules', requireAuth, listSchedules)
router.post('/doctors/:id/schedules', requireAuth, requireRole('ADMIN'), addSchedule)
router.put('/doctors/:id/schedules/:scheduleId', requireAuth, requireRole('ADMIN'), editSchedule)
router.delete('/doctors/:id/schedules/:scheduleId', requireAuth, requireRole('ADMIN'), removeSchedule)

export default router
```

NOTE: Do NOT register routes in app.ts — Task 7 handles all route registration.
