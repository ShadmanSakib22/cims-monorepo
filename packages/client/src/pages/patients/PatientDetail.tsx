import { useParams, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { usePatient } from '@/hooks/usePatients'
import { usePatientDocuments } from '@/hooks/useDocuments'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UploadDialog } from '@/components/Documents/UploadDialog'
import { ArrowLeft, FileText, Calendar, Stethoscope } from 'lucide-react'
import { format } from 'date-fns'

export function Component() {
  const { id } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: patient, isLoading } = usePatient(id!)
  const { data: documents } = usePatientDocuments(id!)

  if (isLoading) return <div className="text-muted-foreground">{t('common.loading')}</div>
  if (!patient) return <div className="text-muted-foreground">{t('common.noResults')}</div>

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate('/patients')}>
        <ArrowLeft className="mr-2 size-4" /> {t('common.back')}
      </Button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{patient.user?.name}</h1>
          <p className="text-muted-foreground">{patient.user?.email}</p>
        </div>
        <Badge variant="outline">{patient.gender} · {patient.bloodGroup || 'N/A'}</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t('common.date')}</CardTitle>
            <Calendar className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{patient.appointments?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Total appointments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{documents?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Uploaded files</p>
              </div>
              <UploadDialog patientId={id} />
            </div>
            {documents && documents.length > 0 && (
              <div className="mt-4 space-y-1">
                {documents.map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between text-sm">
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="underline">
                      {doc.fileName}
                    </a>
                    <span className="text-muted-foreground">{doc.category}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Consultations</CardTitle>
            <Stethoscope className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{patient.consultations?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Completed visits</p>
          </CardContent>
        </Card>
      </div>

      {patient.allergies && (
        <Card>
          <CardHeader>
            <CardTitle>Allergies & Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{patient.allergies}</p>
            {patient.chronicConditions && (
              <p className="mt-2 text-muted-foreground">{patient.chronicConditions}</p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Appointment History</CardTitle>
        </CardHeader>
        <CardContent>
          {patient.appointments?.length === 0 ? (
            <p className="text-muted-foreground">{t('common.noResults')}</p>
          ) : (
            <div className="space-y-2">
              {patient.appointments?.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="font-medium">{a.doctor?.user?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(a.date), 'PPp')}
                    </p>
                  </div>
                  <Badge>{a.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
