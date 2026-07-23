import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import { toast } from 'sonner'

export function usePatients(params?: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: ['patients', params],
    queryFn: () => api.get('/patients', { params }).then((r) => r.data),
  })
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: () => api.get(`/patients/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreatePatient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/patients', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patients'] })
      toast.success('Patient created')
    },
    onError: () => toast.error('Failed to create patient'),
  })
}

export function useUpdatePatient(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.put(`/patients/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patients'] })
      qc.invalidateQueries({ queryKey: ['patient', id] })
      toast.success('Patient updated')
    },
    onError: () => toast.error('Failed to update patient'),
  })
}
