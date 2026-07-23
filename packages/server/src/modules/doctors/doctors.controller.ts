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
    const doctor = await getDoctorById(req.params.id as string)
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
    const doctor = await updateDoctor(req.params.id as string, data, req.user!.userId)
    res.json(doctor)
  } catch (err) { next(err) }
}

export async function listSchedules(req: Request, res: Response, next: NextFunction) {
  try {
    const schedules = await getDoctorSchedules(req.params.id as string)
    res.json(schedules)
  } catch (err) { next(err) }
}

export async function addSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createScheduleSchema.parse(req.body)
    const schedule = await createSchedule(req.params.id as string, data, req.user!.userId)
    res.status(201).json(schedule)
  } catch (err) { next(err) }
}

export async function editSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    const data = updateScheduleSchema.parse(req.body)
    const schedule = await updateSchedule(req.params.scheduleId as string, data, req.user!.userId)
    res.json(schedule)
  } catch (err) { next(err) }
}

export async function removeSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteSchedule(req.params.scheduleId as string, req.user!.userId)
    res.status(204).send()
  } catch (err) { next(err) }
}
