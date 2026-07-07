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
  batch?: "A1" | "A2" | "A3"
  elective?: "NLP" | "BDA"
}

export type AttendanceRecord = {
  subjectId: string
  totalLectures: number
  attendedLectures: number
}

// Theory subjects from the timetable
export const theorySubjects: Subject[] = [
  {
    id: "toc",
    code: "CEPCC501",
    name: "Theory of Computation",
    shortName: "TOC",
    faculty: "Prof. Manish R. Umale",
    facultyCode: "MRU",
    type: "theory",
  },
  {
    id: "ml",
    code: "CEPCC502",
    name: "Machine Learning",
    shortName: "ML",
    faculty: "Dr. Shital Dhamal",
    facultyCode: "SKD",
    type: "theory",
  },
  {
    id: "cn",
    code: "CEPCC503",
    name: "Computer Network",
    shortName: "CN",
    faculty: "Prof. Chitra S. Ramteke",
    facultyCode: "CSR",
    type: "theory",
  },
  {
    id: "pec_nlp",
    code: "CEPEC5011",
    name: "Program Elective Course I - Natural Language Processing",
    shortName: "PEC-I: NLP",
    faculty: "Dr. Shobha S. Lolge",
    facultyCode: "SSL",
    type: "theory",
  },
  {
    id: "pec_bda",
    code: "CEPEC5014",
    name: "Program Elective Course I - Big Data Analytics",
    shortName: "PEC-I: BDA",
    faculty: "Dr. Rakhi D. Akhare",
    facultyCode: "RDA",
    type: "theory",
  },
  {
    id: "dcst",
    code: "ETMDM501",
    name: "Multidisciplinary Minor Course II: Digital Communication & Sensor Technology",
    shortName: "MDM-II: DCST",
    faculty: "Prof. Kaikashan S.",
    facultyCode: "KSI",
    type: "theory",
  },
]

// Lab subjects
export const labSubjects: Subject[] = [
  {
    id: "comp_lab",
    code: "CEVSEC501",
    name: "Computational Lab",
    shortName: "Comp.Lab",
    faculty: "Prof. Chitra S. Ramteke, Prof. Pranjali V. Gurnule",
    facultyCode: "CSR/PVG",
    type: "lab",
  },
  {
    id: "mll",
    code: "CEPCL501",
    name: "Machine Learning Lab",
    shortName: "MLL",
    faculty: "Dr. Shital Dhamal",
    facultyCode: "SKD",
    type: "lab",
  },
  {
    id: "cnl",
    code: "CEPCL502",
    name: "Computer Network Lab",
    shortName: "CNL",
    faculty: "Prof. Chitra S. Ramteke",
    facultyCode: "CSR",
    type: "lab",
  },
  {
    id: "pecl_nlp",
    code: "CEPEL5011",
    name: "Program Elective Course Lab I - Natural Language Processing Lab",
    shortName: "PECL-I: NLPL",
    faculty: "Dr. Shobha S. Lolge",
    facultyCode: "SSL",
    type: "lab",
  },
  {
    id: "pecl_bda",
    code: "CEPEL5014",
    name: "Program Elective Course Lab I - Big Data Analytics Lab",
    shortName: "PECL-I: BDAL",
    faculty: "Dr. Rakhi D. Akhare",
    facultyCode: "RDA",
    type: "lab",
  },
  {
    id: "mdml_dcst",
    code: "ETMDML501",
    name: "Multidisciplinary Minor Lab II",
    shortName: "MDML-II",
    faculty: "Prof. Kaikashan S.",
    facultyCode: "KSI",
    type: "lab",
  },
]

// All subjects combined
export const subjects: Subject[] = [...theorySubjects, ...labSubjects]

// Weekly timetable - all batches and electives
export const weeklyTimetable: Omit<Lecture, "id" | "isAbsent" | "weekNumber" | "month" | "year">[] = [
  // Monday
  { subjectId: "cnl", day: "MON", startTime: "09:30", endTime: "11:30", room: "C-511", batch: "A3" },
  { subjectId: "comp_lab", day: "MON", startTime: "09:30", endTime: "11:30", room: "C-502", batch: "A1" },
  { subjectId: "pecl_bda", day: "MON", startTime: "09:30", endTime: "11:30", room: "C-602", batch: "A2", elective: "BDA" },
  { subjectId: "dcst", day: "MON", startTime: "11:30", endTime: "12:30" },
  { subjectId: "toc", day: "MON", startTime: "13:00", endTime: "14:00" },
  { subjectId: "cn", day: "MON", startTime: "14:00", endTime: "15:00" },
  { subjectId: "comp_lab", day: "MON", startTime: "15:00", endTime: "16:00" },

  // Tuesday
  { subjectId: "pec_nlp", day: "TUE", startTime: "09:30", endTime: "10:30", room: "C-607", elective: "NLP" },
  { subjectId: "pec_bda", day: "TUE", startTime: "09:30", endTime: "10:30", room: "C-508", elective: "BDA" },
  { subjectId: "ml", day: "TUE", startTime: "10:30", endTime: "11:30" },
  { subjectId: "dcst", day: "TUE", startTime: "11:30", endTime: "12:30" },
  { subjectId: "mll", day: "TUE", startTime: "13:00", endTime: "15:00", room: "C-612", batch: "A1" },
  { subjectId: "cnl", day: "TUE", startTime: "13:00", endTime: "15:00", room: "C-511", batch: "A2" },
  { subjectId: "pecl_bda", day: "TUE", startTime: "13:00", endTime: "15:00", room: "C-602", batch: "A3", elective: "BDA" },
  { subjectId: "comp_lab", day: "TUE", startTime: "15:00", endTime: "16:00" },

  // Wednesday
  { subjectId: "mll", day: "WED", startTime: "09:30", endTime: "11:30", room: "C-612", batch: "A2" },
  { subjectId: "cnl", day: "WED", startTime: "09:30", endTime: "11:30", room: "C-511", batch: "A1" },
  { subjectId: "mdml_dcst", day: "WED", startTime: "09:30", endTime: "11:30", room: "C-512", batch: "A3" },
  { subjectId: "pec_nlp", day: "WED", startTime: "11:30", endTime: "12:30", room: "C-607", elective: "NLP" },
  { subjectId: "pec_bda", day: "WED", startTime: "11:30", endTime: "12:30", room: "C-508", elective: "BDA" },
  { subjectId: "dcst", day: "WED", startTime: "13:00", endTime: "14:00" },
  { subjectId: "cn", day: "WED", startTime: "14:00", endTime: "15:00" },

  // Thursday
  { subjectId: "mdml_dcst", day: "THU", startTime: "09:30", endTime: "11:30", room: "C-512", batch: "A2" },
  { subjectId: "comp_lab", day: "THU", startTime: "09:30", endTime: "11:30", room: "C-511", batch: "A3" },
  { subjectId: "pecl_nlp", day: "THU", startTime: "09:30", endTime: "11:30", room: "C-611", batch: "A1", elective: "NLP" },
  { subjectId: "ml", day: "THU", startTime: "11:30", endTime: "12:30", room: "C-605" },
  { subjectId: "cn", day: "THU", startTime: "13:00", endTime: "14:00" },
  { subjectId: "toc", day: "THU", startTime: "14:00", endTime: "15:00" },

  // Friday
  { subjectId: "pec_nlp", day: "FRI", startTime: "09:30", endTime: "10:30", room: "C-607", elective: "NLP" },
  { subjectId: "pec_bda", day: "FRI", startTime: "09:30", endTime: "10:30", room: "C-508", elective: "BDA" },
  { subjectId: "ml", day: "FRI", startTime: "10:30", endTime: "11:30" },
  { subjectId: "toc", day: "FRI", startTime: "11:30", endTime: "12:30" },
  { subjectId: "comp_lab", day: "FRI", startTime: "13:00", endTime: "15:00", room: "C-511", batch: "A2" },
  { subjectId: "mll", day: "FRI", startTime: "13:00", endTime: "15:00", room: "C-612", batch: "A3" },
  { subjectId: "mdml_dcst", day: "FRI", startTime: "13:00", endTime: "15:00", room: "C-512", batch: "A1" },
]

interface AttendanceStats {
  bySubject: Map<string, AttendanceRecord>
  theory: { attended: number; total: number; percentage: number }
  lab: { attended: number; total: number; percentage: number }
  overall: { attended: number; total: number; percentage: number }
}

// Semester months (Term 1: Jan-May, Term 2: July-Nov)
export const SEMESTER_MONTHS = [
  { month: 0, year: 2026, label: "January 2026" },
  { month: 1, year: 2026, label: "February 2026" },
  { month: 2, year: 2026, label: "March 2026" },
  { month: 3, year: 2026, label: "April 2026" },
  { month: 4, year: 2026, label: "May 2026" },
  { month: 6, year: 2026, label: "July 2026" },
  { month: 7, year: 2026, label: "August 2026" },
  { month: 8, year: 2026, label: "September 2026" },
  { month: 9, year: 2026, label: "October 2026" },
  { month: 10, year: 2026, label: "November 2026" },
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
  selectedBatch: "A1" | "A2" | "A3"
  selectedElective: "NLP" | "BDA"

  // Actions
  login: (name: string, rollNo: string, division: string) => void
  logout: () => void
  toggleAbsent: (lectureId: string) => void
  setCurrentMonth: (month: number, year: number) => void
  toggleDarkMode: () => void
  setSelectedBatch: (batch: "A1" | "A2" | "A3") => void
  setSelectedElective: (elective: "NLP" | "BDA") => void
  initializeMonth: (month: number, year: number) => void
  getAttendanceStats: (filter?: { month?: number, year?: number, startMonth?: number, startYear?: number, endMonth?: number, endYear?: number }) => AttendanceStats
  statsMode: "monthly" | "overall"
  setStatsMode: (mode: "monthly" | "overall") => void
  mainView: "dashboard" | "attendance-marker" | "contact"
  setMainView: (view: "dashboard" | "attendance-marker" | "contact") => void
  rangeStartMonth: number
  rangeStartYear: number
  rangeEndMonth: number
  rangeEndYear: number
  setRange: (startMonth: number, startYear: number, endMonth: number, endYear: number) => void
  pendingChanges: Record<string, boolean> // id -> isAbsent
  setPendingChange: (lectureId: string, isAbsent: boolean) => void
  saveChanges: () => void
  hasPendingChanges: () => boolean
  discardChanges: () => void
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
      selectedBatch: "A3",
      selectedElective: "BDA",
      statsMode: "monthly",
      mainView: "dashboard",
      rangeStartMonth: SEMESTER_MONTHS[0].month,
      rangeStartYear: SEMESTER_MONTHS[0].year,
      rangeEndMonth: getCurrentMonth().month,
      rangeEndYear: getCurrentMonth().year,

      setStatsMode: (mode) => set({ statsMode: mode }),
      setMainView: (view) => set({ mainView: view }),
      setRange: (startMonth: number, startYear: number, endMonth: number, endYear: number) => {
        set({ rangeStartMonth: startMonth, rangeStartYear: startYear, rangeEndMonth: endMonth, rangeEndYear: endYear })
      },
      setSelectedBatch: (batch) => set({ selectedBatch: batch }),
      setSelectedElective: (elective) => set({ selectedElective: elective }),
      pendingChanges: {},
      setPendingChange: (id, isAbsent) => {
        set((state) => ({
          pendingChanges: { ...state.pendingChanges, [id]: isAbsent }
        }))
      },
      hasPendingChanges: () => {
        const { pendingChanges, lectures } = get()
        return Object.entries(pendingChanges).some(([id, isAbsent]) => {
          const lecture = lectures.find(l => l.id === id)
          return lecture && lecture.isAbsent !== isAbsent
        })
      },
      saveChanges: () => {
        const { pendingChanges, lectures } = get()
        const newLectures = lectures.map(l => {
          if (pendingChanges[l.id] !== undefined) {
            return { ...l, isAbsent: pendingChanges[l.id] }
          }
          return l
        })
        set({ lectures: newLectures, pendingChanges: {} })
      },
      discardChanges: () => {
        set({ pendingChanges: {} })
      },

      login: (name, rollNo, division) => {
        const current = getCurrentMonth()
        set({ 
          user: { name, rollNo, division }, 
          isAuthenticated: true,
          currentMonth: current.month,
          currentYear: current.year
        })
        // Initialize lectures for current month if not already done
        const state = get()
        if (state.lectures.filter((l) => l.month === current.month && l.year === current.year).length === 0) {
          state.initializeMonth(current.month, current.year)
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

      getAttendanceStats: (filter?: { month?: number, year?: number, startMonth?: number, startYear?: number, endMonth?: number, endYear?: number }) => {
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
          if (filter) {
            if (filter.month !== undefined && filter.year !== undefined) {
              if (lecture.month !== filter.month || lecture.year !== filter.year) return
            } else if (filter.startMonth !== undefined && filter.startYear !== undefined && filter.endMonth !== undefined && filter.endYear !== undefined) {
              const lectureDate = new Date(lecture.year, lecture.month)
              const startDate = new Date(filter.startYear, filter.startMonth)
              const endDate = new Date(filter.endYear, filter.endMonth)
              if (lectureDate < startDate || lectureDate > endDate) return
            }
          }
          
          const { selectedBatch, selectedElective } = get()
          if (lecture.batch && lecture.batch !== selectedBatch) return
          if (lecture.elective && lecture.elective !== selectedElective) return

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
      name: "attendance-storage-monthly-v3",
    }
  )
)
