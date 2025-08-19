'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Users, 
  Search, 
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { toast } from 'sonner'

interface User {
  _id: Id<'users'>
  name: string
  email?: string
  userType?: 'student' | 'preceptor' | 'admin' | 'enterprise'
  createdAt?: number
  profileData?: any
  hasProfile: boolean
  profileStatus: string
}

export default function UserManagementPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [userTypeFilter, setUserTypeFilter] = useState<string | undefined>(undefined)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    userType: '',
    reason: ''
  })

  // Queries
  const usersData = useQuery(api.admin.searchUsers, {
    searchTerm: searchTerm || undefined,
    userType: userTypeFilter ? userTypeFilter as any : undefined,
    limit: 50,
  })

  const userDetails = useQuery(
    api.admin.getUserDetails,
    selectedUser ? { userId: selectedUser._id } : "skip"
  )

  const platformStats = useQuery(api.admin.getPlatformStats, {})

  // Mutations
  const updateUser = useMutation(api.admin.updateUser)
  const approvePreceptor = useMutation(api.admin.approvePreceptor)
  const rejectPreceptor = useMutation(api.admin.rejectPreceptor)
  const deleteUser = useMutation(api.admin.deleteUser)

  // Handle user selection
  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setShowUserDetails(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setEditFormData({
      name: user.name,
      email: user.email || '',
      userType: user.userType || '',
      reason: ''
    })
    setShowEditDialog(true)
  }

  // Handle user updates
  const handleUpdateUser = async () => {
    if (!selectedUser) return

    try {
      await updateUser({
        userId: selectedUser._id,
        updates: {
          name: editFormData.name,
          email: editFormData.email,
          userType: editFormData.userType as any,
        },
        reason: editFormData.reason,
      })
      toast.success('User updated successfully')
      setShowEditDialog(false)
      setEditFormData({ name: '', email: '', userType: '', reason: '' })
    } catch (error) {
      toast.error('Failed to update user')
    }
  }

  // Handle preceptor approval
  const handleApprovePreceptor = async (user: User) => {
    if (!user.profileData?._id) return

    try {
      await approvePreceptor({
        preceptorId: user.profileData._id,
        reason: 'Approved by admin',
      })
      toast.success('Preceptor approved successfully')
    } catch (error) {
      toast.error('Failed to approve preceptor')
    }
  }

  const handleRejectPreceptor = async (user: User, reason: string) => {
    if (!user.profileData?._id) return

    try {
      await rejectPreceptor({
        preceptorId: user.profileData._id,
        reason,
      })
      toast.success('Preceptor rejected')
    } catch (error) {
      toast.error('Failed to reject preceptor')
    }
  }

  // Handle user deletion
  const handleDeleteUser = async (user: User, reason: string) => {
    try {
      await deleteUser({
        userId: user._id,
        reason,
      })
      toast.success('User deleted successfully')
    } catch (error) {
      toast.error('Failed to delete user')
    }
  }

  const getUserStatusBadge = (user: User) => {
    if (user.userType === 'preceptor' && user.profileData) {
      switch (user.profileData.verificationStatus) {
        case 'verified':
          return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>
        case 'pending':
          return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
        case 'rejected':
          return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
        default:
          return <Badge variant="outline"><AlertCircle className="h-3 w-3 mr-1" />Unknown</Badge>
      }
    }
    
    if (user.userType === 'student' && user.profileData) {
      switch (user.profileData.status) {
        case 'submitted':
          return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Complete</Badge>
        case 'incomplete':
          return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Incomplete</Badge>
        default:
          return <Badge variant="outline">{user.profileData.status}</Badge>
      }
    }

    return <Badge variant="outline">No Profile</Badge>
  }

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'Unknown'
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage students, preceptors, and enterprise users
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {platformStats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platformStats.users.total.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {platformStats.users.students} students • {platformStats.users.preceptors} preceptors
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platformStats.profiles.preceptorsPending}</div>
              <p className="text-xs text-muted-foreground">
                Preceptors awaiting verification
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Preceptors</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platformStats.profiles.preceptorsVerified}</div>
              <p className="text-xs text-muted-foreground">
                Active preceptors
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Complete Profiles</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platformStats.profiles.studentsComplete}</div>
              <p className="text-xs text-muted-foreground">
                Students ready for matching
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Users</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={userTypeFilter || undefined} onValueChange={(value) => setUserTypeFilter(value === 'all' ? undefined : value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="User Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="preceptor">Preceptors</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {usersData ? (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersData.users?.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email || 'No email'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {user.userType || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>{getUserStatusBadge(user)}</TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewUser(user)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {user.userType === 'preceptor' && 
                           user.profileData?.verificationStatus === 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600"
                              onClick={() => handleApprovePreceptor(user)}
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {usersData.hasMore && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Showing {usersData.users?.length} of {usersData.totalCount} users
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Loading users...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {userDetails && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Basic Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {userDetails.user.name}</div>
                    <div><strong>Email:</strong> {userDetails.user.email || 'Not provided'}</div>
                    <div><strong>Type:</strong> {userDetails.user.userType}</div>
                    <div><strong>Created:</strong> {formatDate(userDetails.user.createdAt)}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Activity</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Total Matches:</strong> {userDetails.matches}</div>
                    <div><strong>Has Profile:</strong> {userDetails.profileData ? 'Yes' : 'No'}</div>
                    {userDetails.enterpriseData && (
                      <div><strong>Enterprise:</strong> {userDetails.enterpriseData.name}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Data */}
              {userDetails.profileData && (
                <div>
                  <h3 className="font-semibold mb-2">Profile Data</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(userDetails.profileData, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Recent Audit Logs */}
              {userDetails.auditLogs && userDetails.auditLogs.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Recent Activity</h3>
                  <div className="space-y-2">
                    {userDetails.auditLogs.map((log: any) => (
                      <div key={log._id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <span className="font-medium">{log.action}</span>
                          <span className="text-muted-foreground ml-2">
                            by {log.performerName}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(log.timestamp)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editFormData.name}
                onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="userType">User Type</Label>
              <Select
                value={editFormData.userType}
                onValueChange={(value) => setEditFormData(prev => ({ ...prev, userType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="preceptor">Preceptor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reason">Reason for change</Label>
              <Textarea
                id="reason"
                value={editFormData.reason}
                onChange={(e) => setEditFormData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Explain why you're making this change..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateUser}>
                Update User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}