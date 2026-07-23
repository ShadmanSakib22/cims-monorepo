import { DocumentCategory } from '@prisma/client'
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
      category: data.category as DocumentCategory,
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
