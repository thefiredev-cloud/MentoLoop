export type DayAvailability = {
  available: boolean
  startTime: string
  endTime: string
  maxStudents: number
  currentStudents: number
  notes: string
}

export type AvailabilityMap = {
  monday: DayAvailability
  tuesday: DayAvailability
  wednesday: DayAvailability
  thursday: DayAvailability
  friday: DayAvailability
  saturday: DayAvailability
  sunday: DayAvailability
}

export const DEFAULT_AVAILABILITY: AvailabilityMap = {
  monday: { available: true, startTime: "08:00", endTime: "17:00", maxStudents: 2, currentStudents: 1, notes: "Family practice clinic hours" },
  tuesday: { available: true, startTime: "08:00", endTime: "17:00", maxStudents: 2, currentStudents: 2, notes: "Family practice clinic hours" },
  wednesday: { available: true, startTime: "08:00", endTime: "17:00", maxStudents: 2, currentStudents: 1, notes: "Family practice clinic hours" },
  thursday: { available: true, startTime: "08:00", endTime: "17:00", maxStudents: 2, currentStudents: 1, notes: "Family practice clinic hours" },
  friday: { available: false, startTime: "08:00", endTime: "17:00", maxStudents: 0, currentStudents: 0, notes: "Administrative day - no students" },
  saturday: { available: false, startTime: "", endTime: "", maxStudents: 0, currentStudents: 0, notes: "" },
  sunday: { available: false, startTime: "", endTime: "", maxStudents: 0, currentStudents: 0, notes: "" }
}

export const weekdayFromDate = (dateStr: string): keyof AvailabilityMap => {
  const d = new Date(dateStr)
  const idx = d.getDay() // 0 Sun ... 6 Sat
  const map: Record<number, keyof AvailabilityMap> = {
    0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday', 6: 'saturday'
  }
  return map[idx]
}


