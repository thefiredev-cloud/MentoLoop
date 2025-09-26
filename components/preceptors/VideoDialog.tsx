'use client'

import { Button } from '@/components/ui/button'
import type { VideoDialogState } from './types'

export default function VideoDialog({ open, onClose }: VideoDialogState) {
  if (!open) {
    return null
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl overflow-hidden rounded-xl bg-card shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex aspect-video items-center justify-center bg-muted text-sm text-muted-foreground">
          Video coming soon: Becoming a MentoLoop Preceptor
        </div>
        <div className="border-t border-border/50 p-4">
          <Button className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

