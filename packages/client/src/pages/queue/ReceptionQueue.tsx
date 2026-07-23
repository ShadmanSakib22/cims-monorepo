import { useTranslation } from 'react-i18next'
import { useAppointments } from '@/hooks/useAppointments'
import { useUpdateAppointmentStatus } from '@/hooks/useAppointments'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { UserCheck, UserX } from 'lucide-react'

export function Component() {
  const { t } = useTranslation()
  const { data, isLoading } = useAppointments({ status: 'SCHEDULED' })
  const updateStatus = useUpdateAppointmentStatus()

  const appointments = data?.appointments ?? data ?? []

  const handleCheckIn = (id: string) => {
    updateStatus.mutate({ id, status: 'CHECKED_IN' })
  }

  const handleCancel = (id: string) => {
    updateStatus.mutate({ id, status: 'CANCELLED' })
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('nav.queue')}</h1>
        <p className="text-sm text-muted-foreground">Reception desk — manage patient check-ins</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Waiting for Check-in</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>{t('common.time')}</TableHead>
                <TableHead>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">{t('common.loading')}</TableCell>
                </TableRow>
              )}
              {Array.isArray(appointments) && appointments.map((a: any, i: number) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{i + 1}</TableCell>
                  <TableCell>{a.patient?.user?.name}</TableCell>
                  <TableCell>{a.doctor?.user?.name}</TableCell>
                  <TableCell>{a.timeSlot || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="default" onClick={() => handleCheckIn(a.id)}>
                        <UserCheck className="mr-1 size-3" /> Check In
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleCancel(a.id)}>
                        <UserX className="mr-1 size-3" /> Cancel
                      </Button>
                    </div>
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
