import { ReactNode } from 'react'

interface DashboardContainerProps {
  title: string
  subtitle?: string
  headerAction?: ReactNode
  children: ReactNode
}

export function DashboardContainer({
  title,
  subtitle,
  headerAction,
  children
}: DashboardContainerProps) {
  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        {headerAction && (
          <div className="flex items-center gap-2">
            {headerAction}
          </div>
        )}
      </div>

      {/* Dashboard Content */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  )
}

interface DashboardSectionProps {
  children: ReactNode
  className?: string
}

export function DashboardSection({ children, className = "" }: DashboardSectionProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {children}
    </div>
  )
}

interface DashboardGridProps {
  children: ReactNode
  columns?: 1 | 2 | 3 | 4
  className?: string
}

export function DashboardGrid({ 
  children, 
  columns = 4,
  className = "" 
}: DashboardGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 lg:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }

  return (
    <div className={`grid gap-4 ${gridCols[columns]} ${className}`}>
      {children}
    </div>
  )
}