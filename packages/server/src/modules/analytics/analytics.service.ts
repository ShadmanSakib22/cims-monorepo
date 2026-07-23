import prisma from '@/core/prisma.js'

export async function getDashboardStats() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [
    appointmentsToday,
    completedToday,
    cancelledToday,
    noShowToday,
    totalPatients,
    totalDoctors,
    avgWaitTime,
  ] = await Promise.all([
    prisma.appointment.count({ where: { date: { gte: today, lt: tomorrow } } }),
    prisma.appointment.count({ where: { date: { gte: today, lt: tomorrow }, status: 'COMPLETED' } }),
    prisma.appointment.count({ where: { date: { gte: today, lt: tomorrow }, status: 'CANCELLED' } }),
    prisma.appointment.count({ where: { date: { gte: today, lt: tomorrow }, status: 'NO_SHOW' } }),
    prisma.patient.count(),
    prisma.doctor.count(),
    prisma.appointment.aggregate({
      _avg: { duration: true },
      where: { date: { gte: today, lt: tomorrow } },
    }),
  ])

  return {
    appointmentsToday,
    completedToday,
    cancelledToday,
    noShowToday,
    totalPatients,
    totalDoctors,
    averageConsultationDuration: avgWaitTime._avg.duration ?? 0,
    completionRate: appointmentsToday > 0 ? (completedToday / appointmentsToday) * 100 : 0,
  }
}

export async function getDoctorAnalytics(doctorId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [totalAppointments, completedAppointments, cancelledAppointments] = await Promise.all([
    prisma.appointment.count({ where: { doctorId } }),
    prisma.appointment.count({ where: { doctorId, status: 'COMPLETED' } }),
    prisma.appointment.count({ where: { doctorId, status: 'CANCELLED' } }),
  ])

  return {
    totalAppointments,
    completedAppointments,
    cancelledAppointments,
    cancellationRate: totalAppointments > 0 ? (cancelledAppointments / totalAppointments) * 100 : 0,
  }
}

export async function getClinicalAnalytics() {
  const [diagnoses, medicines] = await Promise.all([
    prisma.consultation.groupBy({
      by: ['diagnosis'],
      _count: { diagnosis: true },
      where: { diagnosis: { not: null } },
      orderBy: { _count: { diagnosis: 'desc' } },
      take: 10,
    }),
    prisma.prescription.groupBy({
      by: ['medicineName'],
      _count: { medicineName: true },
      orderBy: { _count: { medicineName: 'desc' } },
      take: 10,
    }),
  ])

  return {
    topDiagnoses: diagnoses.map((d) => ({ diagnosis: d.diagnosis, count: d._count.diagnosis })),
    topMedicines: medicines.map((m) => ({ medicine: m.medicineName, count: m._count.medicineName })),
  }
}

export async function getAppointmentTrends(days: number = 30) {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const appointments = await prisma.appointment.findMany({
    where: { date: { gte: since } },
    select: { date: true, status: true, type: true },
    orderBy: { date: 'asc' },
  })

  return {
    total: appointments.length,
    byStatus: appointments.reduce((acc: Record<string, number>, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1
      return acc
    }, {}),
    byType: appointments.reduce((acc: Record<string, number>, a) => {
      acc[a.type] = (acc[a.type] || 0) + 1
      return acc
    }, {}),
  }
}
