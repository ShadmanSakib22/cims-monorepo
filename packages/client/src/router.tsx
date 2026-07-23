import { createBrowserRouter } from 'react-router'
import PublicLayout from '@/components/Layout/PublicLayout'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import ProtectedRoute from '@/components/Layout/ProtectedRoute'
import ErrorPage from '@/components/Layout/ErrorPage'

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, lazy: () => import('@/pages/Index') },
      { path: '/login', lazy: () => import('@/pages/Login') },
      { path: '/signup', lazy: () => import('@/pages/SignUp') },
      { path: '/forgot-password', lazy: () => import('@/pages/ForgotPassword') },
    ],
  },
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      { path: '/dashboard', lazy: () => import('@/pages/Dashboard') },
      { path: '/patients', lazy: () => import('@/pages/patients/PatientList') },
      { path: '/patients/:id', lazy: () => import('@/pages/patients/PatientDetail') },
      { path: '/doctors', lazy: () => import('@/pages/doctors/DoctorList') },
      { path: '/doctors/:id', lazy: () => import('@/pages/doctors/DoctorDetail') },
      { path: '/appointments', lazy: () => import('@/pages/appointments/AppointmentCalendar') },
      { path: '/appointments/book', lazy: () => import('@/pages/appointments/BookAppointment') },
      { path: '/queue', lazy: () => import('@/pages/queue/ReceptionQueue') },
      { path: '/queue/doctor/:doctorId', lazy: () => import('@/pages/queue/DoctorQueue') },
      { path: '/consultations/:id', lazy: () => import('@/pages/consultations/ConsultationEditor') },
      { path: '/documents', lazy: () => import('@/pages/Documents') },
      { path: '/analytics', lazy: () => import('@/pages/Analytics') },
      { path: '/settings', lazy: () => import('@/pages/Settings') },
      { path: '/search', lazy: () => import('@/pages/Search') },
    ],
  },
])
