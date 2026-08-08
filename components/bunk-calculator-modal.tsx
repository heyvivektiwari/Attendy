"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calculator, Sparkles, AlertTriangle, ShieldCheck, RefreshCw } from "lucide-react"
import { useAttendanceStore, getMonthLabel, dsTheorySubjects, dsLabSubjects, theorySubjects, labSubjects } from "@/lib/attendance-store"
import { cn } from "@/lib/utils"

export function BunkCalculatorModal() {
  const { branch, selectedBatch, selectedElective, currentMonth, currentYear, getAttendanceStats, statsMode } = useAttendanceStore()
  const [open, setOpen] = useState(false)
  const [simulatedAbsences, setSimulatedAbsences] = useState<Record<string, number>>({})

  const stats = statsMode === "monthly"
    ? getAttendanceStats({ month: currentMonth, year: currentYear })
    : getAttendanceStats({ startMonth: 6, startYear: 2026, endMonth: 10, endYear: 2026 })

  const visibleSubjects = (branch === "DataScience" ? [...dsTheorySubjects, ...dsLabSubjects] : [...theorySubjects, ...labSubjects]).filter((s) => {
    if (branch === "DataScience") return true
    if (s.id === "pec_nlp" || s.id === "pecl_nlp") return selectedElective === "NLP"
    if (s.id === "pec_bda" || s.id === "pecl_bda") return selectedElective === "BDA"
    return true
  })

  // Calculate simulated overall stats
  let totalScheduled = 0
  let totalAttended = 0

  visibleSubjects.forEach((sub) => {
    const record = stats.bySubject.get(sub.id)
    const baseScheduled = record?.totalLectures || 0
    const baseAttended = record?.attendedLectures || 0
    const extraBunks = simulatedAbsences[sub.id] || 0

    // Simulating future lectures where student bunks 'extraBunks'
    const simScheduled = baseScheduled + extraBunks
    const simAttended = baseAttended // attended stays same, extraBunks added to total scheduled
    totalScheduled += simScheduled
    totalAttended += simAttended
  })

  const currentPct = stats.overall.percentage
  const simPct = totalScheduled > 0 ? Math.round((totalAttended / totalScheduled) * 100) : 100

  // Calculate overall safe bunks or required lectures
  const safeBunks = Math.floor((stats.overall.attended - 0.75 * stats.overall.total) / 0.75)
  const requiredLectures = Math.ceil((0.75 * stats.overall.total - stats.overall.attended) / 0.25)

  const handleSliderChange = (subjectId: string, val: number) => {
    setSimulatedAbsences((prev) => ({ ...prev, [subjectId]: val }))
  }

  const resetSimulation = () => {
    setSimulatedAbsences({})
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-10 px-3 rounded-xl border-[3px] border-[#1A132F]/15 dark:border-border/60 shadow-sm hover:border-primary transition-all">
          <Calculator className="w-4 h-4 text-primary" />
          <span className="hidden sm:inline font-bold text-xs">Bunk Simulator</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl border-[3px] border-[#1A132F]/15 dark:border-border/60 shadow-2xl bg-card text-card-foreground">
        <DialogHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Calculator className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-extrabold tracking-tight">Safe Bunk Calculator & Simulator</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Simulate future lecture bunks and see your projected attendance percentage in real-time.
                </DialogDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={resetSimulation} className="h-8 text-xs font-bold gap-1">
              <RefreshCw className="h-3.5 w-3.5" />
              Reset
            </Button>
          </div>
        </DialogHeader>

        {/* Current Safety Status Banner */}
        <div className={cn(
          "p-4 rounded-xl border-2 flex items-center justify-between gap-4 transition-colors",
          safeBunks >= 0 
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
            : "bg-destructive/10 border-destructive/30 text-destructive"
        )}>
          <div className="flex items-center gap-3">
            {safeBunks >= 0 ? (
              <ShieldCheck className="h-7 w-7 text-emerald-500 shrink-0" />
            ) : (
              <AlertTriangle className="h-7 w-7 text-destructive shrink-0" />
            )}
            <div>
              <p className="text-sm font-black">
                {safeBunks >= 0 
                  ? `Safe Zone: You can miss ${safeBunks} more ${safeBunks === 1 ? 'session' : 'sessions'}`
                  : `Deficit Zone: Need ${requiredLectures} more ${requiredLectures === 1 ? 'session' : 'sessions'}`
                }
              </p>
              <p className="text-xs opacity-80 mt-0.5">
                {safeBunks >= 0 
                  ? "Your attendance is safely above the 75% college requirement."
                  : "Attend upcoming lectures continuously to restore safe status."
                }
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-2xl font-black tabular-nums">{currentPct}%</span>
            <span className="block text-[10px] uppercase font-bold opacity-70">Current</span>
          </div>
        </div>

        {/* Live Simulation Projection Box */}
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-widest text-primary flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              Projected Outcome
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-muted-foreground line-through">{currentPct}%</span>
              <span className={cn(
                "text-2xl font-black tabular-nums",
                simPct >= 75 ? "text-emerald-500" : simPct >= 70 ? "text-amber-500" : "text-destructive"
              )}>
                {simPct}%
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {Object.values(simulatedAbsences).reduce((a, b) => a + b, 0) === 0
              ? "Move the sliders below to simulate extra bunks for upcoming lectures."
              : `Simulating ${Object.values(simulatedAbsences).reduce((a, b) => a + b, 0)} additional bunks across your subjects.`
            }
          </p>
        </div>

        {/* Subject Sliders */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-extrabold uppercase tracking-widest text-primary">Simulate Bunks per Subject</label>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {visibleSubjects.map((sub) => {
              const record = stats.bySubject.get(sub.id)
              const baseScheduled = record?.totalLectures || 0
              const baseAttended = record?.attendedLectures || 0
              const extraBunks = simulatedAbsences[sub.id] || 0
              const simSubTotal = baseScheduled + extraBunks
              const simSubPct = simSubTotal > 0 ? Math.round((baseAttended / simSubTotal) * 100) : 100

              return (
                <div key={sub.id} className="p-3 rounded-xl bg-secondary/20 border border-border/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs">{sub.shortName} ({sub.type.toUpperCase()})</span>
                      <span className="text-[11px] text-muted-foreground ml-2">Current: {baseAttended}/{baseScheduled}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-primary">+{extraBunks} bunks</span>
                      <span className={cn("text-xs font-black tabular-nums px-2 py-0.5 rounded-md", simSubPct >= 75 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-destructive/10 text-destructive")}>
                        {simSubPct}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={10}
                      value={extraBunks}
                      onChange={(e) => handleSliderChange(sub.id, Number(e.target.value))}
                      className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
