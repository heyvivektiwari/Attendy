"use client"

import { useEffect, useState } from "react"
import { useAttendanceStore, theorySubjects, labSubjects } from "@/lib/attendance-store"
import { DashboardHeader } from "./dashboard-header"
import { SubjectCard } from "./subject-card"
import { TimetableGrid } from "./timetable-grid"
import { LayoutGrid, Calendar, AlertTriangle, Filter, BookOpen, FlaskConical, Sparkles, Mail, Github, Instagram, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
type FilterType = "all" | "warning" | "critical"

export function Dashboard() {
  const { 
    user, lectures, 
    currentMonth, currentYear, setCurrentMonth, 
    toggleAbsent, getAttendanceStats, initializeMonth,
    statsMode, mainView, 
    rangeStartMonth, rangeStartYear, 
    rangeEndMonth, rangeEndYear,
    pendingChanges, setPendingChange, hasPendingChanges, saveChanges, discardChanges 
  } = useAttendanceStore()
  const [filter, setFilter] = useState<FilterType>("all")
  const [mounted, setMounted] = useState(false)
  const [subjectMode, setSubjectMode] = useState<"theory" | "lab">("theory")

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

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

  const stats = statsMode === "monthly" 
    ? getAttendanceStats({ month: currentMonth, year: currentYear }) 
    : getAttendanceStats({ startMonth: rangeStartMonth, startYear: rangeStartYear, endMonth: rangeEndMonth, endYear: rangeEndYear })

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
        {mainView !== "contact" && (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-primary/5 p-8 rounded-3xl border border-primary/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-primary/5 rounded-full blur-2xl" />
            
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
                <Sparkles className="h-3 w-3" />
                Student Portal
              </div>
              <div>
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                  {getGreeting()}, <span className="text-primary">{user?.name ? user.name.split(' ')[0].charAt(0).toUpperCase() + user.name.split(' ')[0].slice(1).toLowerCase() : 'Student'}</span>!
                </h2>
              </div>
            </div>
          </div>
        )}

        {mainView !== "contact" && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-1 p-1 bg-white dark:bg-secondary/30 rounded-xl border-[3px] border-[#1A132F]/15 dark:border-border/60 shadow-[0_8px_30px_rgba(26,19,47,0.1)] w-fit">
              <Button 
                variant={subjectMode === "theory" ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setSubjectMode("theory")}
                className={cn("px-4 py-2 h-auto text-sm rounded-lg border-[3px] border-transparent transition-all", subjectMode === "theory" && "font-extrabold bg-[#005691]/15 text-[#005691] border-[#005691]/50 shadow-sm dark:bg-primary/20 dark:text-white dark:border-primary/50")}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Theory Attendance
              </Button>
              <Button 
                variant={subjectMode === "lab" ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setSubjectMode("lab")}
                className={cn("px-4 py-2 h-auto text-sm rounded-lg border-[3px] border-transparent transition-all", subjectMode === "lab" && "font-extrabold bg-[#005691]/15 text-[#005691] border-[#005691]/50 shadow-sm dark:bg-primary/20 dark:text-white dark:border-primary/50")}
              >
                <FlaskConical className="w-4 h-4 mr-2" />
                Lab Attendance
              </Button>
            </div>
          </div>
        )}

        {/* Selected Stats Category */}
        {mainView !== "contact" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {subjectMode === "theory" ? (
              <div className="w-full h-full p-6 border-[3px] border-[#1A132F]/20 rounded-2xl bg-white dark:bg-card text-card-foreground shadow-[0_10px_40px_rgba(26,19,47,0.12)] transition-all hover:shadow-[0_15px_50px_rgba(26,19,47,0.2)] hover:-translate-y-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Theory Performance</h3>
                    <p className="text-sm text-muted-foreground">{stats.theory.attended}/{stats.theory.total} lectures attended</p>
                  </div>
                </div>
                <div className="flex items-end gap-3 mb-3">
                  <span className="text-4xl font-bold">{stats.theory.percentage}%</span>
                  <span className="text-sm text-muted-foreground mb-1">Overall Average</span>
                </div>
                <div className="bg-[#E8F1F5] dark:bg-[#070411] rounded-full h-4 overflow-hidden border border-[#004A7C]/50 dark:border-[#2ec7ff] shadow-[0_4px_10px_rgba(0,74,124,0.3)] dark:shadow-[0_0_12px_rgba(7,176,35,0.5)]">
                  <div 
                    className={cn("h-full rounded-full transition-all duration-500", stats.theory.percentage >= 75 ? "bg-safe" : stats.theory.percentage >= 70 ? "bg-warning" : "bg-destructive")}
                    style={{ width: `${Math.min(stats.theory.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="w-full h-full p-6 border-[3px] border-[#1A132F]/20 rounded-2xl bg-white dark:bg-card text-card-foreground shadow-[0_10px_40px_rgba(26,19,47,0.12)] transition-all hover:shadow-[0_15px_50px_rgba(26,19,47,0.2)] hover:-translate-y-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <FlaskConical className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Lab Performance</h3>
                    <p className="text-sm text-muted-foreground">{stats.lab.attended}/{stats.lab.total} labs attended</p>
                  </div>
                </div>
                <div className="flex items-end gap-3 mb-3">
                  <span className="text-4xl font-bold">{stats.lab.percentage}%</span>
                  <span className="text-sm text-muted-foreground mb-1">Overall Average</span>
                </div>
                <div className="bg-[#E8F1F5] dark:bg-[#070411] rounded-full h-4 overflow-hidden border border-[#004A7C]/50 dark:border-[#2ec7ff] shadow-[0_4px_10px_rgba(0,74,124,0.3)] dark:shadow-[0_0_12px_rgba(7,176,35,0.5)]">
                  <div 
                    className={cn("h-full rounded-full transition-all duration-500", stats.lab.percentage >= 75 ? "bg-safe" : stats.lab.percentage >= 70 ? "bg-warning" : "bg-destructive")}
                    style={{ width: `${Math.min(stats.lab.percentage, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {mainView === "dashboard" ? (
          <div className="space-y-6">
            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilter("all")}
                className={cn("h-10 px-4 border-[3px] transition-all rounded-xl", 
                  filter === "all" 
                    ? "font-extrabold bg-[#005691]/15 text-[#005691] border-[#005691]/50 shadow-sm dark:bg-primary/20 dark:text-white dark:border-primary/50" 
                    : "border-transparent"
                )}
              >
                All ({theorySubjects.length + labSubjects.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilter("warning")}
                className={cn("h-10 px-4 border-[3px] transition-all rounded-xl", 
                  filter === "warning" 
                    ? "font-extrabold bg-warning/20 text-warning border-warning shadow-sm dark:text-white dark:border-warning/50" 
                    : warningCount > 0 
                      ? "border-warning/30 text-warning hover:bg-warning/10" 
                      : "border-transparent"
                )}
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                Warning ({warningCount})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilter("critical")}
                className={cn("h-10 px-4 border-[3px] transition-all rounded-xl", 
                  filter === "critical" 
                    ? "font-extrabold bg-critical/20 text-critical border-critical shadow-sm dark:text-white dark:border-critical/50" 
                    : criticalCount > 0 
                      ? "border-critical/30 text-critical hover:bg-critical/10" 
                      : "border-transparent"
                )}
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                Critical ({criticalCount})
              </Button>
            </div>

            {/* Subject Section based on generic toggle */}
            {subjectMode === "theory" ? (
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
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FlaskConical className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Lab Attendance</h2>
                  <span className="text-sm text-muted-foreground">({filteredLabs.length} labs)</span>
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
            )}
          </div>
        ) : mainView === "attendance-marker" ? (
          <div>
            <div className="mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                Attendance Marker
              </h2>

            </div>
            <TimetableGrid
              lectures={lectures}
              currentMonth={currentMonth}
              currentYear={currentYear}
              onMonthChange={setCurrentMonth}
              pendingChanges={pendingChanges}
              setPendingChange={setPendingChange}
            />
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col items-center text-center space-y-4 py-8">
              <div className="p-4 rounded-3xl bg-primary/10 text-primary border-2 border-primary/20 shadow-[0_0_20px_rgba(46,199,255,0.2)]">
                <MessageSquare className="h-10 w-10" />
              </div>
              <h2 className="text-4xl font-extrabold tracking-tight">Contact <span className="text-primary">Support</span></h2>
              <p className="text-muted-foreground max-w-lg text-lg">
                Facing issues or have suggestions? Our team is live and ready to help you track your attendance better.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch pt-4">
              <div className="bg-card border-2 border-border/80 p-8 rounded-3xl shadow-xl space-y-6 flex flex-col justify-center">
                 <h3 className="text-2xl font-extrabold flex items-center gap-3">
                   <Mail className="h-6 w-6 text-primary" />
                   Email Support
                 </h3>
                 <p className="text-muted-foreground">
                   Send us an email and we'll get back to you within 24 hours.
                 </p>
                 <a href="mailto:support@attendy.com" className="flex items-center gap-4 p-5 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-all group border-2 border-border/60 hover:border-primary/50 mt-4">
                   <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors border border-primary/20">
                     <Mail className="h-6 w-6" />
                   </div>
                   <div className="flex flex-col">
                     <span className="text-xs font-black text-primary uppercase tracking-widest">Official Email</span>
                     <span className="font-extrabold text-xl">support@attendy.com</span>
                   </div>
                 </a>
              </div>

              <div className="bg-card border-2 border-border/80 p-8 rounded-3xl shadow-xl space-y-6 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
                <div className="relative z-10 space-y-6">
                  <h3 className="text-2xl font-extrabold">System Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50">
                      <span className="text-muted-foreground">Status</span>
                      <span className="flex items-center gap-2 font-bold text-safe">
                        <div className="h-2.5 w-2.5 rounded-full bg-safe animate-pulse shadow-[0_0_8px_rgba(7,176,35,0.6)]" />
                        Live & Online
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50">
                      <span className="text-muted-foreground">Version</span>
                      <span className="font-bold">v1.2.4 Production</span>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground pt-4 border-t border-border/50">
                  © 2026 Attendy Student Portal. All rights reserved.
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
