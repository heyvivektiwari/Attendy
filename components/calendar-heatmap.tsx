"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock, MapPin, User, Sparkles } from "lucide-react"
import { useAttendanceStore, getMonthLabel, SEMESTER_MONTHS, subjects, type Lecture } from "@/lib/attendance-store"
import { cn } from "@/lib/utils"

export function CalendarHeatmap() {
  const { currentMonth, currentYear, setCurrentMonth, lectures, toggleAbsent, selectedBatch, selectedElective, branch } = useAttendanceStore()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Current month weekday dates
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay() // 0 = Sun

  const currentMonthIndex = SEMESTER_MONTHS.findIndex(m => m.month === currentMonth && m.year === currentYear)

  const handlePrevMonth = () => {
    if (currentMonthIndex > 0) {
      const prev = SEMESTER_MONTHS[currentMonthIndex - 1]
      setCurrentMonth(prev.month, prev.year)
    }
  }

  const handleNextMonth = () => {
    if (currentMonthIndex < SEMESTER_MONTHS.length - 1) {
      const next = SEMESTER_MONTHS[currentMonthIndex + 1]
      setCurrentMonth(next.month, next.year)
    }
  }

  // Get lectures for a specific day date
  const getDayLectures = (dayNumber: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`
    return lectures.filter((l) => {
      if (l.month !== currentMonth || l.year !== currentYear) return false
      if (!l.id.startsWith(dateStr)) return false
      if (l.batch && l.batch !== selectedBatch) return false
      if (l.elective && l.elective !== selectedElective) return false
      if (l.branch && l.branch !== branch) return false
      return true
    })
  }

  const handleDayClick = (dayNumber: number) => {
    const dayLectures = getDayLectures(dayNumber)
    if (dayLectures.length === 0) return
    const date = new Date(currentYear, currentMonth, dayNumber)
    setSelectedDate(date)
    setDialogOpen(true)
  }

  // Selected date's lectures for popup
  const activeDayLectures = selectedDate ? getDayLectures(selectedDate.getDate()) : []

  return (
    <>
      <Card className="border-[3px] border-[#1A132F]/15 dark:border-border/60 shadow-[0_10px_40px_rgba(0,0,0,0.12)] rounded-3xl overflow-hidden bg-card text-card-foreground">
         <CardHeader className="pb-3 border-b border-border/50 bg-secondary/10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-full">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                <CalendarIcon className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-extrabold tracking-tight">Attendance Calendar</CardTitle>
            </div>

            <div className="flex items-center gap-1.5 justify-between sm:justify-end w-full sm:w-auto">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg border-2 shrink-0"
                onClick={handlePrevMonth}
                disabled={currentMonthIndex <= 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs font-black px-2 min-w-[100px] text-center whitespace-nowrap">
                {getMonthLabel(currentMonth, currentYear)}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg border-2 shrink-0"
                onClick={handleNextMonth}
                disabled={currentMonthIndex >= SEMESTER_MONTHS.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-4">
          {/* Legend Strip */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold px-1 pb-2.5 border-b border-border/40 w-full">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 w-full sm:w-auto">
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="h-3 w-3 rounded-full bg-emerald-500 border border-emerald-600 shrink-0" />
                <span className="text-muted-foreground text-[11px]">100% Present</span>
              </div>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="h-3 w-3 rounded-full bg-amber-500 border border-amber-600 shrink-0" />
                <span className="text-muted-foreground text-[11px]">Partial Absences</span>
              </div>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="h-3 w-3 rounded-full bg-destructive border border-destructive/80 shrink-0" />
                <span className="text-muted-foreground text-[11px]">Full Day Missed</span>
              </div>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-extrabold w-full sm:w-auto text-center sm:text-right mt-1 sm:mt-0">
              Click Date to View
            </span>
          </div>

          {/* Calendar Grid Container with Prominent Borders and Rounded Corners */}
          <div className="border-[3px] border-[#1A132F]/20 dark:border-primary/40 rounded-3xl overflow-hidden bg-card p-1.5 sm:p-3 shadow-md space-y-1.5 sm:space-y-2">
             {/* Days of Week Header Row */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center items-center py-2 px-1 bg-secondary/50 dark:bg-white/5 rounded-t-2xl border-b border-border/50">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => (
                <div 
                  key={day} 
                  className={cn(
                    "text-[10px] sm:text-xs font-black uppercase tracking-wider leading-none py-1.5", 
                    idx === 0 || idx === 6 ? "text-muted-foreground/60" : "text-primary"
                  )}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days Table Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {/* Blank offset cells for start of month */}
              {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                <div key={`blank-${idx}`} className="h-13 sm:h-16 rounded-xl sm:rounded-2xl border-2 border-border/30 bg-muted/10" />
              ))}

              {/* Days of month */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNumber = idx + 1
                const dayDate = new Date(currentYear, currentMonth, dayNumber)
                const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6
                const dayLectures = getDayLectures(dayNumber)
                const hasLectures = dayLectures.length > 0

                const absentCount = dayLectures.filter(l => l.isAbsent).length
                const attendedCount = dayLectures.length - absentCount

                let cellStyle = "bg-secondary/30 border-2 border-border/70 text-muted-foreground opacity-50"
                if (hasLectures) {
                  if (absentCount === 0) {
                    cellStyle = "bg-emerald-500/15 border-2 border-emerald-500/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25 hover:border-emerald-500 cursor-pointer shadow-sm"
                  } else if (attendedCount > 0) {
                    cellStyle = "bg-amber-500/15 border-2 border-amber-500/50 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 hover:border-amber-500 cursor-pointer shadow-sm"
                  } else {
                    cellStyle = "bg-destructive/15 border-2 border-destructive/60 text-destructive hover:bg-destructive/25 hover:border-destructive cursor-pointer shadow-sm"
                  }
                } else if (isWeekend) {
                  cellStyle = "bg-muted/20 border-2 border-border/40 text-muted-foreground/50"
                }

                return (
                  <button
                    key={`day-${dayNumber}`}
                    disabled={!hasLectures}
                    onClick={() => handleDayClick(dayNumber)}
                    className={cn(
                      "h-13 sm:h-16 rounded-xl sm:rounded-2xl p-1 flex flex-col justify-between items-center text-center transition-all relative group active:scale-95 overflow-hidden",
                      cellStyle
                    )}
                  >
                    <span className="text-[11px] sm:text-xs font-black leading-none pt-0.5">{dayNumber}</span>
                    {hasLectures ? (
                      <div className="w-full flex items-center justify-center pb-0.5">
                        {absentCount === 0 ? (
                          <span className="text-[9px] sm:text-[10px] font-black px-1 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 leading-none">
                            {attendedCount}/{dayLectures.length}
                          </span>
                        ) : (
                          <span className={cn(
                            "text-[9px] sm:text-[10px] font-black px-1 py-0.5 rounded-md border leading-none",
                            absentCount === dayLectures.length 
                              ? "bg-destructive/20 text-destructive border-destructive/50" 
                              : "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/50"
                          )}>
                            -{absentCount}
                          </span>
                        )}
                      </div>
                    ) : isWeekend ? (
                      <div className="w-full flex items-center justify-center pb-0.5">
                        <span className="text-[8px] sm:text-[9px] font-bold text-muted-foreground/60 leading-none">W/E</span>
                      </div>
                    ) : null}
                  </button>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Day Breakdown Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg p-6 rounded-2xl border-[3px] border-[#1A132F]/15 dark:border-border/60 shadow-2xl bg-card text-card-foreground">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <CalendarIcon className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-extrabold">
                  {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Scheduled sessions for this day. Click to toggle Present/Absent.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 pt-2 max-h-[60vh] overflow-y-auto pr-1">
            {activeDayLectures.map((lecture) => {
              const sub = subjects.find(s => s.id === lecture.subjectId)
              const isAbsent = lecture.isAbsent

              return (
                <div
                  key={lecture.id}
                  className={cn(
                    "p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-3",
                    isAbsent 
                      ? "bg-destructive/10 border-destructive/30" 
                      : "bg-emerald-500/10 border-emerald-500/30"
                  )}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm">{sub?.name || lecture.subjectId}</span>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold px-1.5 py-0 h-4">
                        {sub?.type || "Theory"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="h-3 w-3" />
                        {lecture.startTime} - {lecture.endTime}
                      </span>
                      {lecture.room && (
                        <span className="flex items-center gap-1 font-medium">
                          <MapPin className="h-3 w-3" />
                          {lecture.room}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={isAbsent ? "destructive" : "default"}
                    onClick={() => toggleAbsent(lecture.id)}
                    className="gap-1.5 h-9 rounded-xl font-bold shrink-0"
                  >
                    {isAbsent ? (
                      <>
                        <XCircle className="h-4 w-4" />
                        Absent
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Present
                      </>
                    )}
                  </Button>
                </div>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
