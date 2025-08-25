'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Stethoscope,
  Users,
  Search,
  Plus,
  Download,
  Upload,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Building,
  Filter,
  Star,
  UserCheck
} from 'lucide-react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Doc } from '@/convex/_generated/dataModel'


export default function EnterprisePreceptorsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Queries
  const user = useQuery(api.users.current)
  const enterpriseData = useQuery(
    api.enterprises.getByUserId,
    user?._id ? { userId: user._id } : "skip"
  )
  const preceptors = useQuery(
    api.preceptors.getByEnterpriseId,
    enterpriseData?._id ? { enterpriseId: enterpriseData._id } : "skip"
  )

  // Mutations
  const approvePreceptor = useMutation(api.preceptors.approvePreceptor)

  // Filter and search preceptors
  const filteredPreceptors = useMemo(() => {
    if (!preceptors) return []
    
    return preceptors.filter((preceptor) => {
      const matchesSearch = !searchQuery || 
        preceptor.personalInfo?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        preceptor.personalInfo?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (preceptor as {practiceInformation?: {primarySpecialty?: string}} & typeof preceptor).practiceInformation?.primarySpecialty?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || preceptor.verificationStatus === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }, [preceptors, searchQuery, statusFilter])

  // Calculate stats
  const stats = useMemo(() => {
    if (!preceptors) return { total: 0, active: 0, pending: 0, verified: 0 }
    
    const total = preceptors.length
    const active = preceptors.filter((p: {availability?: {currentlyAccepting?: boolean}}) => p.availability?.currentlyAccepting === true).length
    const pending = preceptors.filter((p: {verificationStatus?: string}) => p.verificationStatus === 'pending').length
    const verified = preceptors.filter((p: {verificationStatus?: string}) => p.verificationStatus === 'verified').length
    
    return { total, active, pending, verified }
  }, [preceptors])


  // const getStatusBadge = (status: string) => {
  //   const statusConfig = {
  //     active: { variant: 'default', label: 'Active', icon: CheckCircle },
  //     pending: { variant: 'secondary', label: 'Pending', icon: Clock },
  //     inactive: { variant: 'destructive', label: 'Inactive', icon: XCircle },
  //     suspended: { variant: 'destructive', label: 'Suspended', icon: AlertCircle },
  //   }
  //   
  //   const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
  //   const Icon = config.icon
  //   
  //   return (
  //     <Badge variant={config.variant as 'default' | 'secondary' | 'destructive' | 'outline'} className="flex items-center gap-1">
  //       <Icon className="h-3 w-3" />
  //       {config.label}
  //     </Badge>
  //   )
  // }

  const getVerificationBadge = (status: string) => {
    const verificationConfig = {
      verified: { variant: 'default', label: 'Verified', icon: UserCheck },
      pending: { variant: 'secondary', label: 'Pending', icon: Clock },
      rejected: { variant: 'destructive', label: 'Rejected', icon: XCircle },
    }
    
    const config = verificationConfig[status as keyof typeof verificationConfig] || verificationConfig.pending
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant as 'default' | 'secondary' | 'destructive' | 'outline'} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const PreceptorDetailsModal = ({ preceptor }: { preceptor: Doc<"preceptors">; onClose: () => void }) => (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5" />
          {preceptor.personalInfo?.fullName || 'Unknown Preceptor'}
        </DialogTitle>
        <DialogDescription>
          Preceptor ID: {preceptor._id} • {getVerificationBadge(preceptor.verificationStatus || 'pending')}
        </DialogDescription>
      </DialogHeader>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="practice">Practice Info</TabsTrigger>
          <TabsTrigger value="credentials">Credentials</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{preceptor.personalInfo?.email || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{'Not provided'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{'Not provided'}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Practice Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{'Not provided'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{'Not specified'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Max Students: 1</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Available Specialties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-muted-foreground">None specified</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="practice">
          <Card>
            <CardHeader>
              <CardTitle>Practice Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <span className="text-sm font-medium">Practice Name:</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {'Not provided'}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium">Practice Type:</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {'Not specified'}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium">Years in Practice:</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {'Not specified'}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium">Patient Population:</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {'Not specified'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="credentials">
          <Card>
            <CardHeader>
              <CardTitle>Credentials & Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <span className="text-sm font-medium">NPI Number:</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {'Not provided'}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium">License Number:</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {'Not provided'}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium">DEA Number:</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {'Not provided'}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium">Verification Status:</span>
                  <div className="mt-1">
                    {getVerificationBadge(preceptor.verificationStatus || 'pending')}
                  </div>
                </div>
              </div>
              
              {preceptor.verificationStatus === 'pending' && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => approvePreceptor({ preceptorId: preceptor._id })}>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Approve Preceptor
                  </Button>
                  <Button size="sm" variant="destructive">
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Application
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>Current & Past Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold">3</div>
                    <div className="text-sm text-muted-foreground">Current Students</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">12</div>
                    <div className="text-sm text-muted-foreground">Total Students Mentored</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">4.8</div>
                    <div className="text-sm text-muted-foreground">Avg Student Rating</div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Detailed student list will be displayed here based on match data
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <span className="text-sm font-medium">MentorFit Score:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="text-lg font-bold">8.7</div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Partnership Duration:</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      Member since {'2024'}
                    </p>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium">Specialization Strengths:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <Badge variant="outline" className="text-xs">Family Medicine</Badge>
                    <Badge variant="outline" className="text-xs">Pediatrics</Badge>
                    <Badge variant="outline" className="text-xs">Women&apos;s Health</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DialogContent>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Preceptor Network</h1>
          <p className="text-muted-foreground">
            Manage and monitor your organization&apos;s preceptor partnerships
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import Preceptors
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Invite Preceptor
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Preceptors</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              In your network
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Preceptors</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              Available for students
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verified}</div>
            <p className="text-xs text-muted-foreground">
              Credentials verified
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting review
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search preceptors by name, email, or practice..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Status: {statusFilter === 'all' ? 'All' : statusFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                  All Preceptors
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('inactive')}>
                  Inactive
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('suspended')}>
                  Suspended
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Preceptors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Preceptors ({filteredPreceptors.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preceptor</TableHead>
                <TableHead>Practice</TableHead>
                <TableHead>Specialties</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPreceptors.map((preceptor: Doc<"preceptors">) => (
                <TableRow key={preceptor._id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{preceptor.personalInfo?.fullName || 'Unknown'}</div>
                      <div className="text-sm text-muted-foreground">{preceptor.personalInfo?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm font-medium">{'Not provided'}</div>
                      <div className="text-sm text-muted-foreground">{'Not provided'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-40">
                      <span className="text-xs text-muted-foreground">None</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">Active</Badge>
                  </TableCell>
                  <TableCell>
                    {getVerificationBadge(preceptor.verificationStatus || 'pending')}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      0 / 1
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">4.8</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Dialog>
                          <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                          </DialogTrigger>
                          <PreceptorDetailsModal 
                            preceptor={preceptor} 
                            onClose={() => {}} 
                          />
                        </Dialog>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Preceptor
                        </DropdownMenuItem>
                        {preceptor.verificationStatus === 'pending' && (
                          <DropdownMenuItem onClick={() => approvePreceptor({ preceptorId: preceptor._id })}>
                            <UserCheck className="h-4 w-4 mr-2" />
                            Approve
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Preceptor
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              
              {filteredPreceptors.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Stethoscope className="h-8 w-8 text-muted-foreground" />
                      <div className="text-lg font-medium">No preceptors found</div>
                      <div className="text-sm text-muted-foreground">
                        {searchQuery ? 'Try adjusting your search or filters' : 'Get started by inviting your first preceptor'}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}