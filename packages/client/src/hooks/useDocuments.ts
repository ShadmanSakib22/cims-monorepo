import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import { toast } from 'sonner'

export function usePatientDocuments(patientId: string) {
  return useQuery({
    queryKey: ['documents', patientId],
    queryFn: () => api.get(`/patients/${patientId}/documents`).then((r) => r.data),
    enabled: !!patientId,
  })
}

export function useUploadDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/documents', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents'] })
      toast.success('Document uploaded')
    },
  })
}
