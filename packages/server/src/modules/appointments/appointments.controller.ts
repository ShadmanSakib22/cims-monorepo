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
    const appointment = await getAppointmentById(req.params.id as string)
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
    const appointment = await updateStatus(req.params.id as string, status, req.user!.userId)
    res.json(appointment)
  } catch (err) { next(err) }
}

export async function cancelAppointment(req: Request, res: Response, next: NextFunction) {
  try {
    const data = cancelAppointmentSchema.parse(req.body)
    const appointment = await cancel(req.params.id as string, data, req.user!.userId)
    res.json(appointment)
  } catch (err) { next(err) }
}

export async function doctorQueue(req: Request, res: Response, next: NextFunction) {
  try {
    const queue = await getDoctorQueue(req.params.doctorId as string)
    res.json(queue)
  } catch (err) { next(err) }
}
