import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StudentDashboardPage from '@/app/dashboard/student/page'

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
}))

// Mock Convex hooks
const mockUseQuery = vi.fn()

vi.mock('convex/react', () => ({
  useQuery: mockUseQuery
}))

// Mock dashboard components
vi.mock('@/components/dashboard/stats-card', () => ({
  StatsCard: ({ title, value, description, icon }: any) => (
    <div data-testid="stats-card">
      <div>{title}</div>
      <div>{value}</div>
      <div>{description}</div>
    </div>
  )
}))

vi.mock('@/components/dashboard/activity-feed', () => ({
  ActivityFeed: ({ activities }: { activities: any[] }) => (
    <div data-testid="activity-feed">
      {activities?.map((activity, index) => (
        <div key={index} data-testid="activity-item">
          {activity.description}
        </div>
      ))}
    </div>
  )
}))

vi.mock('@/components/dashboard/quick-actions', () => ({
  QuickActions: ({ actions }: { actions: any[] }) => (
    <div data-testid="quick-actions">
      {actions?.map((action) => (
        <button key={action.id} data-testid={`action-${action.id}`}>
          {action.title}
        </button>
      ))}
    </div>
  )
}))

vi.mock('@/components/dashboard/notification-panel', () => ({
  NotificationPanel: ({ notifications }: { notifications: any[] }) => (
    <div data-testid="notification-panel">
      {notifications?.map((notification, index) => (
        <div key={index} data-testid="notification-item">
          {notification.message}
        </div>
      ))}
    </div>
  )
}))

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h3>{children}</h3>
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, ...props }: any) => (
    <button onClick={onClick} className={`btn-${variant}`} {...props}>
      {children}
    </button>
  )
}))

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant }: any) => (
    <span className={`badge-${variant}`}>{children}</span>
  )
}))

// Mock data
const mockDashboardStats = {
  student: {
    _id: 'student123',
    profile: {
      firstName: 'John',
      lastName: 'Student',
      specialty: 'family-medicine',
      school: 'University of Texas',
      expectedGraduation: '2025-05-15'
    },
    preferences: {
      rotationLength: 8,
      hoursPerWeek: 40,
      maxCommute: 30
    }
  },
  user: {
    _id: 'user123',
    firstName: 'John',
    lastName: 'Student',
    email: 'john.student@example.com'
  },
  currentMatch: {
    _id: 'match123',
    status: 'active',
    preceptor: {
      profile: {
        firstName: 'Dr. Jane',
        lastName: 'Preceptor',
        specialty: 'family-medicine'
      }
    },
    rotationDetails: {
      startDate: '2025-02-01',
      endDate: '2025-04-01',
      hoursPerWeek: 40
    }
  },
  stats: {
    totalMatches: 3,
    activeRotations: 1,
    completedHours: 240,
    totalRequiredHours: 320,
    upcomingAppointments: 2,
    unreadMessages: 5
  }
}

const mockRecentActivity = [
  {
    _id: 'activity1',
    type: 'match_created',
    description: 'New match with Dr. Jane Preceptor',
    timestamp: Date.now() - 3600000, // 1 hour ago
    metadata: {
      preceptorName: 'Dr. Jane Preceptor'
    }
  },
  {
    _id: 'activity2',
    type: 'hours_logged',
    description: 'Logged 8 hours for Family Medicine rotation',
    timestamp: Date.now() - 86400000, // 1 day ago
    metadata: {
      hours: 8,
      rotationType: 'family-medicine'
    }
  }
]

const mockNotifications = [
  {
    _id: 'notif1',
    type: 'match_pending',
    message: 'You have a new match request waiting for your response',
    priority: 'high',
    isRead: false,
    createdAt: Date.now() - 1800000 // 30 minutes ago
  },
  {
    _id: 'notif2',
    type: 'rotation_reminder',
    message: 'Your rotation with Dr. Preceptor starts in 3 days',
    priority: 'medium',
    isRead: false,
    createdAt: Date.now() - 259200000 // 3 days ago
  }
]

describe('StudentDashboardPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mock returns
    mockUseQuery
      .mockReturnValueOnce(mockDashboardStats) // getStudentDashboardStats
      .mockReturnValueOnce(mockRecentActivity) // getStudentRecentActivity
      .mockReturnValueOnce(mockNotifications) // getStudentNotifications
  })

  it('renders loading state when dashboard stats are not available', () => {
    mockUseQuery
      .mockReturnValueOnce(undefined) // getStudentDashboardStats loading
      .mockReturnValueOnce(mockRecentActivity)
      .mockReturnValueOnce(mockNotifications)

    render(<StudentDashboardPage />)

    expect(screen.getByText('Loading your dashboard...')).toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument() // Loading spinner
  })

  it('renders student dashboard with all sections', () => {
    render(<StudentDashboardPage />)

    // Should show welcome message
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
    expect(screen.getByText('John Student')).toBeInTheDocument()

    // Should show stats cards
    expect(screen.getByTestId('stats-card')).toBeInTheDocument()

    // Should show activity feed
    expect(screen.getByTestId('activity-feed')).toBeInTheDocument()

    // Should show quick actions
    expect(screen.getByTestId('quick-actions')).toBeInTheDocument()

    // Should show notifications
    expect(screen.getByTestId('notification-panel')).toBeInTheDocument()
  })

  it('displays current match information when available', () => {
    render(<StudentDashboardPage />)

    expect(screen.getByText(/current rotation/i)).toBeInTheDocument()
    expect(screen.getByText('Dr. Jane Preceptor')).toBeInTheDocument()
    expect(screen.getByText('family-medicine')).toBeInTheDocument()
  })

  it('shows progress indicators for rotation hours', () => {
    render(<StudentDashboardPage />)

    expect(screen.getByText('240')).toBeInTheDocument() // completed hours
    expect(screen.getByText('320')).toBeInTheDocument() // total required hours
    expect(screen.getByText(/75%/)).toBeInTheDocument() // progress percentage
  })

  it('displays recent activity correctly', () => {
    render(<StudentDashboardPage />)

    expect(screen.getByText('New match with Dr. Jane Preceptor')).toBeInTheDocument()
    expect(screen.getByText('Logged 8 hours for Family Medicine rotation')).toBeInTheDocument()
  })

  it('shows notifications with appropriate priorities', () => {
    render(<StudentDashboardPage />)

    expect(screen.getByText('You have a new match request waiting for your response')).toBeInTheDocument()
    expect(screen.getByText('Your rotation with Dr. Preceptor starts in 3 days')).toBeInTheDocument()
  })

  it('handles case when no current match exists', () => {
    const statsWithoutMatch = {
      ...mockDashboardStats,
      currentMatch: null
    }

    mockUseQuery
      .mockReturnValueOnce(statsWithoutMatch)
      .mockReturnValueOnce(mockRecentActivity)
      .mockReturnValueOnce(mockNotifications)

    render(<StudentDashboardPage />)

    expect(screen.getByText(/no active rotation/i)).toBeInTheDocument()
    expect(screen.getByText(/find preceptors/i)).toBeInTheDocument()
  })

  it('provides quick action buttons for common tasks', () => {
    render(<StudentDashboardPage />)

    expect(screen.getByTestId('action-matches')).toBeInTheDocument()
    expect(screen.getByTestId('action-hours')).toBeInTheDocument()
    expect(screen.getByTestId('action-messages')).toBeInTheDocument()
    expect(screen.getByTestId('action-search')).toBeInTheDocument()
  })

  it('shows appropriate badges for match status', () => {
    render(<StudentDashboardPage />)

    // Should show active status badge
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('displays upcoming deadlines and reminders', () => {
    render(<StudentDashboardPage />)

    expect(screen.getByText(/upcoming/i)).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument() // upcoming appointments
  })

  it('handles empty activity feed gracefully', () => {
    mockUseQuery
      .mockReturnValueOnce(mockDashboardStats)
      .mockReturnValueOnce([]) // empty activity
      .mockReturnValueOnce(mockNotifications)

    render(<StudentDashboardPage />)

    expect(screen.getByTestId('activity-feed')).toBeInTheDocument()
    expect(screen.queryByTestId('activity-item')).not.toBeInTheDocument()
  })

  it('handles empty notifications gracefully', () => {
    mockUseQuery
      .mockReturnValueOnce(mockDashboardStats)
      .mockReturnValueOnce(mockRecentActivity)
      .mockReturnValueOnce([]) // empty notifications

    render(<StudentDashboardPage />)

    expect(screen.getByTestId('notification-panel')).toBeInTheDocument()
    expect(screen.queryByTestId('notification-item')).not.toBeInTheDocument()
  })

  it('shows unread message count', () => {
    render(<StudentDashboardPage />)

    expect(screen.getByText('5')).toBeInTheDocument() // unread messages count
  })

  it('displays specialty information correctly', () => {
    render(<StudentDashboardPage />)

    expect(screen.getByText('family-medicine')).toBeInTheDocument()
  })

  it('shows school and graduation information', () => {
    render(<StudentDashboardPage />)

    expect(screen.getByText('University of Texas')).toBeInTheDocument()
    expect(screen.getByText(/2025/)).toBeInTheDocument()
  })

  it('calculates and displays progress percentages correctly', () => {
    render(<StudentDashboardPage />)

    // 240 completed out of 320 total = 75%
    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('provides navigation links to relevant pages', () => {
    render(<StudentDashboardPage />)

    expect(screen.getByRole('link', { name: /view my matches/i })).toHaveAttribute('href', '/dashboard/student/matches')
    expect(screen.getByRole('link', { name: /log hours/i })).toHaveAttribute('href', '/dashboard/student/hours')
    expect(screen.getByRole('link', { name: /messages/i })).toHaveAttribute('href', '/dashboard/messages')
  })

  it('shows rotation timeline information', () => {
    render(<StudentDashboardPage />)

    expect(screen.getByText(/feb.*apr/i)).toBeInTheDocument() // rotation dates
    expect(screen.getByText('40')).toBeInTheDocument() // hours per week
  })

  it('handles missing student profile data gracefully', () => {
    const incompleteStats = {
      ...mockDashboardStats,
      student: {
        ...mockDashboardStats.student,
        profile: {
          firstName: 'John',
          // Missing other fields
        }
      }
    }

    mockUseQuery
      .mockReturnValueOnce(incompleteStats)
      .mockReturnValueOnce(mockRecentActivity)
      .mockReturnValueOnce(mockNotifications)

    render(<StudentDashboardPage />)

    expect(screen.getByText('John')).toBeInTheDocument()
    // Should not crash with missing data
  })
})