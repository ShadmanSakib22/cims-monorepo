import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useDoctors } from '@/hooks/useDoctors'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Eye, Plus } from 'lucide-react'

export function Component() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: doctors, isLoading } = useDoctors()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{t('nav.doctors')}</h1>
        <Button onClick={() => navigate('/doctors/new')}>
          <Plus className="mr-2 size-4" /> {t('common.create')}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('common.name')}</TableHead>
              <TableHead>Specialty</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">{t('common.loading')}</TableCell>
              </TableRow>
            )}
            {doctors?.map((d: any) => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">{d.user?.name}</TableCell>
                <TableCell>{d.specialty}</TableCell>
                <TableCell>
                  {d.isOnVacation ? (
                    <Badge variant="destructive">On Vacation</Badge>
                  ) : (
                    <div className="flex gap-1">
                      {d.schedules?.slice(0, 3).map((s: any) => (
                        <Badge key={s.id} variant="outline">
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][s.dayOfWeek]}
                        </Badge>
                      ))}
                      {d.schedules?.length > 3 && <Badge variant="outline">+{d.schedules.length - 3}</Badge>}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => navigate(`/doctors/${d.id}`)}>
                    <Eye className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
