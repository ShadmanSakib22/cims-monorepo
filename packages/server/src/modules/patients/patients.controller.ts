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
    const patient = await getPatientById(req.params.id as string)
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
    const patient = await updatePatient(req.params.id as string, data, req.user!.userId)
    res.json(patient)
  } catch (err) {
    next(err)
  }
}
