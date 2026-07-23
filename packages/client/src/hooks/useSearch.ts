import { useMutation } from '@tanstack/react-query'
import api from '@/lib/axios'

export function useSearch() {
  return useMutation({
    mutationFn: (query: string) =>
      api.get('/search', { params: { q: query } }).then((r) => r.data),
  })
}
