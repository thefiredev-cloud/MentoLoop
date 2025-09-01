'use client'

import { RoleGuard } from '@/components/role-guard'
import { DashboardContainer } from '@/components/dashboard/dashboard-container'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react'

export default function EnterpriseAgreementsPage() {
  return (
    <RoleGuard requiredRole="enterprise">
      <EnterpriseAgreementsContent />
    </RoleGuard>
  )
}

function EnterpriseAgreementsContent() {
  const agreements = [
    {
      id: '1',
      title: 'Master Service Agreement',
      type: 'MSA',
      status: 'active',
      signedDate: '2024-01-15',
      expiryDate: '2025-01-15'
    },
    {
      id: '2',
      title: 'Clinical Affiliation Agreement',
      type: 'CAA',
      status: 'active',
      signedDate: '2024-02-01',
      expiryDate: '2026-02-01'
    },
    {
      id: '3',
      title: 'Data Privacy Agreement',
      type: 'DPA',
      status: 'pending',
      signedDate: null,
      expiryDate: null
    },
    {
      id: '4',
      title: 'Student Placement Agreement',
      type: 'SPA',
      status: 'expired',
      signedDate: '2023-01-01',
      expiryDate: '2024-01-01'
    }
  ]

  return (
    <DashboardContainer
      title="Agreements"
      subtitle="Manage your organization's legal agreements and contracts"
      headerAction={
        <Button size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Upload Agreement
        </Button>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Active Agreements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {agreements.map((agreement) => (
              <div key={agreement.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{agreement.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Type: {agreement.type} • 
                      {agreement.signedDate && ` Signed: ${new Date(agreement.signedDate).toLocaleDateString()}`}
                      {agreement.expiryDate && ` • Expires: ${new Date(agreement.expiryDate).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    agreement.status === 'active' ? 'default' :
                    agreement.status === 'pending' ? 'secondary' :
                    'destructive'
                  }>
                    {agreement.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {agreement.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                    {agreement.status === 'expired' && <AlertCircle className="h-3 w-3 mr-1" />}
                    {agreement.status}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardContainer>
  )
}