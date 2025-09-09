'use client'

import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { 
  GraduationCap, 
  Clock, 
  Award,
  BookOpen,
  Download,
  Search,
  Filter,
  Calendar,
  CheckCircle,
  Play,
  FileText,
  Star,
  TrendingUp,
  Users,
  Trophy,
  ChevronRight
} from 'lucide-react'

export default function CEUDashboard() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // TODO: Fetch data from Convex when functions are deployed
  // const availableCourses = useQuery(api.ceuCourses.getAvailableCourses, {
  //   category: selectedCategory === 'all' ? undefined : selectedCategory,
  //   searchQuery: searchQuery || undefined,
  // })
  // const userEnrollments = useQuery(api.ceuCourses.getUserEnrollments)
  // const userCertificates = useQuery(api.ceuCourses.getUserCertificates)
  // const ceuStats = useQuery(api.ceuCourses.getCEUStats)
  // const enrollInCourse = useMutation(api.ceuCourses.enrollInCourse)

  // Mock data for now
  const availableCourses = [
    {
      id: "1",
      title: "Advanced Clinical Assessment Techniques",
      category: "Clinical Skills",
      credits: 4,
      duration: "4 hours",
      difficulty: "Advanced",
      enrollmentCount: 1234,
      rating: 4.8,
      progress: 65,
      status: "in-progress",
      instructor: "Dr. Sarah Johnson, DNP",
      thumbnail: "/api/placeholder/300/200"
    },
    {
      id: "2",
      title: "Pharmacology Update 2024",
      category: "Pharmacology",
      credits: 3,
      duration: "3 hours",
      difficulty: "Intermediate",
      enrollmentCount: 892,
      rating: 4.6,
      progress: 0,
      status: "available",
      instructor: "Dr. Michael Chen, PharmD",
      thumbnail: "/api/placeholder/300/200"
    },
  ]
  
  const ceuStats = {
    totalCredits: 32,
    coursesCompleted: 8,
    coursesInProgress: 2,
    certificatesEarned: 8,
    currentYearCredits: 12,
    requiredCredits: 30,
  }

  // Use real data or defaults
  const courses = availableCourses || [
    {
      id: 1,
      title: 'Advanced Clinical Assessment Techniques',
      category: 'Clinical Skills',
      credits: 4,
      duration: '4 hours',
      difficulty: 'Advanced',
      enrolled: 1234,
      rating: 4.8,
      progress: 65,
      status: 'in-progress',
      instructor: 'Dr. Sarah Johnson, DNP',
      thumbnail: '/api/placeholder/300/200'
    },
    {
      id: 2,
      title: 'Pharmacology Update 2024',
      category: 'Pharmacology',
      credits: 3,
      duration: '3 hours',
      difficulty: 'Intermediate',
      enrolled: 2156,
      rating: 4.9,
      progress: 100,
      status: 'completed',
      instructor: 'Dr. Michael Chen, PharmD',
      thumbnail: '/api/placeholder/300/200'
    },
  ]

  const enrollments = [] // userEnrollments || []
  const certificates = [ // userCertificates || [
    {
      id: 'cert-1',
      courseTitle: 'Pharmacology Update 2024',
      completedDate: '2024-01-15',
      credits: 3,
      certificateUrl: '#'
    },
    {
      id: 'cert-2',
      courseTitle: 'Diabetes Management Mastery',
      completedDate: '2023-12-20',
      credits: 4,
      certificateNumber: 'CEU-2023-1897'
    }
  ]

  const categories = [
    { value: 'all', label: 'All Courses' },
    { value: 'clinical', label: 'Clinical Skills' },
    { value: 'pharmacology', label: 'Pharmacology' },
    { value: 'mental-health', label: 'Mental Health' },
    { value: 'pediatrics', label: 'Pediatrics' },
    { value: 'geriatrics', label: 'Geriatrics' },
    { value: 'leadership', label: 'Leadership' }
  ]

  const totalCreditsEarned = ceuStats?.totalCredits || 0
  const creditsNeeded = ceuStats?.requiredCredits || 30
  const progressPercentage = (totalCreditsEarned / creditsNeeded) * 100

  const handleEnroll = async (courseId: string) => {
    // TODO: Implement when Convex functions are deployed
    // await enrollInCourse({ courseId })
    toast.success('Successfully enrolled in course!')
  }

  const filteredCourses = courses // Filtering is now done server-side

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Continuing Education Units (CEU)</h1>
        <p className="text-muted-foreground mt-2">
          Earn continuing education credits while enhancing your clinical skills
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Credits</p>
                <p className="text-2xl font-bold">{totalCreditsEarned}</p>
              </div>
              <Trophy className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Certificates</p>
                <p className="text-2xl font-bold">{certificates.length}</p>
              </div>
              <Award className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Annual CEU Progress</CardTitle>
          <CardDescription>
            Track your progress toward annual continuing education requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">
                {totalCreditsEarned} of {creditsNeeded} credits earned
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progressPercentage)}% complete
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Renewal deadline: December 31, 2024</span>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="courses">Browse Courses</TabsTrigger>
          <TabsTrigger value="my-courses">My Courses</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>

        {/* Browse Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses or instructors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex h-10 w-full sm:w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Course Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {filteredCourses.map((course: any) => (
              <Card key={course.id} className="overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <GraduationCap className="h-12 w-12 text-gray-400" />
                  </div>
                  {course.status === 'completed' && (
                    <Badge className="absolute top-2 right-2" variant="default">
                      Completed
                    </Badge>
                  )}
                  {course.status === 'in-progress' && (
                    <Badge className="absolute top-2 right-2" variant="secondary">
                      In Progress
                    </Badge>
                  )}
                </div>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-2">{course.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{course.instructor}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <span>{course.credits} CEUs</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{course.rating}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Badge variant="outline">{course.category}</Badge>
                        <Badge variant="outline">{course.difficulty}</Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{course.enrolled.toLocaleString()}</span>
                      </div>
                    </div>

                    {course.status === 'in-progress' && (
                      <div className="space-y-2">
                        <Progress value={course.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground text-right">
                          {course.progress}% complete
                        </p>
                      </div>
                    )}

                    <Button className="w-full">
                      {course.status === 'not-started' && (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Start Course
                        </>
                      )}
                      {course.status === 'in-progress' && (
                        <>
                          Continue Learning
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                      {course.status === 'completed' && (
                        <>
                          <Award className="mr-2 h-4 w-4" />
                          View Certificate
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* My Courses Tab */}
        <TabsContent value="my-courses" className="space-y-6">
          <div className="grid gap-4">
            {courses.filter(c => c.status !== 'not-started').map((course) => (
              <Card key={course.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{course.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {course.instructor} • {course.credits} CEUs
                      </p>
                      {course.status === 'in-progress' && (
                        <div className="mt-4 space-y-2">
                          <Progress value={course.progress} className="h-2" />
                          <p className="text-xs text-muted-foreground">
                            {course.progress}% complete • Last accessed 2 days ago
                          </p>
                        </div>
                      )}
                      {course.status === 'completed' && (
                        <div className="mt-4">
                          <Badge variant="default">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Completed
                          </Badge>
                        </div>
                      )}
                    </div>
                    <Button variant="outline">
                      {course.status === 'in-progress' ? 'Continue' : 'Review'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Certificates Tab */}
        <TabsContent value="certificates" className="space-y-6">
          <div className="grid gap-4">
            {certificates.map((cert: any) => (
              <Card key={cert.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <Award className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{cert.courseName}</h3>
                        <p className="text-sm text-muted-foreground">
                          Completed on {new Date(cert.completedDate).toLocaleDateString()} • 
                          {' '}{cert.credits} CEUs earned
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Certificate #{cert.certificateNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <FileText className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Card className="border-dashed">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground mb-4">
                  Complete more courses to earn additional certificates
                </p>
                <Button variant="outline">
                  Browse Available Courses
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}