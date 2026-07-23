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
