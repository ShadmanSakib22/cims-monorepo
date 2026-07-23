import { useParams, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useConsultation, useUpdateConsultation, useFinalizeConsultation, useAddPrescription } from '@/hooks/useConsultations'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { ChangeEvent } from 'react'
import { ArrowLeft, Save, CheckCircle, Plus } from 'lucide-react'
import { useState } from 'react'

export function Component() {
  const { id } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: consultation, isLoading } = useConsultation(id!)
  const updateConsultation = useUpdateConsultation(id!)
  const finalizeConsultation = useFinalizeConsultation()
  const addPrescription = useAddPrescription(id!)

  const [symptoms, setSymptoms] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [treatment, setTreatment] = useState('')
  const [medication, setMedication] = useState('')
  const [dosage, setDosage] = useState('')
  const [duration, setDuration] = useState('')

  if (isLoading) return <div className="text-muted-foreground">{t('common.loading')}</div>
  if (!consultation) return <div className="text-muted-foreground">{t('common.noResults')}</div>

  const handleSave = () => {
    updateConsultation.mutate({ symptoms, diagnosis, treatmentPlan: treatment })
  }

  const handleAddPrescription = () => {
    if (!medication || !dosage) return
    addPrescription.mutate({ medication, dosage, duration })
    setMedication('')
    setDosage('')
    setDuration('')
  }

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 size-4" /> {t('common.back')}
      </Button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Consultation</h1>
        <p className="text-sm text-muted-foreground">
          {consultation.appointment?.patient?.user?.name} with Dr. {consultation.appointment?.doctor?.user?.name}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Clinical Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Symptoms</Label>
              <Textarea
                rows={3}
                value={symptoms}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setSymptoms(e.target.value)}
                placeholder="Describe symptoms..."
              />
            </div>
            <div className="space-y-2">
              <Label>Diagnosis</Label>
              <Textarea
                rows={3}
                value={diagnosis}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDiagnosis(e.target.value)}
                placeholder="Enter diagnosis..."
              />
            </div>
            <div className="space-y-2">
              <Label>Treatment Plan</Label>
              <Textarea
                rows={3}
                value={treatment}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setTreatment(e.target.value)}
                placeholder="Outline treatment plan..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prescriptions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Medication</Label>
                <Input value={medication} onChange={(e) => setMedication(e.target.value)} placeholder="Name" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Dosage</Label>
                <Input value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="e.g. 500mg" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Duration</Label>
                <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 7 days" />
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={handleAddPrescription} className="w-full">
              <Plus className="mr-1 size-3" /> Add Prescription
            </Button>

            <div className="space-y-1">
              {consultation.prescriptions?.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                  <div>
                    <span className="font-medium">{p.medication}</span>
                    <span className="text-muted-foreground"> — {p.dosage}</span>
                  </div>
                  <Badge variant="outline">{p.duration}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={updateConsultation.isPending}>
          <Save className="mr-2 size-4" /> Save Draft
        </Button>
        <Button
          variant="default"
          onClick={() => finalizeConsultation.mutate(id!)}
          disabled={finalizeConsultation.isPending}
        >
          <CheckCircle className="mr-2 size-4" /> Finalize
        </Button>
      </div>
    </div>
  )
}
