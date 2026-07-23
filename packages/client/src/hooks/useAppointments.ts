import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import { toast } from 'sonner'

export function useAppointments(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['appointments', params],
    queryFn: () => api.get('/appointments', { params }).then((r) => r.data),
  })
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: ['appointment', id],
    queryFn: () => api.get(`/appointments/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useBookAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/appointments', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] })
      toast.success('Appointment booked')
    },
    onError: () => toast.error('Failed to book appointment'),
  })
}

export function useUpdateAppointmentStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/appointments/${id}/status`, { status }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] })
      qc.invalidateQueries({ queryKey: ['doctor-queue'] })
    },
  })
}
