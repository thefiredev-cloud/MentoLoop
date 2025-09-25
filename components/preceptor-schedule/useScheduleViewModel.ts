import { useCallback } from 'react'
import { type AvailabilityMap } from './types'

type TimeOffRequest = { startDate: string; endDate: string }
type UpcomingRotation = { startDate: string; endDate: string }

export function useScheduleViewModel(params: {
  availability: AvailabilityMap
  setAvailability: (updater: (prev: AvailabilityMap) => AvailabilityMap) => void
  timezone: string
  mockTimeOffRequests: TimeOffRequest[]
  mockUpcomingRotations: UpcomingRotation[]
  weekdayFromDate: (dateStr: string) => keyof AvailabilityMap
}) {
  const { availability, setAvailability, mockTimeOffRequests, mockUpcomingRotations, weekdayFromDate } = params

  const updateDay = useCallback(<K extends keyof AvailabilityMap, F extends keyof AvailabilityMap[K]>(
    dayKey: K,
    field: F,
    value: AvailabilityMap[K][F],
  ) => {
    setAvailability(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        [field]: value,
      },
    }))
  }, [setAvailability])

  const computeDayConflicts = useCallback((dayKey: keyof AvailabilityMap): string[] => {
    const msgs: string[] = []
    const day = availability[dayKey]
    if (!day.available) return msgs
    if ((day.currentStudents as number) >= (day.maxStudents as number)) {
      msgs.push('Capacity reached for this day')
    }
    for (const t of mockTimeOffRequests) {
      const start = new Date(t.startDate)
      const end = new Date(t.endDate)
      for (
        let d = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        d <= end;
        d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
      ) {
        const wk = weekdayFromDate(d.toISOString().slice(0, 10))
        if (wk === dayKey) {
          msgs.push('Time off overlaps this weekday window')
          break
        }
      }
    }
    const weekdayRotations = mockUpcomingRotations.filter(r => {
      const start = new Date(r.startDate)
      const end = new Date(r.endDate)
      for (
        let d = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        d <= end;
        d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
      ) {
        const wk = weekdayFromDate(d.toISOString().slice(0, 10))
        if (wk === dayKey) return true
      }
      return false
    })
    if (weekdayRotations.length > 0) {
      msgs.push(`${weekdayRotations.length} rotation(s) span this weekday`)
    }
    return msgs
  }, [availability, mockTimeOffRequests, mockUpcomingRotations, weekdayFromDate])

  return { updateDay, computeDayConflicts }
}


