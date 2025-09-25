'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Search,
  Upload,
  Download,
  FileText,
  Video,
  Package,
  Star,
  Heart,
  Filter,
  TrendingUp,
  Users,
  Eye,
  Plus,
  Folder,
  File,
  Award
} from 'lucide-react'

export default function LoopExchangePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Sample data for resources
  const resources = [
    {
      id: 1,
      title: 'Complete PMHNP Study Guide 2024',
      description: 'Comprehensive study materials for psychiatric mental health NP certification exam',
      category: 'Study Guides',
      type: 'document',
      author: 'Dr. Sarah Williams',
      authorRole: 'Preceptor',
      downloads: 1542,
      likes: 234,
      rating: 4.9,
      size: '15.2 MB',
      format: 'PDF',
      uploadDate: '2024-01-10',
      tags: ['PMHNP', 'Certification', 'Mental Health'],
      isPremium: true,
      price: 49.99
    },
    {
      id: 2,
      title: 'Clinical Assessment Templates Pack',
      description: 'Ready-to-use templates for patient assessments and SOAP notes',
      category: 'Templates',
      type: 'document',
      author: 'Emily Chen',
      authorRole: 'Student',
      downloads: 892,
      likes: 156,
      rating: 4.7,
      size: '2.8 MB',
      format: 'DOCX',
      uploadDate: '2024-01-15',
      tags: ['Clinical', 'Assessment', 'Templates'],
      isPremium: false,
      price: 0
    },
    {
      id: 3,
      title: 'Pharmacology Video Series',
      description: '10-part video series covering advanced pharmacology topics',
      category: 'Videos',
      type: 'video',
      author: 'Dr. Michael Rodriguez',
      authorRole: 'Preceptor',
      downloads: 2103,
      likes: 412,
      rating: 4.8,
      size: '2.1 GB',
      format: 'MP4',
      uploadDate: '2024-01-08',
      tags: ['Pharmacology', 'Video', 'Education'],
      isPremium: true,
      price: 79.99
    },
    {
      id: 4,
      title: 'FNP Exam Prep Flashcards',
      description: '500+ digital flashcards for FNP certification exam preparation',
      category: 'Study Tools',
      type: 'flashcards',
      author: 'Jessica Martinez',
      authorRole: 'Student',
      downloads: 3421,
      likes: 567,
      rating: 4.9,
      size: '45 MB',
      format: 'Interactive',
      uploadDate: '2024-01-12',
      tags: ['FNP', 'Exam Prep', 'Flashcards'],
      isPremium: false,
      price: 0
    }
  ]

  const myUploads = [
    {
      id: 1,
      title: 'Pediatric Assessment Guide',
      downloads: 234,
      earnings: 468.00,
      status: 'active'
    },
    {
      id: 2,
      title: 'Clinical Rotation Checklist',
      downloads: 156,
      earnings: 0,
      status: 'active'
    }
  ]

  const categories = [
    { value: 'all', label: 'All Resources' },
    { value: 'study-guides', label: 'Study Guides' },
    { value: 'templates', label: 'Templates' },
    { value: 'videos', label: 'Videos' },
    { value: 'flashcards', label: 'Study Tools' },
    { value: 'case-studies', label: 'Case Studies' },
    { value: 'research', label: 'Research Papers' }
  ]

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || 
                           resource.category.toLowerCase().replace(' ', '-') === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'document': return <FileText className="h-5 w-5" />
      case 'video': return <Video className="h-5 w-5" />
      case 'flashcards': return <Package className="h-5 w-5" />
      default: return <File className="h-5 w-5" />
    }
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">LoopExchange</h1>
        <p className="text-muted-foreground mt-2">
          Share and discover study materials, templates, and resources with the MentoLoop community
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Resources</p>
                <p className="text-2xl font-bold">12,456</p>
              </div>
              <Folder className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Contributors</p>
                <p className="text-2xl font-bold">3,892</p>
              </div>
              <Users className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Downloads Today</p>
                <p className="text-2xl font-bold">1,234</p>
              </div>
              <Download className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Your Earnings</p>
                <p className="text-2xl font-bold">$468</p>
              </div>
              <Award className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="browse" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="browse">Browse Resources</TabsTrigger>
            <TabsTrigger value="my-uploads">My Uploads</TabsTrigger>
            <TabsTrigger value="saved">Saved Resources</TabsTrigger>
          </TabsList>
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload Resource
          </Button>
        </div>

        {/* Browse Resources Tab */}
        <TabsContent value="browse" className="space-y-6">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex h-10 w-full sm:w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>

          {/* Resources Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredResources.map((resource) => (
              <Card key={resource.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(resource.type)}
                      <Badge variant="outline">{resource.category}</Badge>
                    </div>
                    {resource.isPremium && (
                      <Badge variant="default" className="bg-amber-500">
                        Premium
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg mt-3 line-clamp-2">
                    {resource.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {resource.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{resource.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                      <p className="font-medium">{resource.author}</p>
                      <p className="text-muted-foreground">{resource.authorRole}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {resource.downloads.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {resource.likes}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{resource.rating}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {resource.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-sm">
                      <span className="text-muted-foreground">{resource.size} • {resource.format}</span>
                      {resource.isPremium && (
                        <p className="font-semibold text-success">${resource.price}</p>
                      )}
                    </div>
                    <Button size="sm" variant={resource.isPremium ? 'default' : 'outline'}>
                      {resource.isPremium ? 'Purchase' : 'Download'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center">
            <Button variant="outline">
              Load More Resources
            </Button>
          </div>
        </TabsContent>

        {/* My Uploads Tab */}
        <TabsContent value="my-uploads" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Uploaded Resources</CardTitle>
              <CardDescription>
                Manage and track the performance of your shared resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myUploads.map((upload) => (
                  <div key={upload.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <FileText className="h-10 w-10 text-blue-500" />
                      <div>
                        <h4 className="font-semibold">{upload.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            {upload.downloads} downloads
                          </span>
                          {upload.earnings > 0 && (
                            <span className="text-success font-medium">
                              ${upload.earnings.toFixed(2)} earned
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Card className="mt-6 border-dashed">
                <CardContent className="p-6 text-center">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Share Your Knowledge</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload study materials, templates, or resources to help others
                  </p>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Upload New Resource
                  </Button>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Saved Resources Tab */}
        <TabsContent value="saved" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Saved Resources</CardTitle>
              <CardDescription>
                Resources you&apos;ve bookmarked for later access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {filteredResources.slice(0, 2).map((resource) => (
                  <div key={resource.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getTypeIcon(resource.type)}
                      <div className="flex-1">
                        <h4 className="font-semibold">{resource.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {resource.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                          <span>By {resource.author}</span>
                          <span>{resource.format}</span>
                          <span>{resource.size}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Heart className="mr-2 h-4 w-4" />
                        Unsave
                      </Button>
                      <Button size="sm">
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-6">
                <p className="text-muted-foreground mb-4">
                  Save resources while browsing to access them quickly later
                </p>
                <Button variant="outline">
                  Browse Resources
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Community Section */}
      <Card>
        <CardHeader>
          <CardTitle>Community Highlights</CardTitle>
          <CardDescription>
            Top contributors and trending resources this week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Trending Resources
              </h4>
              <div className="space-y-2">
                {resources.slice(0, 3).map((resource, index) => (
                  <div key={resource.id} className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground">#{index + 1}</span>
                    <span className="flex-1 truncate">{resource.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {resource.downloads} downloads
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-500" />
                Top Contributors
              </h4>
              <div className="space-y-3">
                {[
                  { name: 'Dr. Sarah Williams', uploads: 42, earnings: '$2,340' },
                  { name: 'Dr. Michael Rodriguez', uploads: 38, earnings: '$1,890' },
                  { name: 'Emily Chen', uploads: 31, earnings: '$1,230' }
                ].map((contributor, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{contributor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-sm">
                      <p className="font-medium">{contributor.name}</p>
                      <p className="text-muted-foreground">{contributor.uploads} resources</p>
                    </div>
                    <Badge variant="secondary">{contributor.earnings}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}