'use client'

import { RoleGuard } from '@/components/role-guard'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  FileText, 
  Download, 
  Upload, 
  Eye, 
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  Plus,
  Search,
  FileSignature,
  FileLock
} from 'lucide-react'
import { useState } from 'react'

export default function EnterpriseAgreementsPage() {
  return (
    <RoleGuard requiredRole="enterprise">
      <EnterpriseAgreementsContent />
    </RoleGuard>
  )
}

function EnterpriseAgreementsContent() {
  const [searchTerm, setSearchTerm] = useState('')

  const agreements = [
    {
      id: 1,
      name: 'Master Service Agreement',
      type: 'MSA',
      status: 'active',
      signedDate: '2024-01-01',
      expiryDate: '2025-01-01',
      parties: ['Healthcare University', 'MentoLoop'],
      version: 'v2.1'
    },
    {
      id: 2,
      name: 'Clinical Affiliation Agreement - Regional Medical Center',
      type: 'CAA',
      status: 'active',
      signedDate: '2023-11-15',
      expiryDate: '2024-11-15',
      parties: ['Healthcare University', 'Regional Medical Center'],
      version: 'v1.0'
    },
    {
      id: 3,
      name: 'Student Data Privacy Agreement',
      type: 'DPA',
      status: 'active',
      signedDate: '2024-01-01',
      expiryDate: '2025-01-01',
      parties: ['Healthcare University', 'MentoLoop'],
      version: 'v1.3'
    },
    {
      id: 4,
      name: 'Clinical Affiliation Agreement - Community Hospital',
      type: 'CAA',
      status: 'pending',
      signedDate: null,
      expiryDate: null,
      parties: ['Healthcare University', 'Community Hospital'],
      version: 'Draft'
    },
    {
      id: 5,
      name: 'HIPAA Business Associate Agreement',
      type: 'BAA',
      status: 'active',
      signedDate: '2024-01-01',
      expiryDate: '2025-01-01',
      parties: ['Healthcare University', 'MentoLoop'],
      version: 'v2.0'
    }
  ]

  const templates = [
    {
      name: 'Clinical Affiliation Agreement Template',
      description: 'Standard template for new clinical partnerships',
      lastUpdated: '2024-01-15'
    },
    {
      name: 'Preceptor Agreement Template',
      description: 'Individual preceptor onboarding agreement',
      lastUpdated: '2024-01-10'
    },
    {
      name: 'Student Placement Agreement',
      description: 'Agreement for individual student placements',
      lastUpdated: '2023-12-20'
    }
  ]

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return (
          <Badge variant="secondary" className="text-green-600">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Active
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="outline" className="text-orange-600">
            <Clock className="mr-1 h-3 w-3" />
            Pending Signature
          </Badge>
        )
      case 'expired':
        return (
          <Badge variant="destructive">
            <AlertCircle className="mr-1 h-3 w-3" />
            Expired
          </Badge>
        )
      default:
        return null
    }
  }

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'MSA':
        return <FileLock className="h-5 w-5 text-blue-600" />
      case 'CAA':
        return <FileSignature className="h-5 w-5 text-green-600" />
      case 'DPA':
        return <Shield className="h-5 w-5 text-purple-600" />
      case 'BAA':
        return <Shield className="h-5 w-5 text-orange-600" />
      default:
        return <FileText className="h-5 w-5 text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Legal Agreements</h1>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload Agreement
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agreements</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agreements.length}</div>
            <p className="text-xs text-muted-foreground">
              {agreements.filter(a => a.status === 'active').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Within 60 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              Awaiting signature
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
            <p className="text-xs text-muted-foreground">
              Fully compliant
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Agreements */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Active Agreements</CardTitle>
              <CardDescription>
                Manage your legal agreements and contracts
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search agreements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-[200px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agreements.map((agreement) => (
              <div key={agreement.id} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg p-2 bg-muted">
                    {getTypeIcon(agreement.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{agreement.name}</p>
                      <Badge variant="outline">{agreement.version}</Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>{agreement.parties.join(' • ')}</span>
                      {agreement.signedDate && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Expires {new Date(agreement.expiryDate!).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(agreement.status)}
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Agreement Templates */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Agreement Templates</CardTitle>
              <CardDescription>
                Standard templates for common agreements
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {templates.map((template, idx) => (
              <div key={idx} className="p-4 rounded-lg border hover:border-primary transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
                <p className="font-medium text-sm">{template.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Updated {new Date(template.lastUpdated).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Compliance Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              'Master Service Agreement with MentoLoop',
              'HIPAA Business Associate Agreement',
              'Student Data Privacy Agreement',
              'Professional Liability Insurance Documentation',
              'Clinical Site Affiliation Agreements'
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              <p className="text-sm font-medium text-green-900">All compliance requirements met</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-full p-2 bg-blue-100">
                <AlertCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Need legal assistance?</p>
                <p className="text-sm text-muted-foreground">
                  Contact our legal team for agreement reviews or modifications
                </p>
              </div>
            </div>
            <Button variant="outline">Contact Legal Team</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}