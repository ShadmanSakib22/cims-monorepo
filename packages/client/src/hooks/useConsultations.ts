import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import { toast } from 'sonner'

export function useConsultation(id: string) {
  return useQuery({
    queryKey: ['consultation', id],
    queryFn: () => api.get(`/consultations/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useUpdateConsultation(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.put(`/consultations/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['consultation', id] })
      toast.success('Consultation updated')
    },
  })
}

export function useFinalizeConsultation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.post(`/consultations/${id}/finalize`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['consultation'] })
      qc.invalidateQueries({ queryKey: ['doctor-queue'] })
      toast.success('Consultation finalized')
    },
  })
}

export function useCreateRevision(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { reason: string }) =>
      api.post(`/consultations/${id}/revision`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['consultation', id] })
      toast.success('Revision created')
    },
  })
}

export function useAddPrescription(consultationId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) =>
      api.post(`/consultations/${consultationId}/prescriptions`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['consultation', consultationId] })
      toast.success('Prescription added')
    },
  })
}
