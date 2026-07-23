import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { usePatients } from '@/hooks/usePatients'
import { useDoctors } from '@/hooks/useDoctors'
import { useBookAppointment } from '@/hooks/useAppointments'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'

export function Component() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: patients } = usePatients()
  const { data: doctors } = useDoctors()
  const bookAppointment = useBookAppointment()
  const { register, handleSubmit, setValue } = useForm()

  const onSubmit = (data: any) => {
    bookAppointment.mutate(data, {
      onSuccess: () => navigate('/appointments'),
    })
  }

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={() => navigate('/appointments')}>
        <ArrowLeft className="mr-2 size-4" /> {t('common.back')}
      </Button>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Book Appointment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Patient</Label>
              <Select onValueChange={(v) => setValue('patientId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients?.patients?.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>{p.user?.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Doctor</Label>
              <Select onValueChange={(v) => setValue('doctorId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors?.map((d: any) => (
                    <SelectItem key={d.id} value={d.id}>{d.user?.name} — {d.specialty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('common.date')}</Label>
              <Input type="date" {...register('date', { required: true })} />
            </div>

            <div className="space-y-2">
              <Label>{t('common.time')}</Label>
              <Input type="time" {...register('timeSlot', { required: true })} />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate('/appointments')}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={bookAppointment.isPending}>
                {bookAppointment.isPending ? 'Booking...' : t('common.save')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
