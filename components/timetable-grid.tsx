"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useAttendanceStore, subjects, type Lecture } from "@/lib/attendance-store"
import { cn } from "@/lib/utils"
import { Calendar, ChevronLeft, ChevronRight, Coffee } from "lucide-react"
import { Button } from "@/components/ui/button"

const days = ["MON", "TUE", "WED", "THU", "FRI"] as const
const dayLabels = {
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
}

interface TimetableGridProps {
  lectures: Lecture[]
  currentWeek: number
  onWeekChange: (week: number) => void
  onToggleAbsent: (lectureId: string) => void
}

function LectureCard({ lecture, onToggle }: { lecture: Lecture; onToggle: () => void }) {
  const subject = subjects.find((s) => s.id === lecture.subjectId)
  if (!subject) return null

  const isLab = subject.type === "lab"

  return (
    <div
      className={cn(
        "group relative p-3 rounded-lg border transition-all duration-200 cursor-pointer",
        lecture.isAbsent
          ? "bg-critical/10 border-critical/30 hover:bg-critical/15"
          : isLab 
            ? "bg-primary/5 border-primary/20 hover:bg-primary/10 hover:border-primary/40"
            : "bg-card border-border hover:bg-secondary/50 hover:border-primary/30"
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
            "mt-0.5 transition-colors",
            lecture.isAbsent ? "border-critical data-[state=checked]:bg-critical data-[state=checked]:border-critical" : ""
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
    <div className="flex items-center justify-center gap-2 py-3 px-4 bg-secondary/30 rounded-lg border border-dashed border-border/50">
      <Coffee className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-medium text-muted-foreground">BREAK</span>
      <span className="text-xs text-muted-foreground">(12:30 - 01:00)</span>
    </div>
  )
}

export function TimetableGrid({ lectures, currentWeek, onWeekChange, onToggleAbsent }: TimetableGridProps) {
  const weekLectures = lectures.filter((l) => l.weekNumber === currentWeek)

  const getLecturesForDay = (day: typeof days[number]) => {
    return weekLectures
      .filter((l) => l.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  // Split lectures into before and after break
  // Break is typically 12:30-13:00, but on Thursday it's 13:30-14:00 (after OSL lab)
  const splitByBreak = (dayLectures: Lecture[], day: string) => {
    // Find if there's a gap in the schedule that indicates a break
    const sorted = [...dayLectures].sort((a, b) => a.startTime.localeCompare(b.startTime))
    
    // Find the break point by looking for a gap > 15 mins between lectures
    let breakIndex = -1
    for (let i = 0; i < sorted.length - 1; i++) {
      const currentEnd = sorted[i].endTime
      const nextStart = sorted[i + 1].startTime
      
      const [endH, endM] = currentEnd.split(':').map(Number)
      const [startH, startM] = nextStart.split(':').map(Number)
      
      const endMins = endH * 60 + endM
      const startMins = startH * 60 + startM
      
      // If there's a gap of more than 15 minutes, that's the break
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

  // Get the date range for the current week
  const getWeekDates = (week: number) => {
    const semesterStart = new Date(2026, 0, 5) // Jan 5, 2026
    const weekStart = new Date(semesterStart)
    weekStart.setDate(semesterStart.getDate() + (week - 1) * 7)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 4)
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
    
    return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-secondary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Weekly Timetable</CardTitle>
              <p className="text-sm text-muted-foreground">{getWeekDates(currentWeek)} (A3 Batch)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onWeekChange(Math.max(1, currentWeek - 1))}
              disabled={currentWeek <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-3 py-1 bg-secondary rounded-md text-sm font-medium min-w-[80px] text-center">
              Week {currentWeek}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onWeekChange(Math.min(16, currentWeek + 1))}
              disabled={currentWeek >= 16}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Check the box to mark as absent. Unchecked = Present.
        </p>
      </CardHeader>
      <CardContent className="p-4">
        {/* Desktop Grid */}
        <div className="hidden lg:grid lg:grid-cols-5 gap-4">
          {days.map((day) => {
            const dayLectures = getLecturesForDay(day)
            const { before, after } = splitByBreak(dayLectures, day)
            const hasAfternoon = after.length > 0
            
            return (
              <div key={day} className="space-y-3">
                <div className="text-center py-2 bg-secondary/50 rounded-lg">
                  <p className="font-semibold text-sm">{dayLabels[day]}</p>
                </div>
                <div className="space-y-2 min-h-[200px]">
                  {dayLectures.length > 0 ? (
                    <>
                      {/* Morning lectures */}
                      {before.map((lecture) => (
                        <LectureCard
                          key={lecture.id}
                          lecture={lecture}
                          onToggle={() => onToggleAbsent(lecture.id)}
                        />
                      ))}
                      
                      {/* Break indicator */}
                      {hasAfternoon && before.length > 0 && (
                        <div className="flex items-center justify-center gap-1 py-2 text-xs text-muted-foreground">
                          <Coffee className="h-3 w-3" />
                          <span>Break</span>
                        </div>
                      )}
                      
                      {/* Afternoon lectures */}
                      {after.map((lecture) => (
                        <LectureCard
                          key={lecture.id}
                          lecture={lecture}
                          onToggle={() => onToggleAbsent(lecture.id)}
                        />
                      ))}
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No lectures
                    </div>
                  )}
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
            
            const { before, after } = splitByBreak(dayLectures, day)
            
            return (
              <div key={day} className="space-y-2">
                <div className="py-2 px-3 bg-secondary/50 rounded-lg">
                  <p className="font-semibold text-sm">{dayLabels[day]}</p>
                </div>
                <div className="space-y-2">
                  {/* Morning */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {before.map((lecture) => (
                      <LectureCard
                        key={lecture.id}
                        lecture={lecture}
                        onToggle={() => onToggleAbsent(lecture.id)}
                      />
                    ))}
                  </div>
                  
                  {/* Break */}
                  {after.length > 0 && before.length > 0 && <BreakRow />}
                  
                  {/* Afternoon */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {after.map((lecture) => (
                      <LectureCard
                        key={lecture.id}
                        lecture={lecture}
                        onToggle={() => onToggleAbsent(lecture.id)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
