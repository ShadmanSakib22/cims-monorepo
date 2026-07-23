import { useParams, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useDoctor } from '@/hooks/useDoctors'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Clock } from 'lucide-react'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function Component() {
  const { id } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: doctor, isLoading } = useDoctor(id!)

  if (isLoading) return <div className="text-muted-foreground">{t('common.loading')}</div>
  if (!doctor) return <div className="text-muted-foreground">{t('common.noResults')}</div>

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate('/doctors')}>
        <ArrowLeft className="mr-2 size-4" /> {t('common.back')}
      </Button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{doctor.user?.name}</h1>
          <p className="text-muted-foreground">{doctor.specialty}</p>
          <p className="text-sm text-muted-foreground">{doctor.qualifications}</p>
        </div>
        {doctor.isOnVacation && <Badge variant="destructive">On Vacation</Badge>}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Consultation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{doctor.consultationDuration} min</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Max/Day</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{doctor.maxAppointmentsPerDay}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Experience</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{doctor.experience || 0} yrs</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="size-5" /> Weekly Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          {doctor.schedules?.length === 0 ? (
            <p className="text-muted-foreground">No schedule set</p>
          ) : (
            <div className="space-y-2">
              {doctor.schedules?.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="font-medium">{DAY_NAMES[s.dayOfWeek]}</p>
                    <p className="text-sm text-muted-foreground">
                      {s.startTime} — {s.endTime}
                    </p>
                  </div>
                  <Badge variant="outline">{s.slotType === 'BOTH' ? 'In-person & Video' : s.slotType}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
