import type { Request, Response, NextFunction } from 'express'
import { listPatientDocuments, createDocument, deleteDocument } from './documents.service.js'
import { createDocumentSchema } from './documents.schema.js'

export async function listByPatient(req: Request, res: Response, next: NextFunction) {
  try {
    const documents = await listPatientDocuments(req.params.patientId as string)
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
    await deleteDocument(req.params.id as string, req.user!.userId)
    res.status(204).send()
  } catch (err) { next(err) }
}
