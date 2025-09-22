import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('@/components/role-guard', () => ({
  RoleGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@/components/dashboard/dashboard-container', () => ({
  DashboardContainer: ({ children }: any) => <div>{children}</div>,
  DashboardGrid: ({ children }: any) => <div>{children}</div>,
  DashboardSection: ({ children }: any) => <div>{children}</div>,
}))

vi.mock('@/components/dashboard/quick-actions', () => ({
  QuickActions: ({ children, actions }: any) => (
    <div>
      <div>Quick Actions</div>
      {children || actions?.map((action: any) => (
        <button key={action.id}>{action.title}</button>
      ))}
    </div>
  ),
}))

vi.mock('@/components/dashboard/stats-card', () => ({
  StatsCard: ({ title, value }: any) => (
    <div>
      <div>{title}</div>
      <div>{value}</div>
    </div>
  ),
}))

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h3>{children}</h3>,
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}))

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: any) => <span>{children}</span>,
}))

import StudentDashboardPage from '@/app/dashboard/student/page'
import { useQuery } from 'convex/react'

const mockUserDoc = {
  _id: 'user123',
  userType: 'student',
  firstName: 'John',
  lastName: 'Student',
}

const mockDashboardStats = {
  student: {
    personalInfo: {
      fullName: 'John Student',
    },
    schoolInfo: {
      degreeTrack: 'DNP',
      programName: 'Family Nurse Practitioner',
    },
  },
  profileCompletionPercentage: 75,
  pendingMatchesCount: 2,
  hoursCompleted: 240,
  hoursRequired: 320,
  currentMatch: {
    rotationDetails: {
      rotationType: 'Primary Care',
      weeklyHours: 40,
    },
  },
}

describe('StudentDashboardPage', () => {
  const mockUseQuery = vi.mocked(useQuery)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state while queries resolve', () => {
    mockUseQuery.mockReturnValue(undefined)
    render(<StudentDashboardPage />)
    expect(screen.getByText('Loading your dashboard...')).toBeInTheDocument()
  })

  it('prompts student to complete intake when stats unavailable', () => {
    mockUseQuery
      .mockReturnValueOnce(mockUserDoc as any)
      .mockReturnValueOnce(null as any)

    render(<StudentDashboardPage />)

    expect(screen.getByText('Complete Your Profile')).toBeInTheDocument()
    expect(screen.getByText(/Complete your student intake form/i)).toBeInTheDocument()
  })

  it('renders dashboard metrics when stats are available', () => {
    mockUseQuery
      .mockReturnValueOnce(mockUserDoc as any)
      .mockReturnValueOnce(mockDashboardStats as any)

    render(<StudentDashboardPage />)

    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument()
    expect(screen.getByText('Quick Actions')).toBeInTheDocument()
    expect(screen.getByText('Profile Completion')).toBeInTheDocument()
    expect(screen.getByText('Current Rotation')).toBeInTheDocument()
    expect(screen.getAllByText('Clinical Hours').length).toBeGreaterThan(0)
  })

  it('handles lack of current match gracefully', () => {
    const statsWithoutMatch = { ...mockDashboardStats, currentMatch: null }
    mockUseQuery
      .mockReturnValueOnce(mockUserDoc as any)
      .mockReturnValueOnce(statsWithoutMatch as any)

    render(<StudentDashboardPage />)

    expect(screen.getByText('Quick Actions')).toBeInTheDocument()
    expect(screen.getByText(/No active rotation/i)).toBeInTheDocument()
  })
})
