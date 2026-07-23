import { useState } from 'react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { usePatients } from '@/hooks/usePatients'
import { useUploadFile } from '@/hooks/useDocuments'
import { Upload, Loader2 } from 'lucide-react'

const CATEGORIES = [
  'PRESCRIPTION', 'LAB_REPORT', 'IMAGING', 'MEDICAL_CERTIFICATE',
  'REFERRAL', 'VACCINATION', 'INSURANCE', 'REGISTRATION', 'OTHER',
] as const

interface UploadDialogProps {
  patientId?: string
}

export function UploadDialog({ patientId }: UploadDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(patientId || '')
  const [category, setCategory] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const { data: patientsData } = usePatients({ limit: 100 })
  const uploadMutation = useUploadFile()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedPatient || !category || !file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('patientId', selectedPatient)
    formData.append('category', category)

    await uploadMutation.mutateAsync(formData)
    setOpen(false)
    setFile(null)
    setCategory('')
    if (!patientId) setSelectedPatient('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 size-4" /> Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Select a patient, category, and file to upload.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!patientId && (
            <div className="space-y-2">
              <Label>Patient</Label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent>
                  {patientsData?.patients?.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.user?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>File (PDF or image, max 5MB)</Label>
            <Input
              type="file"
              accept=".pdf,image/jpeg,image/png,image/webp"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!selectedPatient || !category || !file || uploadMutation.isPending}
          >
            {uploadMutation.isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Upload className="mr-2 size-4" />
            )}
            {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
