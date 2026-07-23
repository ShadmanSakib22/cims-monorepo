import { useEffect, useRef } from 'react'
import { io, type Socket } from 'socket.io-client'
import { useQueueStore } from '@/stores/queue'

interface SocketEvent {
  event: string
  handler: (...args: any[]) => void
}

export function useSocket(events?: SocketEvent[]) {
  const socketRef = useRef<Socket | null>(null)
  const updateEntry = useQueueStore((s) => s.updateEntry)
  const addEntry = useQueueStore((s) => s.addEntry)

  useEffect(() => {
    const token = window.Clerk?.session?.getToken
    if (!token) return

    token().then((t: string) => {
      const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000', {
        auth: { token: t },
      })

      socket.on('queue:update', (data) => {
        updateEntry(data.appointmentId, data.status)
      })

      socket.on('queue:new-patient', (data) => {
        addEntry(data)
      })

      socket.on('consultation:completed', (data) => {
        updateEntry(data.appointmentId, 'COMPLETED')
      })

      events?.forEach(({ event, handler }) => {
        socket.on(event, handler)
      })

      socketRef.current = socket
    })

    return () => {
      socketRef.current?.disconnect()
    }
  }, [])

  return socketRef
}
