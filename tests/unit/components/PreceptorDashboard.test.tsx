import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
  useAction: () => vi.fn(),
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('@/components/role-guard', () => ({
  RoleGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h3>{children}</h3>,
}))

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: any) => <span>{children}</span>,
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}))

import PreceptorDashboardPage from '@/app/dashboard/preceptor/page'
import { useQuery } from 'convex/react'

const mockUserDoc = {
  _id: 'user123',
  userType: 'preceptor',
  personalInfo: {
    fullName: 'Dr. Mentor Guide',
  },
}

const mockDashboardStats = {
  preceptor: {
    personalInfo: {
      fullName: 'Dr. Mentor Guide',
    },
    verificationStatus: 'verified',
    stripeConnectStatus: 'complete',
    payoutsEnabled: true,
  },
  activeStudentsCount: 3,
  pendingMatchesCount: 1,
}

const mockEarnings = {
  totalEarnings: 120000,
  pendingEarnings: 30000,
}

describe('PreceptorDashboardPage', () => {
  const mockUseQuery = vi.mocked(useQuery)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state while user data loads', () => {
    mockUseQuery.mockReturnValue(undefined)
    render(<PreceptorDashboardPage />)
    expect(screen.getByText('Loading your dashboard...')).toBeInTheDocument()
  })

  it('renders dashboard content when stats available', () => {
    mockUseQuery
      .mockReturnValueOnce(mockUserDoc as any)
      .mockReturnValueOnce(mockDashboardStats as any)
      .mockReturnValueOnce(mockEarnings as any)

    render(<PreceptorDashboardPage />)

    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument()
    expect(screen.getByText('Active Students')).toBeInTheDocument()
    expect(screen.getByText('Payouts')).toBeInTheDocument()
    expect(screen.getByText('Total Earnings')).toBeInTheDocument()
  })

  it('shows loading panel while stats fetch resolves', () => {
    mockUseQuery
      .mockReturnValueOnce(mockUserDoc as any)
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce(mockEarnings as any)

    render(<PreceptorDashboardPage />)

    expect(screen.getByText('Loading your dashboard...')).toBeInTheDocument()
  })
})
