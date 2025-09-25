"use client"

import { type AvailabilityMap } from "./types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, X } from "lucide-react"

type Props = {
  day: { key: keyof AvailabilityMap; label: string }
  availability: AvailabilityMap
  validationErrors: Record<keyof AvailabilityMap, string>
  editingAvailability: boolean
  computeDayConflicts: (dayKey: keyof AvailabilityMap) => string[]
  updateDay: <K extends keyof AvailabilityMap, F extends keyof AvailabilityMap[K]>(dayKey: K, field: F, value: AvailabilityMap[K][F]) => void
}

export function PreceptorDayCard({ day, availability, validationErrors, editingAvailability, computeDayConflicts, updateDay }: Props) {
  const dayAvailability = availability[day.key]

  return (
    <Card key={day.key} className={`${!dayAvailability.available ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{day.label}</CardTitle>
          <div className="flex items-center gap-2">
            {dayAvailability.available ? (
              <Badge className="bg-accent text-accent-foreground">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Available
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-muted-foreground">
                <X className="h-3 w-3 mr-1" />
                Unavailable
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {validationErrors[day.key] && (
          <Alert variant="destructive">
            <AlertDescription className="text-xs">
              {validationErrors[day.key]}
            </AlertDescription>
          </Alert>
        )}
        {computeDayConflicts(day.key).length > 0 && (
          <Alert>
            <AlertDescription className="text-xs">
              {computeDayConflicts(day.key).join(' • ')}
            </AlertDescription>
          </Alert>
        )}
        {editingAvailability ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor={`available-${day.key}`}>Available</Label>
                <Switch
                  id={`available-${day.key}`}
                  checked={dayAvailability.available}
                  onCheckedChange={(checked) => updateDay(day.key, 'available', checked)}
                />
              </div>
            </div>

            {dayAvailability.available ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor={`start-${day.key}`}>Start</Label>
                  <Input id={`start-${day.key}`} type="time" value={dayAvailability.startTime} onChange={(e) => updateDay(day.key, 'startTime', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`end-${day.key}`}>End</Label>
                  <Input id={`end-${day.key}`} type="time" value={dayAvailability.endTime} onChange={(e) => updateDay(day.key, 'endTime', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`max-${day.key}`}>Max Students</Label>
                  <Select value={String(dayAvailability.maxStudents)} onValueChange={(v) => updateDay(day.key, 'maxStudents', Number(v) as unknown as typeof dayAvailability.maxStudents)}>
                    <SelectTrigger id={`max-${day.key}`}>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4].map(n => (<SelectItem key={n} value={String(n)}>{n}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`notes-${day.key}`}>Notes</Label>
                  <Textarea id={`notes-${day.key}`} value={dayAvailability.notes} onChange={(e) => updateDay(day.key, 'notes', e.target.value)} rows={2} />
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
            <div>Time: {dayAvailability.available ? `${dayAvailability.startTime} – ${dayAvailability.endTime}` : '—'}</div>
            <div>Capacity: {dayAvailability.available ? `${dayAvailability.currentStudents}/${dayAvailability.maxStudents}` : '—'}</div>
            <div className="col-span-2">{dayAvailability.notes || 'No notes'}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


