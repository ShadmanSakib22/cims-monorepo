import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import { toast } from 'sonner'

export function useDoctors() {
  return useQuery({
    queryKey: ['doctors'],
    queryFn: () => api.get('/doctors').then((r) => r.data),
  })
}

export function useDoctor(id: string) {
  return useQuery({
    queryKey: ['doctor', id],
    queryFn: () => api.get(`/doctors/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateSchedule(doctorId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post(`/doctors/${doctorId}/schedules`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['doctor', doctorId] })
      toast.success('Schedule added')
    },
  })
}

export function useDoctorQueue(doctorId: string) {
  return useQuery({
    queryKey: ['doctor-queue', doctorId],
    queryFn: () => api.get(`/doctors/${doctorId}/queue`).then((r) => r.data),
    enabled: !!doctorId,
    refetchInterval: 10000,
  })
}
