import type { Request, Response, NextFunction } from 'express'
import {
  getConsultationById,
  updateConsultation,
  addPrescription,
  removePrescription,
  finalizeConsultation,
  createRevision,
} from './consultations.service.js'
import {
  updateConsultationSchema,
  addPrescriptionSchema,
  finalizeConsultationSchema,
  createRevisionSchema,
} from './consultations.schema.js'

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const consultation = await getConsultationById(req.params.id as string as string)
    res.json(consultation)
  } catch (err) { next(err) }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const data = updateConsultationSchema.parse(req.body)
    const consultation = await updateConsultation(req.params.id as string, data, req.user!.userId)
    res.json(consultation)
  } catch (err) { next(err) }
}

export async function addPrescriptionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data = addPrescriptionSchema.parse(req.body)
    const prescription = await addPrescription(req.params.id as string, data, req.user!.userId)
    res.status(201).json(prescription)
  } catch (err) { next(err) }
}

export async function removePrescriptionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await removePrescription(req.params.prescriptionId as string, req.user!.userId)
    res.status(204).send()
  } catch (err) { next(err) }
}

export async function finalize(req: Request, res: Response, next: NextFunction) {
  try {
    const data = finalizeConsultationSchema.parse(req.body)
    const consultation = await finalizeConsultation(req.params.id as string, data, req.user!.userId)
    res.json(consultation)
  } catch (err) { next(err) }
}

export async function revise(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createRevisionSchema.parse(req.body)
    const revision = await createRevision(req.params.id as string, data, req.user!.userId)
    res.status(201).json(revision)
  } catch (err) { next(err) }
}
