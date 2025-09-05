'use client'

import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  FileText,
  Plus,
  Upload,
  Download,
  Eye,
  Trash2,
  Calendar,
  User,
  Folder,
  File,
  Image,
  FileSpreadsheet
} from 'lucide-react'

type DocumentType = "Agreement" | "Template" | "Hours Log" | "Credential" | "Evaluation" | "Other" | "All"

export default function PreceptorDocuments() {
  const user = useQuery(api.users.current)
  const documents = useQuery(api.documents.getAllDocuments) || []
  const documentStats = useQuery(api.documents.getDocumentStats)
  const deleteDocument = useMutation(api.documents.deleteDocument)
  
  const [selectedType, setSelectedType] = useState<DocumentType>('All')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  if (!user) {
    return <div>Loading...</div>
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />
      case 'docx':
      case 'doc':
        return <File className="h-5 w-5 text-blue-500" />
      case 'xlsx':
      case 'xls':
        return <FileSpreadsheet className="h-5 w-5 text-green-500" />
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <Image className="h-5 w-5 text-purple-500" aria-label="Image file" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Agreement':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'Template':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'Hours Log':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'Credential':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'Evaluation':
        return 'bg-orange-50 text-orange-700 border-orange-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const handleDeleteDocument = async (documentId: Id<"documents">) => {
    try {
      setDeletingId(documentId)
      await deleteDocument({ documentId })
      toast.success('Document deleted successfully')
    } catch (error) {
      toast.error('Failed to delete document')
      console.error('Error deleting document:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const documentTypes: DocumentType[] = ['All', 'Agreement', 'Template', 'Hours Log', 'Credential', 'Evaluation']

  const filteredDocuments = selectedType === 'All' 
    ? documents 
    : documents.filter(doc => doc.documentType === selectedType)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
            <p className="text-muted-foreground">
              Manage student agreements, templates, and practice documents
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Document Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentStats?.totalDocuments || 0}</div>
            <p className="text-xs text-muted-foreground">All files</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Student Documents</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documentStats?.studentDocuments || 0}
            </div>
            <p className="text-xs text-muted-foreground">Per student</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documentStats?.templates || 0}
            </div>
            <p className="text-xs text-muted-foreground">Reusable forms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatFileSize(documentStats?.totalSize || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Of {formatFileSize(documentStats?.storageLimit || 1073741824)} limit
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Document Filters */}
      <div className="flex flex-wrap gap-2">
        {documentTypes.map(type => (
          <Button
            key={type}
            variant={selectedType === type ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType(type)}
          >
            {type}
          </Button>
        ))}
      </div>

      {/* Documents List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {selectedType === 'All' ? 'All Documents' : `${selectedType} Documents`} 
            ({filteredDocuments.length})
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={documents.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Download All
            </Button>
            <Button variant="outline" size="sm">
              Sort by Date
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {filteredDocuments.map(document => (
            <Card key={document._id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getFileIcon(document.fileType)}
                    <div className="space-y-1">
                      <h3 className="font-semibold">{document.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{formatFileSize(document.fileSize)}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(document.uploadDate).toLocaleDateString()}
                        </span>
                        {document.studentName && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {document.studentName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={getTypeColor(document.documentType)}>
                      {document.documentType}
                    </Badge>
                    
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleDeleteDocument(document._id)}
                        disabled={deletingId === document._id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDocuments.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Documents</h3>
              <p className="text-muted-foreground text-center max-w-md mb-4">
                {selectedType === 'All' 
                  ? "You haven't uploaded any documents yet. Upload agreements, templates, and other files."
                  : `No ${selectedType.toLowerCase()} documents found.`
                }
              </p>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Document Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Document Templates</CardTitle>
          <CardDescription>Common documents you can use with students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" size="sm" className="h-auto flex-col gap-2 p-4">
              <FileText className="h-5 w-5" />
              <span className="text-xs">Preceptor Agreement</span>
            </Button>
            <Button variant="outline" size="sm" className="h-auto flex-col gap-2 p-4">
              <File className="h-5 w-5" />
              <span className="text-xs">Evaluation Form</span>
            </Button>
            <Button variant="outline" size="sm" className="h-auto flex-col gap-2 p-4">
              <FileSpreadsheet className="h-5 w-5" />
              <span className="text-xs">Hours Log</span>
            </Button>
            <Button variant="outline" size="sm" className="h-auto flex-col gap-2 p-4">
              <FileText className="h-5 w-5" />
              <span className="text-xs">Orientation Checklist</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}