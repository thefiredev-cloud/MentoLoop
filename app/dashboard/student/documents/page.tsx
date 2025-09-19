'use client'

import { RoleGuard } from '@/components/role-guard'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import type { Doc, Id } from '@/convex/_generated/dataModel'
import { useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

export default function StudentDocumentsPage() {
  return (
    <RoleGuard requiredRole="student">
      <StudentDocumentsContent />
    </RoleGuard>
  )
}

type DocumentType = 'Agreement' | 'Template' | 'Hours Log' | 'Credential' | 'Evaluation' | 'Other'

type DocumentRecord = Doc<'documents'>

function StudentDocumentsContent() {
  const docsData = useQuery(api.documents.getAllDocuments) as DocumentRecord[] | undefined
  const docs: DocumentRecord[] = docsData ?? []
  const upload = useMutation(api.documents.uploadDocument)
  const remove = useMutation(api.documents.deleteDocument)

  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [documentType, setDocumentType] = useState<DocumentType>('Credential')
  const [fileUrl, setFileUrl] = useState('')
  const [fileType, setFileType] = useState('application/pdf')
  const [fileSize, setFileSize] = useState('0')
  const [error, setError] = useState('')

  const requiredNames = useMemo(() => ['Resume/CV', 'Nursing License', 'CPR Certification'], [])
  const uploadedCount = docs.filter((document) => Boolean(document.fileUrl)).length
  const completionPercentage = requiredNames.length ? Math.min(Math.round((uploadedCount / requiredNames.length) * 100), 100) : 0

  const onUpload = async () => {
    setError('')
    if (!name.trim() || !fileUrl.trim()) {
      setError('Name and file URL are required')
      return
    }
    try {
      await upload({ name, documentType, fileUrl, fileType, fileSize: Number(fileSize) || 0 })
      setShowForm(false)
      setName('')
      setFileUrl('')
      toast.success('Document saved')
    } catch (error) {
      console.error('Failed to upload document', error)
      toast.error('Unable to save document. Please try again.')
    }
  }

  const onDelete = async (id: Id<'documents'>) => {
    try {
      await remove({ documentId: id })
      toast.success('Document removed')
    } catch (error) {
      console.error('Failed to delete document', error)
      toast.error('Unable to delete document right now')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
        <Button onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Close' : 'Upload Document'}
        </Button>
      </div>

      <Alert>
        <AlertDescription>
          Uploads currently accept shareable links (Google Drive, Dropbox, etc.). Make sure link privacy is set to allow MentoLoop staff to view your document. For secure uploads or questions, contact support any time.
        </AlertDescription>
      </Alert>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Document (URL)</CardTitle>
            <CardDescription>Provide a link to your document (PDF/JPG/PNG)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Nursing License" />
              </div>
              <div>
                <label className="text-sm">Type</label>
                <Select value={documentType} onValueChange={(value) => setDocumentType(value as DocumentType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Credential">Credential</SelectItem>
                    <SelectItem value="Agreement">Agreement</SelectItem>
                    <SelectItem value="Hours Log">Hours Log</SelectItem>
                    <SelectItem value="Evaluation">Evaluation</SelectItem>
                    <SelectItem value="Template">Template</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm">File URL</label>
              <Input value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm">File Type</label>
                <Input value={fileType} onChange={(e) => setFileType(e.target.value)} placeholder="application/pdf" />
              </div>
              <div>
                <label className="text-sm">File Size (bytes)</label>
                <Input value={fileSize} onChange={(e) => setFileSize(e.target.value)} placeholder="0" />
              </div>
            </div>
            {error && <div className="text-sm text-destructive">{error}</div>}
            <div className="flex justify-end">
              <Button onClick={onUpload}>Save</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Document Completion</CardTitle>
          <CardDescription>Upload required documents to complete your profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>
                {docs.length} uploaded{requiredNames.length > 0 && ` · Target: ${requiredNames.length}`}
              </span>
              <span className="font-medium">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {docs.length === 0 && <div className="text-sm text-muted-foreground">No documents uploaded yet.</div>}
            {docs.map((document) => (
              <div key={document._id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">
                    {document.name} <span className="text-xs text-muted-foreground">({document.documentType})</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(document.uploadDate).toLocaleDateString()} · {document.fileType || ''}
                  </div>
                </div>
                <div className="flex gap-2">
                  {document.fileUrl && (
                    <a href={document.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm underline">
                      View
                    </a>
                  )}
                  <button onClick={() => onDelete(document._id as Id<'documents'>)} className="text-sm text-destructive">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
