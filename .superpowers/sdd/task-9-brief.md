### Task 9: Documents Module

**Files:**
- Create: `packages/server/src/modules/documents/documents.schema.ts`
- Create: `packages/server/src/modules/documents/documents.service.ts`
- Create: `packages/server/src/modules/documents/documents.controller.ts`
- Create: `packages/server/src/modules/documents/documents.routes.ts`

- [ ] **Step 1: Create `packages/server/src/modules/documents/documents.schema.ts`**

```typescript
import { z } from 'zod'
import { DocumentCategory } from '@prisma/client'

const documentCategoryValues = Object.values(DocumentCategory) as [string, ...string[]]

export const createDocumentSchema = z.object({
  patientId: z.string(),
  category: z.enum(documentCategoryValues),
  fileName: z.string().min(1),
  fileUrl: z.string().url(),
  fileSize: z.number().int().nonnegative(),
  mimeType: z.string(),
})
```

- [ ] **Step 2: Create `packages/server/src/modules/documents/documents.service.ts`**

```typescript
import prisma from '@/core/prisma.js'
import { NotFoundError } from '@/core/errors.js'
import { createAuditLog } from '@/modules/audit/audit.service.js'
import type { z } from 'zod'
import type { createDocumentSchema } from './documents.schema.js'

type CreateDocumentInput = z.infer<typeof createDocumentSchema>

export async function listPatientDocuments(patientId: string) {
  const patient = await prisma.patient.findUnique({ where: { id: patientId } })
  if (!patient) throw new NotFoundError('Patient')

  return prisma.document.findMany({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createDocument(data: CreateDocumentInput, userId: string) {
  const patient = await prisma.patient.findUnique({ where: { id: data.patientId } })
  if (!patient) throw new NotFoundError('Patient')

  const document = await prisma.document.create({
    data: {
      patientId: data.patientId,
      uploadedBy: userId,
      category: data.category,
      fileName: data.fileName,
      fileUrl: data.fileUrl,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
    },
  })

  await createAuditLog({
    userId,
    entity: 'Document',
    entityId: document.id,
    action: 'UPLOADED',
    changes: { patientId: { old: null, new: data.patientId } },
  })

  return document
}

export async function deleteDocument(documentId: string, userId: string) {
  const existing = await prisma.document.findUnique({ where: { id: documentId } })
  if (!existing) throw new NotFoundError('Document')

  await prisma.document.delete({ where: { id: documentId } })

  await createAuditLog({
    userId,
    entity: 'Document',
    entityId: documentId,
    action: 'DELETED',
  })
}
```

- [ ] **Step 3: Create `packages/server/src/modules/documents/documents.controller.ts`**

```typescript
import type { Request, Response, NextFunction } from 'express'
import { listPatientDocuments, createDocument, deleteDocument } from './documents.service.js'
import { createDocumentSchema } from './documents.schema.js'

export async function listByPatient(req: Request, res: Response, next: NextFunction) {
  try {
    const documents = await listPatientDocuments(req.params.patientId)
    res.json(documents)
  } catch (err) { next(err) }
}

export async function upload(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createDocumentSchema.parse(req.body)
    const document = await createDocument(data, req.user!.userId)
    res.status(201).json(document)
  } catch (err) { next(err) }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteDocument(req.params.id, req.user!.userId)
    res.status(204).send()
  } catch (err) { next(err) }
}
```

- [ ] **Step 4: Create `packages/server/src/modules/documents/documents.routes.ts`**

```typescript
import { Router } from 'express'
import { requireAuth } from '@/core/clerk.js'
import { listByPatient, upload, remove } from './documents.controller.js'

const router = Router()

router.get('/patients/:patientId/documents', requireAuth, listByPatient)
router.post('/documents', requireAuth, upload)
router.delete('/documents/:id', requireAuth, remove)

export default router
```

NOTE: Do NOT register routes in app.ts — Task 7 handles all route registration.
