'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LucideIcon } from "lucide-react"
import Link from "next/link"

interface QuickAction {
  id: string
  title: string
  description: string
  icon: LucideIcon
  href: string
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost'
  badge?: {
    text: string
    variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  }
  disabled?: boolean
}

interface QuickActionsProps {
  title?: string
  actions: QuickAction[]
  columns?: 1 | 2 | 3 | 4
}

export function QuickActions({ 
  title = "Quick Actions", 
  actions, 
  columns = 2 
}: QuickActionsProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`grid gap-3 ${gridClasses[columns]}`}>
          {actions.map((action) => (
            <Button
              key={action.id}
              asChild
              variant={action.variant || 'outline'}
              className="h-auto p-4 flex flex-col items-start gap-2 text-left"
              disabled={action.disabled}
            >
              <Link href={action.disabled ? '#' : action.href}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <action.icon className="h-5 w-5" />
                    <span className="font-medium">{action.title}</span>
                  </div>
                  {action.badge && (
                    <Badge 
                      variant={action.badge.variant || 'default'} 
                      className="text-xs"
                    >
                      {action.badge.text}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {action.description}
                </p>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}