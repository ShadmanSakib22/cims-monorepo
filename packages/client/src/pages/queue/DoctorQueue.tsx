import { useParams, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useDoctorQueue } from '@/hooks/useDoctors'
import { useUpdateAppointmentStatus } from '@/hooks/useAppointments'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Play, CheckCircle } from 'lucide-react'

export function Component() {
  const { doctorId } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: queue, isLoading } = useDoctorQueue(doctorId!)
  const updateStatus = useUpdateAppointmentStatus()

  const entries = queue?.entries ?? queue ?? []

  const statusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      WAITING: 'outline',
      IN_CONSULTATION: 'default',
      COMPLETED: 'secondary',
    }
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>
  }

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={() => navigate('/queue')}>
        <ArrowLeft className="mr-2 size-4" /> {t('common.back')}
      </Button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Doctor Queue</h1>
        <p className="text-sm text-muted-foreground">Manage your patient queue</p>
      </div>

      <div className="grid gap-4">
        {isLoading && <div className="text-muted-foreground">{t('common.loading')}</div>}
        {Array.isArray(entries) && entries.map((entry: any) => (
          <Card key={entry.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">{entry.patientName}</CardTitle>
                <p className="text-sm text-muted-foreground">Queue #{entry.queueNumber}</p>
              </div>
              {statusBadge(entry.status)}
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {entry.status === 'WAITING' && (
                  <Button size="sm" onClick={() => updateStatus.mutate({ id: entry.appointmentId, status: 'IN_CONSULTATION' })}>
                    <Play className="mr-1 size-3" /> Start Consultation
                  </Button>
                )}
                {entry.status === 'IN_CONSULTATION' && (
                  <Button size="sm" onClick={() => updateStatus.mutate({ id: entry.appointmentId, status: 'COMPLETED' })}>
                    <CheckCircle className="mr-1 size-3" /> Complete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {Array.isArray(entries) && entries.length === 0 && (
          <div className="text-center text-muted-foreground py-8">{t('common.noResults')}</div>
        )}
      </div>
    </div>
  )
}
