import type { Request, Response, NextFunction } from 'express'
import { listPatientDocuments, uploadDocument, deleteDocument } from './documents.service.js'

export async function listByPatient(req: Request, res: Response, next: NextFunction) {
  try {
    const documents = await listPatientDocuments(req.params.patientId as string)
    res.json(documents)
  } catch (err) { next(err) }
}

export async function uploadFile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' })
    }

    const { patientId, category } = req.body
    if (!patientId || !category) {
      return res.status(400).json({ error: 'patientId and category are required' })
    }

    const document = await uploadDocument({
      patientId,
      category,
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user!.userId,
    })

    res.status(201).json(document)
  } catch (err) { next(err) }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteDocument(req.params.id as string, req.user!.userId)
    res.status(204).send()
  } catch (err) { next(err) }
}
