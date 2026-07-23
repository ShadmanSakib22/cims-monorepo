### Task 5: Appointments Module

**Files:**
- Create: `packages/server/src/modules/appointments/appointments.schema.ts`
- Create: `packages/server/src/modules/appointments/appointments.types.ts`
- Create: `packages/server/src/modules/appointments/appointments.service.ts`
- Create: `packages/server/src/modules/appointments/appointments.controller.ts`
- Create: `packages/server/src/modules/appointments/appointments.routes.ts`

- [ ] **Step 1: Create `packages/server/src/modules/appointments/appointments.schema.ts`**

```typescript
import { z } from 'zod'
import { AppointmentStatus, VisitType } from '@prisma/client'

const appointmentStatusValues = Object.values(AppointmentStatus) as [string, ...string[]]
const visitTypeValues = Object.values(VisitType) as [string, ...string[]]

export const bookAppointmentSchema = z.object({
  patientId: z.string(),
  doctorId: z.string(),
  date: z.string().datetime(),
  duration: z.number().int().positive().default(15),
  type: z.enum(visitTypeValues).default('REGULAR'),
  notes: z.string().optional(),
})

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(appointmentStatusValues),
})

export const cancelAppointmentSchema = z.object({
  reason: z.string().optional(),
})

export const listAppointmentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  doctorId: z.string().optional(),
  patientId: z.string().optional(),
  status: z.enum(appointmentStatusValues).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
})
```

- [ ] **Step 2: Create `packages/server/src/modules/appointments/appointments.types.ts`**

```typescript
import type { z } from 'zod'
import type { bookAppointmentSchema, updateAppointmentStatusSchema, cancelAppointmentSchema, listAppointmentsQuerySchema } from './appointments.schema.js'

export type BookAppointmentInput = z.infer<typeof bookAppointmentSchema>
export type UpdateAppointmentStatusInput = z.infer<typeof updateAppointmentStatusSchema>
export type CancelAppointmentInput = z.infer<typeof cancelAppointmentSchema>
export type ListAppointmentsQuery = z.infer<typeof listAppointmentsQuerySchema>
```

- [ ] **Step 3: Create `packages/server/src/modules/appointments/appointments.service.ts`**

The service includes WebSocket event emission for queue and notification updates.

```typescript
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
      type: data.type,
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
  userId: string
) {
  const existing = await prisma.appointment.findUnique({ where: { id: appointmentId } })
  if (!existing) throw new NotFoundError('Appointment')

  const appointment = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: status as any },
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
  return updateAppointmentStatus(appointmentId, 'CANCELLED', userId)
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
```

- [ ] **Step 4: Create `packages/server/src/modules/appointments/appointments.controller.ts`**

```typescript
import type { Request, Response, NextFunction } from 'express'
import {
  listAppointments,
  getAppointmentById,
  bookAppointment,
  updateAppointmentStatus as updateStatus,
  cancelAppointment as cancel,
  getDoctorQueue,
} from './appointments.service.js'
import {
  bookAppointmentSchema,
  updateAppointmentStatusSchema,
  cancelAppointmentSchema,
  listAppointmentsQuerySchema,
} from './appointments.schema.js'

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listAppointmentsQuerySchema.parse(req.query)
    const result = await listAppointments(query)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const appointment = await getAppointmentById(req.params.id)
    res.json(appointment)
  } catch (err) { next(err) }
}

export async function book(req: Request, res: Response, next: NextFunction) {
  try {
    const data = bookAppointmentSchema.parse(req.body)
    const appointment = await bookAppointment(data, req.user!.userId)
    res.status(201).json(appointment)
  } catch (err) { next(err) }
}

export async function updateAppointmentStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = updateAppointmentStatusSchema.parse(req.body)
    const appointment = await updateStatus(req.params.id, status, req.user!.userId)
    res.json(appointment)
  } catch (err) { next(err) }
}

export async function cancelAppointment(req: Request, res: Response, next: NextFunction) {
  try {
    const data = cancelAppointmentSchema.parse(req.body)
    const appointment = await cancel(req.params.id, data, req.user!.userId)
    res.json(appointment)
  } catch (err) { next(err) }
}

export async function doctorQueue(req: Request, res: Response, next: NextFunction) {
  try {
    const queue = await getDoctorQueue(req.params.doctorId)
    res.json(queue)
  } catch (err) { next(err) }
}
```

- [ ] **Step 5: Create `packages/server/src/modules/appointments/appointments.routes.ts`**

```typescript
import { Router } from 'express'
import { requireAuth, requireRole } from '@/core/clerk.js'
import {
  list, getById, book, updateAppointmentStatus, cancelAppointment, doctorQueue,
} from './appointments.controller.js'

const router = Router()

router.get('/appointments', requireAuth, list)
router.get('/appointments/:id', requireAuth, getById)
router.post('/appointments', requireAuth, book)
router.patch('/appointments/:id/status', requireAuth, updateAppointmentStatus)
router.post('/appointments/:id/cancel', requireAuth, cancelAppointment)
router.get('/doctors/:doctorId/queue', requireAuth, doctorQueue)

export default router
```

NOTE: Do NOT register routes in app.ts — Task 7 handles all route registration.
