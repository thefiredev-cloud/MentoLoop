import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ShimmerSkeleton } from '@/components/ui/shimmer-skeleton'

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div>
        <ShimmerSkeleton className="h-8 w-64 mb-2" />
        <ShimmerSkeleton className="h-4 w-96" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-6 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <ShimmerSkeleton className="h-4 w-24" />
              <ShimmerSkeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <ShimmerSkeleton className="h-7 w-16 mb-1" />
              <ShimmerSkeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <ShimmerSkeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <ShimmerSkeleton className="h-4 w-32" />
                  <ShimmerSkeleton className="h-3 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <ShimmerSkeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <ShimmerSkeleton className="h-10 w-32" />
          <ShimmerSkeleton className="h-10 w-24" />
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="space-y-0">
            {/* Table Header */}
            <div className="border-b p-4 flex items-center gap-4">
              {[...Array(5)].map((_, i) => (
                <ShimmerSkeleton key={i} className="h-4 w-24" />
              ))}
            </div>
            
            {/* Table Rows */}
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border-b p-4 flex items-center gap-4">
                {[...Array(5)].map((_, j) => (
                  <ShimmerSkeleton key={j} className="h-4 w-24" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function FormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <ShimmerSkeleton className="h-6 w-48" />
        <ShimmerSkeleton className="h-4 w-72 mt-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <ShimmerSkeleton className="h-4 w-24" />
            <ShimmerSkeleton className="h-10 w-full" />
          </div>
        ))}
        <div className="flex gap-2">
          <ShimmerSkeleton className="h-10 w-24" />
          <ShimmerSkeleton className="h-10 w-32" />
        </div>
      </CardContent>
    </Card>
  )
}

export function CardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <ShimmerSkeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent className="space-y-2">
        <ShimmerSkeleton className="h-4 w-full" />
        <ShimmerSkeleton className="h-4 w-3/4" />
        <ShimmerSkeleton className="h-4 w-1/2" />
      </CardContent>
    </Card>
  )
}