"use client"

import { useEffect, useState } from "react"
import { useAttendanceStore, theorySubjects, labSubjects } from "@/lib/attendance-store"
import { DashboardHeader } from "./dashboard-header"
import { OverallStats } from "./overall-stats"
import { SubjectCard } from "./subject-card"
import { TimetableGrid } from "./timetable-grid"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutGrid, Calendar, AlertTriangle, Filter, BookOpen, FlaskConical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type FilterType = "all" | "warning" | "critical"

export function Dashboard() {
  const { lectures, currentMonth, currentYear, setCurrentMonth, toggleAbsent, getAttendanceStats, initializeMonth } = useAttendanceStore()
  const [filter, setFilter] = useState<FilterType>("all")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Initialize current month if not done
    if (lectures.filter((l) => l.month === currentMonth && l.year === currentYear).length === 0) {
      initializeMonth(currentMonth, currentYear)
    }
  }, [currentMonth, currentYear, initializeMonth, lectures])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const stats = getAttendanceStats()

  const getFilteredSubjects = (subjects: typeof theorySubjects) => {
    return subjects.filter((subject) => {
      const record = stats.bySubject.get(subject.id)
      if (!record || record.totalLectures === 0) return filter === "all"
      
      const percentage = Math.round((record.attendedLectures / record.totalLectures) * 100)
      
      if (filter === "warning") return percentage < 75 && percentage >= 70
      if (filter === "critical") return percentage < 70
      return true
    })
  }

  const filteredTheory = getFilteredSubjects(theorySubjects)
  const filteredLabs = getFilteredSubjects(labSubjects)

  const countByStatus = (subjects: typeof theorySubjects, status: "warning" | "critical") => {
    return subjects.filter((s) => {
      const record = stats.bySubject.get(s.id)
      if (!record || record.totalLectures === 0) return false
      const pct = Math.round((record.attendedLectures / record.totalLectures) * 100)
      if (status === "warning") return pct < 75 && pct >= 70
      return pct < 70
    }).length
  }

  const warningCount = countByStatus(theorySubjects, "warning") + countByStatus(labSubjects, "warning")
  const criticalCount = countByStatus(theorySubjects, "critical") + countByStatus(labSubjects, "critical")

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Overall Stats - Now shows Theory and Lab separately */}
        <OverallStats
          theory={stats.theory}
          lab={stats.lab}
          overall={stats.overall}
        />

        {/* Tabs */}
        <Tabs defaultValue="subjects" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="subjects" className="gap-2">
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Subjects</span>
            </TabsTrigger>
            <TabsTrigger value="timetable" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Monthly Timetable</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="subjects" className="space-y-6">
            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
                className="h-8"
              >
                All ({theorySubjects.length + labSubjects.length})
              </Button>
              <Button
                variant={filter === "warning" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("warning")}
                className={cn("h-8", warningCount > 0 && filter !== "warning" && "border-warning text-warning hover:bg-warning/10")}
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                Warning ({warningCount})
              </Button>
              <Button
                variant={filter === "critical" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("critical")}
                className={cn("h-8", criticalCount > 0 && filter !== "critical" && "border-critical text-critical hover:bg-critical/10")}
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                Critical ({criticalCount})
              </Button>
            </div>

            {/* Theory Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Theory Attendance</h2>
                <span className="text-sm text-muted-foreground">({filteredTheory.length} subjects)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredTheory.map((subject) => {
                  const record = stats.bySubject.get(subject.id) || {
                    subjectId: subject.id,
                    totalLectures: 0,
                    attendedLectures: 0,
                  }
                  return <SubjectCard key={subject.id} subjectId={subject.id} record={record} />
                })}
              </div>
              {filteredTheory.length === 0 && (
                <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                  No theory subjects match this filter
                </div>
              )}
            </div>

            {/* Lab Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Lab Attendance</h2>
                <span className="text-sm text-muted-foreground">({filteredLabs.length} labs - A3 Batch)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredLabs.map((subject) => {
                  const record = stats.bySubject.get(subject.id) || {
                    subjectId: subject.id,
                    totalLectures: 0,
                    attendedLectures: 0,
                  }
                  return <SubjectCard key={subject.id} subjectId={subject.id} record={record} />
                })}
              </div>
              {filteredLabs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                  No lab subjects match this filter
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="timetable">
            <TimetableGrid
              lectures={lectures}
              currentMonth={currentMonth}
              currentYear={currentYear}
              onMonthChange={setCurrentMonth}
              onToggleAbsent={toggleAbsent}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
