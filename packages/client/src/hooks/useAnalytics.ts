import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/lib/axios'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => api.get('/analytics/dashboard').then((r) => r.data),
  })
}

export function useClinicalAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'clinical'],
    queryFn: () => api.get('/analytics/clinical').then((r) => r.data),
  })
}

export function useAppointmentTrends(days = 30) {
  return useQuery({
    queryKey: ['analytics', 'trends', days],
    queryFn: () => api.get('/analytics/trends', { params: { days } }).then((r) => r.data),
  })
}

export function useAIInsights() {
  return useMutation({
    mutationFn: () => api.get('/analytics/insights').then((r) => r.data),
  })
}
