import { useTranslation } from 'react-i18next'
import { useDashboardStats } from '@/hooks/useAnalytics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarClock, Users, Stethoscope, Activity } from 'lucide-react'

export function Component() {
  const { t } = useTranslation()
  const { data, isLoading } = useDashboardStats()

  const stats = [
    { label: 'Today\'s Appointments', value: data?.todayAppointments ?? 0, icon: CalendarClock },
    { label: 'Total Patients', value: data?.totalPatients ?? 0, icon: Users },
    { label: 'Active Doctors', value: data?.activeDoctors ?? 0, icon: Stethoscope },
    { label: 'Pending Queue', value: data?.pendingQueue ?? 0, icon: Activity },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('nav.dashboard')}</h1>
        <p className="text-sm text-muted-foreground">Overview of today's clinic activity</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {isLoading ? '...' : stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
