import { useTranslation } from 'react-i18next'
import { useDashboardStats, useAppointmentTrends } from '@/hooks/useAnalytics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, CalendarClock, Users, Activity } from 'lucide-react'

export function Component() {
  const { t } = useTranslation()
  const { data: stats } = useDashboardStats()
  const { data: trends } = useAppointmentTrends()

  const cards = [
    { label: 'Total Patients', value: stats?.totalPatients ?? 0, icon: Users },
    { label: 'Today\'s Appointments', value: stats?.todayAppointments ?? 0, icon: CalendarClock },
    { label: 'Active Doctors', value: stats?.activeDoctors ?? 0, icon: BarChart3 },
    { label: 'Completion Rate', value: stats?.completionRate ?? '0%', icon: Activity },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('nav.analytics')}</h1>
        <p className="text-sm text-muted-foreground">Clinic performance and trends</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{card.label}</CardTitle>
              <card.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appointment Trends</CardTitle>
        </CardHeader>
        <CardContent>
          {trends?.length > 0 ? (
            <div className="space-y-2">
              {trends.map((t: any, i: number) => (
                <div key={i} className="flex items-center justify-between border-b py-2 text-sm">
                  <span>{t.date}</span>
                  <span className="font-medium">{t.count} appointments</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No trend data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
