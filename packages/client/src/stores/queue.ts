import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface QueueEntry {
  id: string
  patientName: string
  doctorName: string
  status: string
  queueNumber: number | null
  appointmentId: string
  doctorId: string
}

interface QueueState {
  entries: QueueEntry[]
  setEntries: (entries: QueueEntry[]) => void
  updateEntry: (appointmentId: string, status: string) => void
  addEntry: (entry: QueueEntry) => void
  removeEntry: (appointmentId: string) => void
}

export const useQueueStore = create<QueueState>()(
  persist(
    (set) => ({
      entries: [],
      setEntries: (entries) => set({ entries }),
      updateEntry: (appointmentId, status) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.appointmentId === appointmentId ? { ...e, status } : e
          ),
        })),
      addEntry: (entry) =>
        set((state) => ({ entries: [...state.entries, entry] })),
      removeEntry: (appointmentId) =>
        set((state) => ({
          entries: state.entries.filter((e) => e.appointmentId !== appointmentId),
        })),
    }),
    { name: 'queue-storage' }
  )
)
