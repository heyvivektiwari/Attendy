import { create } from "zustand"
import { persist } from "zustand/middleware"

export type Branch = "Computer" | "DataScience"

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
  branch?: Branch
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

// =============================================
// DATA SCIENCE BRANCH SUBJECTS
// =============================================
export const dsTheorySubjects: Subject[] = [
  {
    id: "ds_ai",
    code: "DS-AI",
    name: "Artificial Intelligence",
    shortName: "AI",
    faculty: "Prof. Vrushali Bendre",
    facultyCode: "VB",
    type: "theory",
  },
  {
    id: "ds_ml",
    code: "DS-ML",
    name: "Machine Learning",
    shortName: "ML",
    faculty: "Prof. Dr Ranjana Kumari",
    facultyCode: "RK",
    type: "theory",
  },
  {
    id: "ds_sdav",
    code: "DS-SDAV",
    name: "Statistical Data Analysis and Visualization",
    shortName: "SDAV",
    faculty: "Prof. Shradha Chaudhari",
    facultyCode: "SC",
    type: "theory",
  },
  {
    id: "ds_cns",
    code: "DS-CNS",
    name: "Computer Network & Security",
    shortName: "CNS",
    faculty: "Prof. Yogita Gawde",
    facultyCode: "YG",
    type: "theory",
  },
  {
    id: "ds_dcst",
    code: "DS-DCST",
    name: "Digital Communication & Sensor Technology",
    shortName: "DCST",
    faculty: "Prof. Shraddha Kunkunkar",
    facultyCode: "SK",
    type: "theory",
  },
]

export const dsLabSubjects: Subject[] = [
  {
    id: "ds_uiux",
    code: "DS-UIUX",
    name: "UI & UX Design",
    shortName: "UI&UX",
    faculty: "Prof. Sapna Bhuskute",
    facultyCode: "SB",
    type: "lab",
  },
  {
    id: "ds_aiml",
    code: "DS-AIML",
    name: "Artificial Intelligence & Machine Learning Lab",
    shortName: "AIML",
    faculty: "Prof. Vrushali Bendre",
    facultyCode: "VB",
    type: "lab",
  },
  {
    id: "ds_cns_lab",
    code: "DS-CNSL",
    name: "Computer Network & Security Lab",
    shortName: "CNS Lab",
    faculty: "Prof. Yogita Gawde",
    facultyCode: "YG",
    type: "lab",
  },
  {
    id: "ds_sdav_lab",
    code: "DS-SDAVL",
    name: "Statistical Data Analysis & Visualization Lab",
    shortName: "SDAV Lab",
    faculty: "Prof. Shradha Chaudhari",
    facultyCode: "SC",
    type: "lab",
  },
  {
    id: "ds_dcst_lab",
    code: "DS-DCSTL",
    name: "Digital Communication & Sensor Technology Lab",
    shortName: "DCST Lab",
    faculty: "Prof. Shraddha Kunkunkar",
    facultyCode: "SK",
    type: "lab",
  },
]

// All DS subjects combined
export const dsSubjects: Subject[] = [...dsTheorySubjects, ...dsLabSubjects]

// =============================================
// DATA SCIENCE WEEKLY TIMETABLE (AY 2026-27 ODD, TE_SEM_V)
// Batches: A1, A2, A3 for labs
// =============================================
export const dsWeeklyTimetable: Omit<Lecture, "id" | "isAbsent" | "weekNumber" | "month" | "year">[] = [
  // Monday
  { subjectId: "ds_dcst",    day: "MON", startTime: "09:30", endTime: "10:30", branch: "DataScience" },
  { subjectId: "ds_ai",      day: "MON", startTime: "10:30", endTime: "11:30", branch: "DataScience" },
  { subjectId: "ds_cns",     day: "MON", startTime: "11:30", endTime: "12:30", branch: "DataScience" },
  { subjectId: "ds_sdav",    day: "MON", startTime: "13:00", endTime: "14:00", branch: "DataScience" },
  { subjectId: "ds_aiml",    day: "MON", startTime: "14:00", endTime: "16:00", room: "C-305", batch: "A1", branch: "DataScience" },
  { subjectId: "ds_uiux",    day: "MON", startTime: "14:00", endTime: "16:00", room: "C-311", batch: "A2", branch: "DataScience" },
  { subjectId: "ds_cns_lab", day: "MON", startTime: "14:00", endTime: "16:00", room: "C-302", batch: "A3", branch: "DataScience" },

  // Tuesday
  { subjectId: "ds_uiux",     day: "TUE", startTime: "09:30", endTime: "11:30", room: "C-307", batch: "A1", branch: "DataScience" },
  { subjectId: "ds_dcst_lab", day: "TUE", startTime: "09:30", endTime: "11:30", room: "C-305", batch: "A2", branch: "DataScience" },
  { subjectId: "ds_sdav_lab", day: "TUE", startTime: "09:30", endTime: "11:30", room: "C-308", batch: "A3", branch: "DataScience" },
  { subjectId: "ds_sdav",     day: "TUE", startTime: "11:30", endTime: "12:30", branch: "DataScience" },
  { subjectId: "ds_ai",       day: "TUE", startTime: "13:00", endTime: "14:00", branch: "DataScience" },
  { subjectId: "ds_ml",       day: "TUE", startTime: "14:00", endTime: "15:00", branch: "DataScience" },
  { subjectId: "ds_dcst",     day: "TUE", startTime: "15:00", endTime: "16:00", branch: "DataScience" },

  // Wednesday
  { subjectId: "ds_sdav",     day: "WED", startTime: "09:30", endTime: "10:30", branch: "DataScience" },
  { subjectId: "ds_dcst_lab", day: "WED", startTime: "10:30", endTime: "12:30", room: "C-302", batch: "A1", branch: "DataScience" },
  { subjectId: "ds_aiml",     day: "WED", startTime: "10:30", endTime: "12:30", room: "C-305", batch: "A2", branch: "DataScience" },
  { subjectId: "ds_uiux",     day: "WED", startTime: "10:30", endTime: "12:30", room: "C-307", batch: "A3", branch: "DataScience" },
  { subjectId: "ds_cns",      day: "WED", startTime: "13:00", endTime: "14:00", branch: "DataScience" },
  { subjectId: "ds_ai",       day: "WED", startTime: "14:00", endTime: "15:00", branch: "DataScience" },

  // Thursday
  { subjectId: "ds_ml",       day: "THU", startTime: "09:30", endTime: "10:30", branch: "DataScience" },
  { subjectId: "ds_cns_lab",  day: "THU", startTime: "10:30", endTime: "12:30", room: "C-305", batch: "A1", branch: "DataScience" },
  { subjectId: "ds_sdav_lab", day: "THU", startTime: "10:30", endTime: "12:30", room: "C-311", batch: "A2", branch: "DataScience" },
  { subjectId: "ds_dcst_lab", day: "THU", startTime: "10:30", endTime: "12:30", room: "C-302", batch: "A3", branch: "DataScience" },
  { subjectId: "ds_cns",      day: "THU", startTime: "13:00", endTime: "14:00", branch: "DataScience" },

  // Friday
  { subjectId: "ds_sdav_lab", day: "FRI", startTime: "09:30", endTime: "11:30", room: "C-301", batch: "A1", branch: "DataScience" },
  { subjectId: "ds_cns_lab",  day: "FRI", startTime: "09:30", endTime: "11:30", room: "C-311", batch: "A2", branch: "DataScience" },
  { subjectId: "ds_aiml",     day: "FRI", startTime: "09:30", endTime: "11:30", room: "C-305", batch: "A3", branch: "DataScience" },
  { subjectId: "ds_dcst",     day: "FRI", startTime: "11:30", endTime: "12:30", branch: "DataScience" },
  { subjectId: "ds_ml",       day: "FRI", startTime: "13:00", endTime: "14:00", branch: "DataScience" },
]

// All subjects combined (both branches for shared utilities)
export const subjects: Subject[] = [...theorySubjects, ...labSubjects, ...dsTheorySubjects, ...dsLabSubjects]

// Weekly timetable - all batches and electives
export const weeklyTimetable: Omit<Lecture, "id" | "isAbsent" | "weekNumber" | "month" | "year">[] = [
  // Monday
  { subjectId: "cnl", day: "MON", startTime: "09:30", endTime: "11:30", room: "C-511", batch: "A3" },
  { subjectId: "pecl_bda", day: "MON", startTime: "09:30", endTime: "11:30", room: "C-602", batch: "A2", elective: "BDA" },
  { subjectId: "dcst", day: "MON", startTime: "11:30", endTime: "12:30" },
  { subjectId: "toc", day: "MON", startTime: "13:00", endTime: "14:00" },
  { subjectId: "cn", day: "MON", startTime: "14:00", endTime: "15:00" },

  // Tuesday
  { subjectId: "pec_nlp", day: "TUE", startTime: "09:30", endTime: "10:30", room: "C-607", elective: "NLP" },
  { subjectId: "pec_bda", day: "TUE", startTime: "09:30", endTime: "10:30", room: "C-508", elective: "BDA" },
  { subjectId: "ml", day: "TUE", startTime: "10:30", endTime: "11:30" },
  { subjectId: "dcst", day: "TUE", startTime: "11:30", endTime: "12:30" },
  { subjectId: "mll", day: "TUE", startTime: "13:00", endTime: "15:00", room: "C-612", batch: "A1" },
  { subjectId: "cnl", day: "TUE", startTime: "13:00", endTime: "15:00", room: "C-511", batch: "A2" },
  { subjectId: "pecl_bda", day: "TUE", startTime: "13:00", endTime: "15:00", room: "C-602", batch: "A3", elective: "BDA" },

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

// Semester months (July-Nov)
export const SEMESTER_MONTHS = [
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
  user: { id?: number; name: string; rollNo: string; division: string; branch: Branch } | null
  isAuthenticated: boolean
  isDarkMode: boolean
  selectedBatch: "A1" | "A2" | "A3"
  selectedElective: "NLP" | "BDA"
  branch: Branch
  absences: string[] // List of absent lecture IDs synced from cloud

  // Actions
  login: (id: number | undefined, name: string, rollNo: string, division: string, branch: Branch) => void
  logout: () => void
  toggleAbsent: (lectureId: string) => void
  setCurrentMonth: (month: number, year: number) => void
  toggleDarkMode: () => void
  setSelectedBatch: (batch: "A1" | "A2" | "A3") => void
  setSelectedElective: (elective: "NLP" | "BDA") => void
  initializeMonth: (month: number, year: number) => void
  syncAbsences: () => Promise<void>
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

const generateLecturesForMonth = (month: number, year: number, branch: Branch = "Computer", absentIds: string[] = []): Lecture[] => {
  const weekdays = getWeekdaysInMonth(month, year)
  const lectures: Lecture[] = []
  const timetable = branch === "DataScience" ? dsWeeklyTimetable : weeklyTimetable
  
  weekdays.forEach((date) => {
    const dayCode = dayCodeMap[date.getDay()]
    if (!dayCode) return
    
    const weekNum = getWeekOfMonth(date)
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    
    // Get timetable entries for this day
    const dayLectures = timetable.filter(l => l.day === dayCode)
    
    dayLectures.forEach((lecture, index) => {
      const id = `${dateStr}-${lecture.day}-${lecture.subjectId}-${index}`
      lectures.push({
        ...lecture,
        id,
        isAbsent: absentIds.includes(id),
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
      branch: "Computer" as Branch,
      absences: [],
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
      setSelectedBatch: (batch) => {
        set({ selectedBatch: batch })
        const user = get().user
        if (typeof window !== "undefined") {
          if (user?.rollNo) {
            localStorage.setItem(`attendy_batch_${user.rollNo}`, batch)
          }
          localStorage.setItem("attendy_saved_batch", batch)
        }
      },
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
      saveChanges: async () => {
        const { pendingChanges, lectures, user } = get()
        const newLectures = lectures.map(l => {
          if (pendingChanges[l.id] !== undefined) {
            return { ...l, isAbsent: pendingChanges[l.id] }
          }
          return l
        })
        const newAbsences = newLectures.filter(l => l.isAbsent).map(l => l.id)
        set({ lectures: newLectures, absences: newAbsences, pendingChanges: {} })

        if (user) {
          try {
            await fetch("/api/attendance", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                studentId: user.id,
                rollNo: user.rollNo,
                absentLectureIds: newAbsences
              })
            })
          } catch (e) {
            console.error("Failed to sync absences to database", e)
          }
        }
      },
      discardChanges: () => {
        set({ pendingChanges: {} })
      },

      login: (id, name, rollNo, division, branch = "Computer") => {
        const current = getCurrentMonth()
        let savedBatch: "A1" | "A2" | "A3" | null = null
        if (typeof window !== "undefined") {
          const b = localStorage.getItem(`attendy_batch_${rollNo}`) || localStorage.getItem("attendy_saved_batch")
          if (b === "A1" || b === "A2" || b === "A3") {
            savedBatch = b
          }
        }
        set((state) => ({ 
          user: { id, name, rollNo, division, branch }, 
          branch,
          selectedBatch: savedBatch || state.selectedBatch || "A3",
          isAuthenticated: true,
          currentMonth: current.month,
          currentYear: current.year,
          lectures: [],
          absences: [],
        }))
        const state = get()
        state.initializeMonth(current.month, current.year)
        state.syncAbsences()
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, absences: [], lectures: [] })
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
        const { branch, absences } = get()
        const newLectures = generateLecturesForMonth(month, year, branch, absences || [])
        set((state) => ({
          lectures: [...state.lectures.filter((l) => !(l.month === month && l.year === year)), ...newLectures],
        }))
      },

      syncAbsences: async () => {
        const { user } = get()
        if (!user) return
        try {
          const params = new URLSearchParams()
          if (user.id) params.append("studentId", user.id.toString())
          params.append("rollNo", user.rollNo)
          
          const res = await fetch(`/api/attendance?${params.toString()}`)
          const data = await res.json()
          if (data.success && Array.isArray(data.absences)) {
            const serverAbsences = data.absences
            set({ absences: serverAbsences })
            set((state) => ({
              lectures: state.lectures.map(l => ({
                ...l,
                isAbsent: serverAbsences.includes(l.id)
              }))
            }))
          }
        } catch (e) {
          console.error("Failed to sync absences from database", e)
        }
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

        // Helper to check if a lecture is a lab (by subject type or duration >= 120 mins)
        const isLabLecture = (l: Lecture) => {
          const subject = subjects.find(s => s.id === l.subjectId)
          if (!subject) return false
          if (subject.type === "lab") return true
          const [startH, startM] = l.startTime.split(":").map(Number)
          const [endH, endM] = l.endTime.split(":").map(Number)
          return (endH * 60 + endM) - (startH * 60 + startM) >= 120
        }

        let theoryAttended = 0
        let theoryTotal = 0
        let labAttended = 0
        let labTotal = 0

        // Calculate stats based on filters 
        const { selectedBatch, selectedElective, branch } = get()
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
          
          if (lecture.batch && lecture.batch !== selectedBatch) return
          if (lecture.elective && lecture.elective !== selectedElective) return
          if (lecture.branch && lecture.branch !== branch) return

          const record = bySubject.get(lecture.subjectId)
          if (record) {
            record.totalLectures++
            if (!lecture.isAbsent) {
              record.attendedLectures++
            }
          }

          if (isLabLecture(lecture)) {
            labTotal++
            if (!lecture.isAbsent) {
              labAttended++
            }
          } else {
            theoryTotal++
            if (!lecture.isAbsent) {
              theoryAttended++
            }
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
      name: "attendance-storage-monthly-v8",
    }
  )
)
