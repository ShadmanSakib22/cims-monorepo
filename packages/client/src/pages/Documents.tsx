import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { UploadDialog } from '@/components/Documents/UploadDialog'
import { usePatients } from '@/hooks/usePatients'
import { usePatientDocuments } from '@/hooks/useDocuments'
import { format } from 'date-fns'

export function Component() {
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const { data: patientsData } = usePatients({ limit: 100 })
  const { data: documents } = usePatientDocuments(selectedPatientId)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
          <p className="text-sm text-muted-foreground">Upload and manage patient documents</p>
        </div>
        <UploadDialog />
      </div>

      <div className="flex items-end gap-4">
        <div className="space-y-2">
          <Label>Patient</Label>
          <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
            <SelectTrigger className="w-72">
              <SelectValue placeholder="Select a patient to view documents" />
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!selectedPatientId ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Select a patient to view documents
                  </TableCell>
                </TableRow>
              ) : documents?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No results
                  </TableCell>
                </TableRow>
              ) : (
                documents?.map((doc: any) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="underline">
                        {doc.fileName}
                      </a>
                    </TableCell>
                    <TableCell>{doc.patientId}</TableCell>
                    <TableCell>{doc.category}</TableCell>
                    <TableCell>{format(new Date(doc.createdAt), 'PP')}</TableCell>
                    <TableCell>&mdash;</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
