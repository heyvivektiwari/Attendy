"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { subjects, type AttendanceRecord } from "@/lib/attendance-store"
import { BookOpen, FlaskConical } from "lucide-react"
import { cn } from "@/lib/utils"

interface SubjectCardProps {
  subjectId: string
  record: AttendanceRecord
}

function getStatusColor(percentage: number): {
  bg: string
  text: string
  progress: string
  label: string
} {
  if (percentage >= 75) {
    return {
      bg: "bg-safe/10",
      text: "text-safe",
      progress: "bg-safe",
      label: "Safe",
    }
  } else if (percentage >= 70) {
    return {
      bg: "bg-warning/10",
      text: "text-warning",
      progress: "bg-warning",
      label: "Warning",
    }
  } else {
    return {
      bg: "bg-critical/10",
      text: "text-critical",
      progress: "bg-critical",
      label: "Critical",
    }
  }
}

export function SubjectCard({ subjectId, record }: SubjectCardProps) {
  const subject = subjects.find((s) => s.id === subjectId)
  if (!subject) return null

  const percentage = record.totalLectures > 0 
    ? Math.round((record.attendedLectures / record.totalLectures) * 100) 
    : 100

  const status = getStatusColor(percentage)
  const isLab = subject.type === "lab"

  return (
    <Card className={cn(
      "group relative flex flex-col h-full overflow-hidden transition-all duration-300 border-[3px] hover:-translate-y-1 hover:border-primary",
      "shadow-[0_10px_40px_rgba(26,19,47,0.12)] hover:shadow-[0_15px_50px_rgba(26,19,47,0.2)]",
      "bg-white dark:bg-card border-[#1A132F]/20 dark:border-primary/30"
    )}>
      <div className={cn("absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100", status.bg)} />
      <CardHeader className="relative pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {isLab ? (
              <FlaskConical className="h-4 w-4 text-primary" />
            ) : (
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {subject.code}
            </span>
            {isLab && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-0">
                Lab
              </Badge>
            )}
          </div>
          <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", status.bg, status.text)}>
            {status.label}
          </span>
        </div>
        <CardTitle className="text-base font-semibold mt-2 line-clamp-2 leading-tight">
          {subject.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative flex-1 flex flex-col">
        <div className="flex items-end justify-between mb-3 mt-auto">
          <div>
            <span className={cn("text-3xl font-bold tabular-nums", status.text)}>
              {percentage}%
            </span>
            <p className="text-xs text-muted-foreground mt-0.5">
              {record.attendedLectures}/{record.totalLectures} {isLab ? "labs" : "lectures"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">{subject.faculty}</p>
          </div>
        </div>
        <div className="h-2.5 bg-secondary/80 rounded-full overflow-hidden border border-border/50 shadow-inner">
          <div
            className={cn("h-full rounded-full transition-all duration-500 ease-out shadow-sm", status.progress)}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
