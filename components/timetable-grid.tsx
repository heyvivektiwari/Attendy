"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useAttendanceStore, subjects, SEMESTER_MONTHS, getMonthLabel, getMonthIndex, type Lecture } from "@/lib/attendance-store"
import { cn } from "@/lib/utils"
import { Calendar, ChevronLeft, ChevronRight, Coffee, ChevronDown, ChevronUp, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const days = ["MON", "TUE", "WED", "THU", "FRI"] as const
const dayLabels = {
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
}

const headerColors = {
  MON: "bg-rose-500/15 text-[#1A132F] dark:text-[#ededed] dark:bg-rose-500/20",
  TUE: "bg-emerald-500/15 text-[#1A132F] dark:text-[#ededed] dark:bg-emerald-500/20",
  WED: "bg-amber-500/15 text-[#1A132F] dark:text-[#ededed] dark:bg-amber-500/20",
  THU: "bg-purple-500/15 text-[#1A132F] dark:text-[#ededed] dark:bg-purple-500/20",
  FRI: "bg-[#2C2C2C]/50 text-[#1A132F] dark:text-[#ededed] dark:bg-[#2C2C2C]/60",
}

const mobileHeaderColors = {
  MON: "bg-rose-500/15 text-[#1A132F] dark:text-[#ededed] dark:bg-rose-500/20 border-rose-500/20",
  TUE: "bg-emerald-500/15 text-[#1A132F] dark:text-[#ededed] dark:bg-emerald-500/20 border-emerald-500/20",
  WED: "bg-amber-500/15 text-[#1A132F] dark:text-[#ededed] dark:bg-amber-500/20 border-amber-500/20",
  THU: "bg-purple-500/15 text-[#1A132F] dark:text-[#ededed] dark:bg-purple-500/20 border-purple-500/20",
  FRI: "bg-[#2C2C2C]/50 text-[#1A132F] dark:text-[#ededed] dark:bg-[#2C2C2C]/60 border-[#2C2C2C]/40",
}

const tableOuterBorders = {
  MON: "border-[3px] border-rose-200/50 shadow-lg shadow-rose-500/10 dark:shadow-[0_0_20px_rgba(244,63,94,0.1)] dark:border-rose-500/50",
  TUE: "border-[3px] border-emerald-200/50 shadow-lg shadow-emerald-500/10 dark:shadow-[0_0_20px_rgba(16,185,129,0.1)] dark:border-emerald-500/50",
  WED: "border-[3px] border-amber-200/50 shadow-lg shadow-amber-500/10 dark:shadow-[0_0_20px_rgba(245,158,11,0.1)] dark:border-amber-500/50",
  THU: "border-[3px] border-purple-200/50 shadow-lg shadow-purple-500/10 dark:shadow-[0_0_20px_rgba(168,85,247,0.1)] dark:border-purple-500/50",
  FRI: "border-[3px] border-[#2C2C2C]/30 shadow-lg shadow-[#2C2C2C]/20 dark:shadow-[0_0_20px_rgba(44,44,44,0.3)] dark:border-[#2C2C2C]",
}

const tableBodyBackgrounds = {
  MON: "bg-rose-50/50 dark:bg-rose-950/20",
  TUE: "bg-emerald-50/50 dark:bg-emerald-950/20",
  WED: "bg-amber-50/50 dark:bg-amber-950/20",
  THU: "bg-purple-50/50 dark:bg-purple-950/20",
  FRI: "bg-[#2C2C2C]/10 dark:bg-[#2C2C2C]/10",
}

interface TimetableGridProps {
  lectures: Lecture[]
  currentMonth: number
  currentYear: number
  onMonthChange: (month: number, year: number) => void
  pendingChanges: Record<string, boolean>
  setPendingChange: (lectureId: string, isAbsent: boolean) => void
}

function LectureCard({ lecture, onToggle }: { lecture: Lecture; onToggle: () => void }) {
  const subject = subjects.find((s) => s.id === lecture.subjectId)
  if (!subject) return null

  const isLab = subject.type === "lab"

  return (
    <div
      className={cn(
        "group relative p-3 rounded-xl border-[3px] shadow-sm transition-all duration-300 cursor-pointer hover:shadow-md hover:-translate-y-0.5",
        lecture.isAbsent
          ? "bg-critical/10 border-critical/40 hover:border-critical/60 hover:bg-critical/15"
          : "bg-white dark:bg-card border-[#1A132F]/15 dark:border-primary/30 hover:bg-secondary/20 hover:border-primary/50"
      )}
      onClick={onToggle}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className={cn(
              "font-semibold text-sm truncate",
              lecture.isAbsent ? "text-critical line-through" : "text-foreground"
            )}>
              {subject.shortName}
            </p>
            {isLab && (
              <Badge variant="secondary" className="text-[9px] px-1 py-0 h-3.5 bg-primary/10 text-primary border-0">
                Lab
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {lecture.startTime} - {lecture.endTime}
          </p>
          {lecture.room && (
            <p className="text-xs text-muted-foreground">
              Room: {lecture.room}
            </p>
          )}
        </div>
        <Checkbox
          checked={lecture.isAbsent}
          onCheckedChange={onToggle}
          className={cn(
            "mt-0.5 h-5 w-5 rounded transition-all ring-2 ring-offset-2 ring-offset-background",
            lecture.isAbsent 
              ? "border-critical ring-critical/20 hover:ring-critical/40 data-[state=checked]:bg-critical data-[state=checked]:border-critical" 
              : "border-primary/50 ring-primary/20 hover:ring-primary/40 shadow-sm"
          )}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      <div className={cn(
        "absolute bottom-0 left-0 right-0 h-0.5 rounded-b-lg transition-colors",
        lecture.isAbsent ? "bg-critical" : isLab ? "bg-primary/50" : "bg-transparent group-hover:bg-primary/50"
      )} />
    </div>
  )
}

function BreakRow() {
  return (
    <div className="flex items-center justify-center gap-2 py-3 px-4 bg-orange-300/10 dark:bg-orange-300/5 rounded-xl border-[3px] border-dashed border-orange-300/50 dark:border-orange-300/40 shadow-inner">
      <Coffee className="h-4 w-4 text-orange-400 dark:text-orange-300" />
      <span className="text-sm font-bold tracking-widest text-orange-400 dark:text-orange-300">BREAK</span>
      <span className="text-xs font-medium text-orange-400/80 dark:text-orange-300/80">(12:30 - 01:00)</span>
    </div>
  )
}

// Split lectures into before and after break
const splitByBreak = (dayLectures: Lecture[]) => {
  const sorted = [...dayLectures].sort((a, b) => a.startTime.localeCompare(b.startTime))
  
  let breakIndex = -1
  for (let i = 0; i < sorted.length - 1; i++) {
    const currentEnd = sorted[i].endTime
    const nextStart = sorted[i + 1].startTime
    
    const [endH, endM] = currentEnd.split(':').map(Number)
    const [startH, startM] = nextStart.split(':').map(Number)
    
    const endMins = endH * 60 + endM
    const startMins = startH * 60 + startM
    
    if (startMins - endMins > 15) {
      breakIndex = i
      break
    }
  }
  
  if (breakIndex === -1) {
    return { before: sorted, after: [] }
  }
  
  return {
    before: sorted.slice(0, breakIndex + 1),
    after: sorted.slice(breakIndex + 1)
  }
}

// Get the week ranges for a given month
function getWeeksInMonth(month: number, year: number): { weekNum: number; startDate: Date; endDate: Date; label: string }[] {
  const weeks: { weekNum: number; startDate: Date; endDate: Date; label: string }[] = []
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  
  let currentWeekStart: Date | null = null
  let currentWeekNum = 1
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const dayOfWeek = date.getDay()
    
    // Skip weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) continue
    
    // Start new week on Monday
    if (dayOfWeek === 1 || !currentWeekStart) {
      if (currentWeekStart) {
        currentWeekNum++
      }
      currentWeekStart = date
    }
    
    // End week on Friday or last weekday of month
    if (dayOfWeek === 5 || day === daysInMonth || (day < daysInMonth && new Date(year, month, day + 1).getDay() === 6)) {
      const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      weeks.push({
        weekNum: currentWeekNum,
        startDate: currentWeekStart!,
        endDate: date,
        label: `${formatDate(currentWeekStart!)} - ${formatDate(date)}`
      })
    }
  }
  
  return weeks
}

function WeekSection({ 
  weekInfo, 
  weekLectures, 
  pendingChanges,
  setPendingChange
}: { 
  weekInfo: { weekNum: number; label: string; startDate?: Date; endDate?: Date }
  weekLectures: Lecture[]
  pendingChanges: Record<string, boolean>
  setPendingChange: (id: string, isAbsent: boolean) => void 
}) {
  const [isExpanded, setIsExpanded] = useState(() => {
    if (!weekInfo.startDate || !weekInfo.endDate) return false;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const start = new Date(weekInfo.startDate);
    const end = new Date(weekInfo.endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return today >= start && today <= end;
  })
  
  const getLecturesForDay = (day: typeof days[number]) => {
    return weekLectures
      .filter((l) => l.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  // Count absences this week
  const totalThisWeek = weekLectures.length
  const absentThisWeek = weekLectures.filter(l => l.isAbsent).length
  const presentThisWeek = totalThisWeek - absentThisWeek
  
  return (
    <div className="space-y-3">
      <button 
        className="w-full flex items-center justify-between py-2.5 px-4 bg-white dark:bg-transparent border-[3px] border-[#1A132F]/15 dark:border-border/50 rounded-xl hover:bg-secondary/10 transition-all shadow-[0_4px_15px_rgba(26,19,47,0.06)]"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm">Week {weekInfo.weekNum}</span>
          <span className="text-xs text-muted-foreground">{weekInfo.label}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {presentThisWeek}/{totalThisWeek} present
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>
      
      {isExpanded && (
        <>
          {/* Desktop Grid */}
          <div className="hidden lg:grid lg:grid-cols-5 gap-4 shrink-0">
            {days.map((day) => {
              const dayLectures = getLecturesForDay(day)
              if (dayLectures.length === 0) return null // Hide non-existent days

              const { before, after } = splitByBreak(dayLectures)
              const hasAfternoon = after.length > 0
              
              return (
                <div key={day} className={cn("flex flex-col border-[3px] rounded-xl overflow-hidden bg-white dark:bg-card min-h-[250px] transition-all hover:border-primary/50 hover:shadow-xl", tableOuterBorders[day])}>
                  <div className={cn("text-center py-2.5 border-b-2 border-current/20 dark:border-opacity-30", headerColors[day])}>
                    <p className="font-bold text-sm tracking-wide">{dayLabels[day]}</p>
                  </div>
                  <div className={cn("p-3 space-y-2 flex-1", tableBodyBackgrounds[day])}>
                    <>
                      {before.map((lecture) => {
                        const currentIsAbsent = pendingChanges[lecture.id] !== undefined 
                          ? pendingChanges[lecture.id] 
                          : lecture.isAbsent
                        return (
                          <LectureCard
                            key={lecture.id}
                            lecture={{...lecture, isAbsent: currentIsAbsent}}
                            onToggle={() => setPendingChange(lecture.id, !currentIsAbsent)}
                          />
                        )
                      })}
                      
                      {hasAfternoon && before.length > 0 && (
                        <div className="flex items-center justify-center gap-1.5 py-2 border-y-2 border-dashed border-orange-300/40 dark:border-orange-300/30 my-2 text-xs font-bold text-orange-400 dark:text-orange-300 bg-orange-300/10 dark:bg-orange-300/5 rounded-md shadow-sm">
                          <Coffee className="h-3.5 w-3.5" />
                          <span className="tracking-widest uppercase">Break</span>
                        </div>
                      )}
                      
                      {after.map((lecture) => {
                        const currentIsAbsent = pendingChanges[lecture.id] !== undefined 
                          ? pendingChanges[lecture.id] 
                          : lecture.isAbsent
                        return (
                          <LectureCard
                            key={lecture.id}
                            lecture={{...lecture, isAbsent: currentIsAbsent}}
                            onToggle={() => setPendingChange(lecture.id, !currentIsAbsent)}
                          />
                        )
                      })}
                    </>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Mobile/Tablet List */}
          <div className="lg:hidden space-y-4">
            {days.map((day) => {
              const dayLectures = getLecturesForDay(day)
              if (dayLectures.length === 0) return null
              
              const { before, after } = splitByBreak(dayLectures)
              
              return (
                <div key={day} className={cn("rounded-xl border-[3px] overflow-hidden bg-white dark:bg-card transition-shadow hover:shadow-md", tableOuterBorders[day])}>
                  <div className={cn("py-3 px-4 border-b-2 border-current/20 dark:border-opacity-30", mobileHeaderColors[day])}>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-[15px] tracking-wide">{dayLabels[day]}</p>
                      <Badge variant="outline" className="bg-background/50 border-current/20 text-xs">
                        {dayLectures.length} Lectures
                      </Badge>
                    </div>
                  </div>
                  <div className={cn("p-3.5 space-y-3", tableBodyBackgrounds[day])}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {before.map((lecture) => {
                        const currentIsAbsent = pendingChanges[lecture.id] !== undefined 
                          ? pendingChanges[lecture.id] 
                          : lecture.isAbsent
                        return (
                          <LectureCard
                            key={lecture.id}
                            lecture={{...lecture, isAbsent: currentIsAbsent}}
                            onToggle={() => setPendingChange(lecture.id, !currentIsAbsent)}
                          />
                        )
                      })}
                    </div>
                    
                    {after.length > 0 && before.length > 0 && <BreakRow />}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {after.map((lecture) => {
                        const currentIsAbsent = pendingChanges[lecture.id] !== undefined 
                          ? pendingChanges[lecture.id] 
                          : lecture.isAbsent
                        return (
                          <LectureCard
                            key={lecture.id}
                            lecture={{...lecture, isAbsent: currentIsAbsent}}
                            onToggle={() => setPendingChange(lecture.id, !currentIsAbsent)}
                          />
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export function TimetableGrid({ lectures, currentMonth, currentYear, onMonthChange, pendingChanges, setPendingChange }: TimetableGridProps) {
  const monthLectures = lectures.filter((l) => l.month === currentMonth && l.year === currentYear)
  const monthIndex = getMonthIndex(currentMonth, currentYear)
  const monthLabel = getMonthLabel(currentMonth, currentYear)
  
  const weeks = getWeeksInMonth(currentMonth, currentYear)
  
  // Count total stats for this month
  const totalThisMonth = monthLectures.length
  const absentThisMonth = monthLectures.filter(l => l.isAbsent).length
  const presentThisMonth = totalThisMonth - absentThisMonth
  const monthPercentage = totalThisMonth > 0 ? Math.round((presentThisMonth / totalThisMonth) * 100) : 100

  const handlePrev = () => {
    if (monthIndex > 0) {
      const prev = SEMESTER_MONTHS[monthIndex - 1]
      onMonthChange(prev.month, prev.year)
    }
  }

  const handleNext = () => {
    if (monthIndex < SEMESTER_MONTHS.length - 1) {
      const next = SEMESTER_MONTHS[monthIndex + 1]
      onMonthChange(next.month, next.year)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1 text-amber-500 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/5 py-2 px-3 rounded-lg border border-amber-500/20 w-fit">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <p className="text-xs font-medium">
          Tick the box to mark absent, Unchecked = Present
        </p>
      </div>
      
      <Card className="overflow-hidden bg-white dark:bg-card border-[3px] border-[#1A132F]/15 dark:border-border shadow-[0_10px_40px_rgba(26,19,47,0.08)]">
        <CardHeader className="border-b-2 border-border/50 bg-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Monthly Timetable</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {monthLabel} · {presentThisMonth}/{totalThisMonth} present ({monthPercentage}%)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrev}
                disabled={monthIndex <= 0}
                className="h-10 w-10 rounded-lg border-[3px] border-[#1A132F]/15 dark:bg-primary/20 dark:border-primary/50 dark:text-white transition-all hover:bg-primary/30 active:scale-95 disabled:opacity-30"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <span className="px-3 py-1 bg-transparent border-[3px] border-[#1A132F]/15 dark:border-border/50 rounded-md text-sm font-bold min-w-[60px] text-center">
                {new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'short' })}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                disabled={monthIndex >= SEMESTER_MONTHS.length - 1}
                className="h-10 w-10 rounded-lg border-[3px] border-[#1A132F]/15 dark:bg-primary/20 dark:border-primary/50 dark:text-white transition-all hover:bg-primary/30 active:scale-95 disabled:opacity-30"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardHeader>
      <CardContent className="p-4 space-y-4">
        {weeks.map((weekInfo) => {
          const weekLectures = monthLectures.filter(l => l.weekNumber === weekInfo.weekNum)
          
          return (
            <WeekSection
              key={weekInfo.weekNum}
              weekInfo={weekInfo}
              weekLectures={weekLectures}
              pendingChanges={pendingChanges}
              setPendingChange={setPendingChange}
            />
          )
        })}
        
        {weeks.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No lectures this month
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  )
}
