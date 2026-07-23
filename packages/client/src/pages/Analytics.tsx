import { useTranslation } from 'react-i18next'
import { useDashboardStats, useAppointmentTrends, useAIInsights } from '@/hooks/useAnalytics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart3, CalendarClock, Users, Activity, Lightbulb, Loader2 } from 'lucide-react'

export function Component() {
  const { t } = useTranslation()
  const { data: stats } = useDashboardStats()
  const { data: trends } = useAppointmentTrends()
  const { data: insights, isLoading: insightsLoading } = useAIInsights()

  const cards = [
    { label: 'Total Patients', value: stats?.totalPatients ?? 0, icon: Users },
    { label: "Today's Appointments", value: stats?.appointmentsToday ?? 0, icon: CalendarClock },
    { label: 'Active Doctors', value: stats?.totalDoctors ?? 0, icon: BarChart3 },
    { label: 'Completion Rate', value: stats?.completionRate != null ? `${Math.round(stats.completionRate)}%` : '0%', icon: Activity },
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>AI Insights</CardTitle>
          <Lightbulb className="size-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          {insightsLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Generating insights...
            </div>
          ) : (
            <p className="text-sm">{insights?.insights || 'No insights available'}</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Appointment Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {trends?.byStatus ? (
              <div className="space-y-2">
                {Object.entries(trends.byStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between border-b py-2 text-sm">
                    <Badge variant="outline">{status}</Badge>
                    <span className="font-medium">{count as number}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 text-sm font-bold">
                  <span>Total</span>
                  <span>{trends.total}</span>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No trend data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Visit Type Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {trends?.byType ? (
              <div className="space-y-2">
                {Object.entries(trends.byType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between border-b py-2 text-sm">
                    <span>{type}</span>
                    <span className="font-medium">{count as number}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No trend data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
