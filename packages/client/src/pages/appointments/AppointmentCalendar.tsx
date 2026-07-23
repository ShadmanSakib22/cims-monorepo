import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useAppointments } from '@/hooks/useAppointments'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Plus, Calendar } from 'lucide-react'
import { format } from 'date-fns'

export function Component() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data, isLoading } = useAppointments()

  const appointments = data?.appointments ?? data ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('nav.appointments')}</h1>
          <p className="text-sm text-muted-foreground">Manage and schedule patient appointments</p>
        </div>
        <Button onClick={() => navigate('/appointments/book')}>
          <Plus className="mr-2 size-4" />
          Book Appointment
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="size-5" /> Upcoming Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>{t('common.date')}</TableHead>
                <TableHead>{t('common.time')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">{t('common.loading')}</TableCell>
                </TableRow>
              )}
              {Array.isArray(appointments) && appointments.map((a: any) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.patient?.user?.name}</TableCell>
                  <TableCell>{a.doctor?.user?.name}</TableCell>
                  <TableCell>{a.date ? format(new Date(a.date), 'PP') : '-'}</TableCell>
                  <TableCell>{a.timeSlot || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={a.status === 'SCHEDULED' ? 'default' : a.status === 'COMPLETED' ? 'secondary' : 'destructive'}>
                      {a.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {Array.isArray(appointments) && appointments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">{t('common.noResults')}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
