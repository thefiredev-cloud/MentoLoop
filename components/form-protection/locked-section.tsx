'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock, Crown, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface LockedSectionProps {
  sectionTitle: string
  preview: string
  requiredTier: string[]
  userTier?: string | null
  className?: string
}

export default function LockedSection({ 
  sectionTitle, 
  preview, 
  requiredTier,
  userTier,
  className = '' 
}: LockedSectionProps) {
  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'starter':
      case 'core': return <Lock className="h-4 w-4" />
      case 'pro': return <Crown className="h-4 w-4" />
      case 'elite':
      case 'premium': return <Zap className="h-4 w-4" />
      default: return <Lock className="h-4 w-4" />
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'starter':
      case 'core':
        return 'bg-primary/10 text-primary border-primary/30'
      case 'pro':
        return 'bg-secondary/10 text-secondary-foreground border-secondary/30'
      case 'elite':
      case 'premium':
        return 'bg-accent/10 text-accent border-accent/30'
      default:
        return 'bg-muted/20 text-muted-foreground border-border/40'
    }
  }

  const getUpgradeMessage = () => {
    const normalizedRequired = requiredTier.map((tier) => tier === 'premium' ? 'elite' : tier);
    const normalizedUser = (userTier ? (userTier === 'premium' ? 'elite' : userTier) : null);

    if (normalizedRequired.includes('starter') || normalizedRequired.includes('core')) {
      return 'Complete your membership selection to unlock'
    }
    if (normalizedRequired.includes('pro') && ['starter', 'core'].includes(normalizedUser || '')) {
      return 'Upgrade to Pro or Elite to access this section'
    }
    if (normalizedRequired.includes('elite') && ['starter', 'core', 'pro'].includes(normalizedUser || '')) {
      return 'Upgrade to Elite to access this advanced section'
    }
    return 'Payment required to access this section'
  }

  const normalizedRequired = requiredTier.map((tier) => tier === 'premium' ? 'elite' : tier);
  const lowestTier = normalizedRequired.includes('starter') ? 'starter' :
                     normalizedRequired.includes('core') ? 'core' :
                     normalizedRequired.includes('pro') ? 'pro' : 'elite'

  return (
    <Card className={`relative ${className}`}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] rounded-lg z-10 flex items-center justify-center">
        <div className="text-center space-y-4 p-6">
          <div className="flex items-center justify-center space-x-2">
            {getTierIcon(lowestTier)}
            <Badge 
              variant="secondary" 
              className={getTierColor(lowestTier)}
            >
              {lowestTier.toUpperCase()} Required
            </Badge>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Protected Content</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {getUpgradeMessage()}
            </p>
          </div>

          <Link href="/student-intake#membership">
            <Button size="sm" className="mt-4">
              <Lock className="h-4 w-4 mr-2" />
              {userTier ? 'Upgrade Plan' : 'Complete Payment'}
            </Button>
          </Link>
        </div>
      </div>

      {/* Blurred content underneath */}
      <CardHeader className="opacity-40">
        <CardTitle className="flex items-center gap-2">
          {getTierIcon(lowestTier)}
          {sectionTitle}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 opacity-40">
        <p className="text-sm text-muted-foreground">
          {preview}
        </p>
        
        {/* Mock form fields to show structure */}
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="h-4 bg-muted/40 rounded w-1/4"></div>
            <div className="h-10 bg-muted/20 rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-muted/40 rounded w-1/3"></div>
            <div className="h-10 bg-muted/20 rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-muted/40 rounded w-1/5"></div>
            <div className="h-10 bg-muted/20 rounded"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
