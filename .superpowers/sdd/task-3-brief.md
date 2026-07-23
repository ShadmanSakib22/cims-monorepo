### Task 3: Patients Module

**Files:**
- Create: `packages/server/src/modules/patients/patients.schema.ts`
- Create: `packages/server/src/modules/patients/patients.types.ts`
- Create: `packages/server/src/modules/patients/patients.service.ts`
- Create: `packages/server/src/modules/patients/patients.controller.ts`
- Create: `packages/server/src/modules/patients/patients.routes.ts`

- [ ] **Step 1: Create `packages/server/src/modules/patients/patients.schema.ts`**

```typescript
import { z } from 'zod'

export const createPatientSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  bloodGroup: z.string().optional(),
  address: z.string().optional(),
  allergies: z.string().optional(),
  chronicConditions: z.string().optional(),
  surgicalHistory: z.string().optional(),
  familyHistory: z.string().optional(),
})

export const updatePatientSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  bloodGroup: z.string().optional(),
  address: z.string().optional(),
  allergies: z.string().optional(),
  chronicConditions: z.string().optional(),
  surgicalHistory: z.string().optional(),
  familyHistory: z.string().optional(),
})

export const listPatientsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
})
```

- [ ] **Step 2: Create `packages/server/src/modules/patients/patients.types.ts`**

```typescript
import type { z } from 'zod'
import type { createPatientSchema, updatePatientSchema } from './patients.schema.js'

export type CreatePatientInput = z.infer<typeof createPatientSchema>
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>
```

- [ ] **Step 3: Create `packages/server/src/modules/patients/patients.service.ts`**

```typescript
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
    changes: { old: existing, new: data },
  })

  return patient
}
```

- [ ] **Step 4: Create `packages/server/src/modules/patients/patients.controller.ts`**

```typescript
import type { Request, Response, NextFunction } from 'express'
import {
  listPatients,
  getPatientById,
  createPatient,
  updatePatient,
} from './patients.service.js'
import { createPatientSchema, updatePatientSchema, listPatientsQuerySchema } from './patients.schema.js'

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listPatientsQuerySchema.parse(req.query)
    const result = await listPatients(query.page, query.limit, query.search)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const patient = await getPatientById(req.params.id)
    res.json(patient)
  } catch (err) {
    next(err)
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createPatientSchema.parse(req.body)
    const patient = await createPatient(data, req.user!.userId)
    res.status(201).json(patient)
  } catch (err) {
    next(err)
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const data = updatePatientSchema.parse(req.body)
    const patient = await updatePatient(req.params.id, data, req.user!.userId)
    res.json(patient)
  } catch (err) {
    next(err)
  }
}
```

- [ ] **Step 5: Create `packages/server/src/modules/patients/patients.routes.ts`**

```typescript
import { Router } from 'express'
import { requireAuth, requireRole } from '@/core/clerk.js'
import { list, getById, create, update } from './patients.controller.js'

const router = Router()

router.get('/patients', requireAuth, list)
router.get('/patients/:id', requireAuth, getById)
router.post('/patients', requireAuth, requireRole('ADMIN', 'RECEPTIONIST'), create)
router.put('/patients/:id', requireAuth, requireRole('ADMIN', 'RECEPTIONIST'), update)

export default router
```

NOTE: Do NOT register routes in app.ts — Task 7 handles all route registration.
