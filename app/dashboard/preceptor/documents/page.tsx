'use client'

import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import Link from 'next/link'

export default function PreceptorDocuments() {
  const user = useQuery(api.users.current)

  if (!user) {
    return <div>Loading...</div>
  }

  // Mock documents data - in real app would come from Convex
  const mockDocuments = [
    {
      _id: "doc_1",
      name: "Preceptor Agreement - Emily Rodriguez.pdf",
      type: "Agreement",
      size: "245 KB",
      uploadDate: "2025-01-15",
      studentName: "Emily Rodriguez",
      fileType: "pdf"
    },
    {
      _id: "doc_2",
      name: "Clinical Evaluation Template.docx", 
      type: "Template",
      size: "89 KB", 
      uploadDate: "2025-01-10",
      studentName: null,
      fileType: "docx"
    },
    {
      _id: "doc_3",
      name: "Student Hours Log - Marcus Chen.xlsx",
      type: "Hours Log", 
      size: "156 KB",
      uploadDate: "2025-01-08",
      studentName: "Marcus Chen",
      fileType: "xlsx"
    },
    {
      _id: "doc_4",
      name: "Practice License.pdf",
      type: "Credential",
      size: "1.2 MB",
      uploadDate: "2024-12-20",
      studentName: null,
      fileType: "pdf" 
    },
    {
      _id: "doc_5",
      name: "Orientation Checklist.pdf",
      type: "Template",
      size: "312 KB",
      uploadDate: "2024-12-15", 
      studentName: null,
      fileType: "pdf"
    }
  ]

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />
      case 'docx':
        return <File className="h-5 w-5 text-blue-500" />
      case 'xlsx':
        return <FileSpreadsheet className="h-5 w-5 text-green-500" />
      case 'jpg':
      case 'png':
        return <Image className="h-5 w-5 text-purple-500" />
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
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const documentTypes = ['All', 'Agreement', 'Template', 'Hours Log', 'Credential']
  const [selectedType, setSelectedType] = useState('All')

  const filteredDocuments = selectedType === 'All' 
    ? mockDocuments 
    : mockDocuments.filter(doc => doc.type === selectedType)

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
            <div className="text-2xl font-bold">{mockDocuments.length}</div>
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
              {mockDocuments.filter(doc => doc.studentName).length}
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
              {mockDocuments.filter(doc => doc.type === 'Template').length}
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
            <div className="text-2xl font-bold">2.1 MB</div>
            <p className="text-xs text-muted-foreground">Of 1 GB limit</p>
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
            <Button variant="outline" size="sm">
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
                        <span>{document.size}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {document.uploadDate}
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
                    <Badge variant="outline" className={getTypeColor(document.type)}>
                      {document.type}
                    </Badge>
                    
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
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