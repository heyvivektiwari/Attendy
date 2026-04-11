"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, XCircle, BookOpen, FlaskConical } from "lucide-react"
import { Logo } from "@/components/logo"

interface StatsData {
  attended: number
  total: number
  percentage: number
}

interface OverallStatsProps {
  theory: StatsData
  lab: StatsData
  overall: StatsData
}

function getStatus(percentage: number) {
  if (percentage >= 75) {
    return {
      icon: CheckCircle2,
      label: "Safe",
      color: "text-safe",
      bg: "bg-safe/10",
      border: "border-safe/20",
    }
  } else if (percentage >= 70) {
    return {
      icon: AlertTriangle,
      label: "Warning",
      color: "text-warning",
      bg: "bg-warning/10",
      border: "border-warning/20",
    }
  } else {
    return {
      icon: XCircle,
      label: "Critical",
      color: "text-critical",
      bg: "bg-critical/10",
      border: "border-critical/20",
    }
  }
}

function StatCard({ 
  title, 
  icon: Icon, 
  data, 
  type 
}: { 
  title: string
  icon: React.ElementType
  data: StatsData
  type: "theory" | "lab" | "overall"
}) {
  const status = getStatus(data.percentage)
  const lecturesCanMiss = Math.floor((data.attended - 0.75 * data.total) / 0.75)
  const needToAttend = Math.ceil((0.75 * data.total - data.attended) / 0.25)

  return (
    <Card className={cn("overflow-hidden border transition-colors duration-300", status.border)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn("p-2 rounded-lg", status.bg)}>
              <Icon className={cn("h-4 w-4", type === "overall" ? status.color : "text-foreground")} />
            </div>
            <span className="font-medium text-sm">{title}</span>
          </div>
          <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", status.bg, status.color)}>
            {status.label}
          </span>
        </div>
        
        <div className="flex items-baseline gap-2">
          <span className={cn("text-4xl font-bold tabular-nums tracking-tight", status.color)}>
            {data.percentage}%
          </span>
          {data.percentage >= 75 ? (
            <TrendingUp className="h-4 w-4 text-safe" />
          ) : (
            <TrendingDown className="h-4 w-4 text-critical" />
          )}
        </div>
        
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          <span>{data.attended}/{data.total} attended</span>
          <span className={cn("font-medium", lecturesCanMiss >= 0 ? "text-safe" : "text-critical")}>
            {lecturesCanMiss >= 0 ? `Can miss ${lecturesCanMiss}` : `Need ${needToAttend} more`}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="h-2 bg-secondary rounded-full overflow-hidden relative">
            <div className="absolute left-[75%] top-0 bottom-0 w-0.5 bg-foreground/20 z-10" />
            <div
              className={cn("h-full rounded-full transition-all duration-700 ease-out", 
                data.percentage >= 75 ? "bg-safe" : data.percentage >= 70 ? "bg-warning" : "bg-critical"
              )}
              style={{ width: `${Math.min(data.percentage, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function OverallStats({ theory, lab, overall }: OverallStatsProps) {
  const overallStatus = getStatus(overall.percentage)
  const StatusIcon = overallStatus.icon

  return (
    <div className="space-y-4">
      {/* Main Overall Card */}
      <Card className={cn("overflow-hidden border-2 transition-colors duration-300", overallStatus.border)}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className={cn("p-4 rounded-2xl", overallStatus.bg)}>
                <StatusIcon className={cn("h-8 w-8", overallStatus.color)} />
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className={cn("text-5xl font-bold tabular-nums tracking-tight", overallStatus.color)}>
                    {overall.percentage}%
                  </span>
                  {overall.percentage >= 75 ? (
                    <TrendingUp className="h-5 w-5 text-safe" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-critical" />
                  )}
                </div>
                <p className="text-lg font-medium text-foreground mt-1">Overall Attendance</p>
                <p className="text-sm text-muted-foreground">
                  {overall.attended} of {overall.total} attended (Theory + Lab)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theory and Lab Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title="Theory Attendance"
          icon={BookOpen}
          data={theory}
          type="theory"
        />
        <StatCard
          title="Lab Attendance"
          icon={FlaskConical}
          data={lab}
          type="lab"
        />
      </div>
    </div>
  )
}
