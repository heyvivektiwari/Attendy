import { create } from "zustand"
import { persist } from "zustand/middleware"

export type Subject = {
  id: string
  code: string
  name: string
  shortName: string
  faculty: string
  facultyCode: string
  type: "theory" | "lab"
}

export type Lecture = {
  id: string
  subjectId: string
  day: "MON" | "TUE" | "WED" | "THU" | "FRI"
  startTime: string
  endTime: string
  room?: string
  isAbsent: boolean
  weekNumber: number
  month: number // 0-indexed month (0=Jan, 1=Feb, etc.)
  year: number
}

export type AttendanceRecord = {
  subjectId: string
  totalLectures: number
  attendedLectures: number
}

// Theory subjects from the timetable
export const theorySubjects: Subject[] = [
  {
    id: "dsgt",
    code: "CEPCC401",
    name: "Discrete Mathematics & Graph Theory",
    shortName: "DSGT",
    faculty: "Prof. Dipika Matke",
    facultyCode: "DM",
    type: "theory",
  },
  {
    id: "dbms",
    code: "CEPCC402",
    name: "Database Management System",
    shortName: "DBMS",
    faculty: "Dr. Sheeba P.S.",
    facultyCode: "SPS",
    type: "theory",
  },
  {
    id: "os",
    code: "CEPCC403",
    name: "Operating System",
    shortName: "OS",
    faculty: "Dr. Shital K. Dhamal",
    facultyCode: "SKD",
    type: "theory",
  },
  {
    id: "mpmc",
    code: "ETMDM401",
    name: "Microprocessor & Microcontroller",
    shortName: "MPMC",
    faculty: "Prof. Sanjay D. Naravadkar",
    facultyCode: "SDN",
    type: "theory",
  },
  {
    id: "smpf",
    code: "OE4013",
    name: "Stock Market & Personal Finance",
    shortName: "OE-II: SMPF",
    faculty: "Dr. Smita A. Attarde",
    facultyCode: "SAA",
    type: "theory",
  },
  {
    id: "dbm",
    code: "EEMC401",
    name: "Digital Business Management",
    shortName: "DBM",
    faculty: "Prof. Shobha S. Lolge",
    facultyCode: "SSL",
    type: "theory",
  },
  {
    id: "bcs",
    code: "VEC401",
    name: "Business Communication Skills",
    shortName: "BCS",
    faculty: "Dr. G. Geetha",
    facultyCode: "GG",
    type: "theory",
  },
]

// Lab subjects - A3 batch only
export const labSubjects: Subject[] = [
  {
    id: "bcsl",
    code: "VEC401",
    name: "Business Communication Skills Lab",
    shortName: "BCSL",
    faculty: "Dr. G. Geetha",
    facultyCode: "GG",
    type: "lab",
  },
  {
    id: "dbmsl",
    code: "CEPCL402",
    name: "DBMS Lab",
    shortName: "DBMSL",
    faculty: "Prof. Rajnandini Kumawat",
    facultyCode: "RK",
    type: "lab",
  },
  {
    id: "osl",
    code: "CEPCL403",
    name: "Operating System Lab",
    shortName: "OSL",
    faculty: "Dr. Shital K. Dhamal",
    facultyCode: "SKD",
    type: "lab",
  },
  {
    id: "mpmcl",
    code: "ETMDML401",
    name: "Microprocessor Lab",
    shortName: "MPMCL",
    faculty: "Prof. Sanjay D. Naravadkar",
    facultyCode: "SDN",
    type: "lab",
  },
]

// All subjects combined
export const subjects: Subject[] = [...theorySubjects, ...labSubjects]

// Weekly timetable - A3 batch only (filtered labs)
export const weeklyTimetable: Omit<Lecture, "id" | "isAbsent" | "weekNumber" | "month" | "year">[] = [
  // Monday - Theory + BCSL Lab for A3
  { subjectId: "mpmc", day: "MON", startTime: "09:30", endTime: "10:30" },
  { subjectId: "bcsl", day: "MON", startTime: "10:30", endTime: "12:30", room: "A-410" }, // A3 batch lab
  { subjectId: "smpf", day: "MON", startTime: "13:00", endTime: "14:00" },
  { subjectId: "os", day: "MON", startTime: "14:00", endTime: "15:00" },
  { subjectId: "dbm", day: "MON", startTime: "15:00", endTime: "16:00" },

  // Tuesday - Theory only (Mini Project slot, no lab)
  { subjectId: "dsgt", day: "TUE", startTime: "09:30", endTime: "10:30" },
  { subjectId: "dbms", day: "TUE", startTime: "10:30", endTime: "11:30" },
  { subjectId: "mpmc", day: "TUE", startTime: "11:30", endTime: "12:30" },
  { subjectId: "smpf", day: "TUE", startTime: "13:00", endTime: "14:00" },

  // Wednesday - DBMSL Lab for A3 + Theory
  { subjectId: "dbmsl", day: "WED", startTime: "09:30", endTime: "11:30", room: "C-511" }, // A3 batch lab
  { subjectId: "dbm", day: "WED", startTime: "11:30", endTime: "12:30" },
  { subjectId: "os", day: "WED", startTime: "13:00", endTime: "14:00" },
  { subjectId: "bcs", day: "WED", startTime: "14:00", endTime: "15:00" },
  { subjectId: "dsgt", day: "WED", startTime: "15:00", endTime: "16:00" },

  // Thursday - OSL Lab for A3 + Theory
  { subjectId: "bcs", day: "THU", startTime: "09:30", endTime: "10:30" },
  { subjectId: "dbms", day: "THU", startTime: "10:30", endTime: "11:30" },
  { subjectId: "osl", day: "THU", startTime: "11:30", endTime: "13:30", room: "C-612" }, // A3 batch lab
  // Break: 13:30 - 14:00
  { subjectId: "mpmc", day: "THU", startTime: "14:00", endTime: "15:00" },

  // Friday - MPMCL Lab for A3 + Theory
  { subjectId: "os", day: "FRI", startTime: "09:30", endTime: "10:30" },
  { subjectId: "dbms", day: "FRI", startTime: "10:30", endTime: "11:30" },
  { subjectId: "dsgt", day: "FRI", startTime: "11:30", endTime: "12:30" },
  { subjectId: "mpmcl", day: "FRI", startTime: "13:00", endTime: "15:00", room: "C-702" }, // A3 batch lab
]

interface AttendanceStats {
  bySubject: Map<string, AttendanceRecord>
  theory: { attended: number; total: number; percentage: number }
  lab: { attended: number; total: number; percentage: number }
  overall: { attended: number; total: number; percentage: number }
}

// Semester months (Jan 2026 to Apr 2026)
export const SEMESTER_MONTHS = [
  { month: 0, year: 2026, label: "January 2026" },
  { month: 1, year: 2026, label: "February 2026" },
  { month: 2, year: 2026, label: "March 2026" },
  { month: 3, year: 2026, label: "April 2026" },
]

export function getMonthLabel(month: number, year: number): string {
  const entry = SEMESTER_MONTHS.find(m => m.month === month && m.year === year)
  return entry?.label || new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export function getMonthIndex(month: number, year: number): number {
  return SEMESTER_MONTHS.findIndex(m => m.month === month && m.year === year)
}

interface AttendanceState {
  lectures: Lecture[]
  currentMonth: number // 0-indexed month
  currentYear: number
  user: { name: string; rollNo: string; division: string } | null
  isAuthenticated: boolean
  isDarkMode: boolean

  // Actions
  login: (name: string, rollNo: string, division: string) => void
  logout: () => void
  toggleAbsent: (lectureId: string) => void
  setCurrentMonth: (month: number, year: number) => void
  toggleDarkMode: () => void
  initializeMonth: (month: number, year: number) => void
  getAttendanceStats: (monthFilter?: number, yearFilter?: number) => AttendanceStats
}

// Get all weekdays (Mon-Fri) in a given month
function getWeekdaysInMonth(month: number, year: number): Date[] {
  const dates: Date[] = []
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const dayOfWeek = date.getDay() // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      dates.push(date)
    }
  }
  return dates
}

// Map JS day-of-week (1=Mon..5=Fri) to our day codes
const dayCodeMap: Record<number, "MON" | "TUE" | "WED" | "THU" | "FRI"> = {
  1: "MON",
  2: "TUE",
  3: "WED",
  4: "THU",
  5: "FRI",
}

// Get the week number within a month for a given date (1-based)
function getWeekOfMonth(date: Date): number {
  const month = date.getMonth()
  const year = date.getFullYear()
  const targetDay = date.getDate()
  
  let currentWeekNum = 1
  let currentWeekStart = false
  
  for (let day = 1; day <= targetDay; day++) {
    const d = new Date(year, month, day)
    const dayOfWeek = d.getDay()
    
    // Skip weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) continue
    
    // Start new week on Monday
    if (dayOfWeek === 1 || !currentWeekStart) {
      if (currentWeekStart) {
        currentWeekNum++
      }
      currentWeekStart = true
    }
  }
  return currentWeekNum
}

const generateLecturesForMonth = (month: number, year: number): Lecture[] => {
  const weekdays = getWeekdaysInMonth(month, year)
  const lectures: Lecture[] = []
  
  weekdays.forEach((date) => {
    const dayCode = dayCodeMap[date.getDay()]
    if (!dayCode) return
    
    const weekNum = getWeekOfMonth(date)
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    
    // Get timetable entries for this day
    const dayLectures = weeklyTimetable.filter(l => l.day === dayCode)
    
    dayLectures.forEach((lecture, index) => {
      lectures.push({
        ...lecture,
        id: `${dateStr}-${lecture.day}-${lecture.subjectId}-${index}`,
        isAbsent: false,
        weekNumber: weekNum,
        month,
        year,
      })
    })
  })
  
  return lectures
}

// Get current month/year
const getCurrentMonth = (): { month: number; year: number } => {
  const now = new Date()
  // Clamp to semester range
  const semMonth = SEMESTER_MONTHS.find(m => m.month === now.getMonth() && m.year === now.getFullYear())
  if (semMonth) {
    return { month: semMonth.month, year: semMonth.year }
  }
  // Default to last month in semester if current date is past semester
  const last = SEMESTER_MONTHS[SEMESTER_MONTHS.length - 1]
  return { month: last.month, year: last.year }
}

export const useAttendanceStore = create<AttendanceState>()(
  persist(
    (set, get) => ({
      lectures: [],
      currentMonth: getCurrentMonth().month,
      currentYear: getCurrentMonth().year,
      user: null,
      isAuthenticated: false,
      isDarkMode: true,

      login: (name, rollNo, division) => {
        set({ user: { name, rollNo, division }, isAuthenticated: true })
        // Initialize lectures for current month if not already done
        const state = get()
        if (state.lectures.filter((l) => l.month === state.currentMonth && l.year === state.currentYear).length === 0) {
          state.initializeMonth(state.currentMonth, state.currentYear)
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
      },

      toggleAbsent: (lectureId) => {
        set((state) => ({
          lectures: state.lectures.map((l) => (l.id === lectureId ? { ...l, isAbsent: !l.isAbsent } : l)),
        }))
      },

      setCurrentMonth: (month, year) => {
        set({ currentMonth: month, currentYear: year })
        const state = get()
        if (state.lectures.filter((l) => l.month === month && l.year === year).length === 0) {
          state.initializeMonth(month, year)
        }
      },

      toggleDarkMode: () => {
        set((state) => ({ isDarkMode: !state.isDarkMode }))
      },

      initializeMonth: (month, year) => {
        const newLectures = generateLecturesForMonth(month, year)
        set((state) => ({
          lectures: [...state.lectures.filter((l) => !(l.month === month && l.year === year)), ...newLectures],
        }))
      },

      getAttendanceStats: (monthFilter?: number, yearFilter?: number) => {
        const { lectures } = get()
        const bySubject = new Map<string, AttendanceRecord>()

        // Initialize all subjects
        subjects.forEach((subject) => {
          bySubject.set(subject.id, {
            subjectId: subject.id,
            totalLectures: 0,
            attendedLectures: 0,
          })
        })

        // Calculate stats based on filters 
        lectures.forEach((lecture) => {
          if (monthFilter !== undefined && yearFilter !== undefined) {
             if (lecture.month !== monthFilter || lecture.year !== yearFilter) return
          }
          
          const record = bySubject.get(lecture.subjectId)
          if (record) {
            record.totalLectures++
            if (!lecture.isAbsent) {
              record.attendedLectures++
            }
          }
        })

        // Calculate theory stats
        let theoryAttended = 0
        let theoryTotal = 0
        theorySubjects.forEach((subject) => {
          const record = bySubject.get(subject.id)
          if (record) {
            theoryAttended += record.attendedLectures
            theoryTotal += record.totalLectures
          }
        })

        // Calculate lab stats
        let labAttended = 0
        let labTotal = 0
        labSubjects.forEach((subject) => {
          const record = bySubject.get(subject.id)
          if (record) {
            labAttended += record.attendedLectures
            labTotal += record.totalLectures
          }
        })

        // Calculate overall
        const totalAttended = theoryAttended + labAttended
        const totalLectures = theoryTotal + labTotal

        return {
          bySubject,
          theory: {
            attended: theoryAttended,
            total: theoryTotal,
            percentage: theoryTotal > 0 ? Math.round((theoryAttended / theoryTotal) * 100) : 100,
          },
          lab: {
            attended: labAttended,
            total: labTotal,
            percentage: labTotal > 0 ? Math.round((labAttended / labTotal) * 100) : 100,
          },
          overall: {
            attended: totalAttended,
            total: totalLectures,
            percentage: totalLectures > 0 ? Math.round((totalAttended / totalLectures) * 100) : 100,
          },
        }
      },
    }),
    {
      name: "attendance-storage-monthly-v2",
    }
  )
)
