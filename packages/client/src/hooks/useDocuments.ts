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

export function useUploadFile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents'] })
      toast.success('Document uploaded')
    },
  })
}
