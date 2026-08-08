"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  BookOpen, 
  FlaskConical, 
  Save, 
  RotateCcw, 
  AlertTriangle,
  Check,
  Clock,
  MapPin,
  ListChecks,
  SlidersHorizontal
} from "lucide-react"
import { 
  useAttendanceStore, 
  theorySubjects, 
  labSubjects, 
  dsTheorySubjects, 
  dsLabSubjects,
  subjects as allSubjects,
  type Lecture 
} from "@/lib/attendance-store"
import { cn } from "@/lib/utils"

interface JulyEntryModalProps {
  trigger?: React.ReactNode
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function JulyEntryModal({ trigger, isOpen: externalOpen, onOpenChange: setExternalOpen }: JulyEntryModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = externalOpen !== undefined
  const open = isControlled ? externalOpen : internalOpen
  const setOpen = (val: boolean) => {
    if (setExternalOpen) setExternalOpen(val)
    if (!isControlled) setInternalOpen(val)
  }

  const { 
    lectures, 
    branch, 
    selectedBatch, 
    selectedElective, 
    initializeMonth,
    updateJulySubjectAttendance,
    setJulyLecturesAttendance,
    resetJulyAttendance
  } = useAttendanceStore()

  // Make sure July (month 6, year 2026) is initialized when opening modal
  useEffect(() => {
    if (open) {
      initializeMonth(6, 2026)
    }
  }, [open, initializeMonth])

  // Get all scheduled July lectures matching user profile
  const julyLectures = lectures.filter((l) => {
    if (l.month !== 6 || l.year !== 2026) return false
    if (l.batch && l.batch !== selectedBatch) return false
    if (l.elective && l.elective !== selectedElective) return false
    if (l.branch && l.branch !== branch) return false
    return true
  })

  // Visible subjects based on branch and elective
  const visibleTheorySubjects = (branch === "DataScience" ? dsTheorySubjects : theorySubjects).filter((s) => {
    if (branch === "DataScience") return true
    if (s.id === "pec_nlp" && selectedElective !== "NLP") return false
    if (s.id === "pec_bda" && selectedElective !== "BDA") return false
    return true
  })

  const visibleLabSubjects = (branch === "DataScience" ? dsLabSubjects : labSubjects).filter((s) => {
    if (branch === "DataScience") return true
    if (s.id === "pecl_nlp" && selectedElective !== "NLP") return false
    if (s.id === "pecl_bda" && selectedElective !== "BDA") return false
    return true
  })

  const visibleSubjects = [...visibleTheorySubjects, ...visibleLabSubjects]

  // State for Subject-by-Subject manual inputs (stored as strings to allow empty/clean typing)
  const [percentInputs, setPercentInputs] = useState<Record<string, string>>({})
  const [attendedInputs, setAttendedInputs] = useState<Record<string, string>>({})
  // State for Individual Lecture toggles (lectureId -> isAbsent)
  const [lectureToggles, setLectureToggles] = useState<Record<string, boolean>>({})

  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  // Synchronize local modal state when opening: don't pre-fit 100% numbers
  useEffect(() => {
    if (!open) return

    // Check if there are any custom recorded absences for July
    const hasExistingAbsences = julyLectures.some((l) => l.isAbsent)

    const initialAttended: Record<string, string> = {}
    const initialPercent: Record<string, string> = {}

    visibleSubjects.forEach((sub) => {
      const subLectures = julyLectures.filter((l) => l.subjectId === sub.id)
      const totalScheduled = subLectures.length
      if (hasExistingAbsences) {
        const attended = subLectures.filter((l) => !l.isAbsent).length
        initialAttended[sub.id] = String(attended)
        const pct = totalScheduled > 0 ? Math.round((attended / totalScheduled) * 100) : 0
        initialPercent[sub.id] = String(pct)
      } else {
        // No prefitted numbers: leave blank for user to enter
        initialAttended[sub.id] = ""
        initialPercent[sub.id] = ""
      }
    })

    setAttendedInputs(initialAttended)
    setPercentInputs(initialPercent)

    const initialToggles: Record<string, boolean> = {}
    julyLectures.forEach((l) => {
      initialToggles[l.id] = l.isAbsent
    })
    setLectureToggles(initialToggles)
  }, [open, lectures])

  // Handle direct Percentage input change
  const handlePctChange = (subjectId: string, val: string, totalScheduled: number) => {
    if (val === "") {
      setPercentInputs((prev) => ({ ...prev, [subjectId]: "" }))
      setAttendedInputs((prev) => ({ ...prev, [subjectId]: "" }))
      return
    }
    const num = parseFloat(val)
    if (isNaN(num)) return
    const clampedPct = Math.max(0, Math.min(100, num))
    setPercentInputs((prev) => ({ ...prev, [subjectId]: val }))
    const calculatedAttended = Math.round((clampedPct / 100) * totalScheduled)
    setAttendedInputs((prev) => ({ ...prev, [subjectId]: String(calculatedAttended) }))
  }

  // Handle direct Attended count input change
  const handleAttendedChange = (subjectId: string, val: string, totalScheduled: number) => {
    if (val === "") {
      setAttendedInputs((prev) => ({ ...prev, [subjectId]: "" }))
      setPercentInputs((prev) => ({ ...prev, [subjectId]: "" }))
      return
    }
    const num = parseInt(val)
    if (isNaN(num)) return
    const clamped = Math.max(0, Math.min(totalScheduled, num))
    setAttendedInputs((prev) => ({ ...prev, [subjectId]: val }))
    const calcPct = totalScheduled > 0 ? Math.round((clamped / totalScheduled) * 100) : 0
    setPercentInputs((prev) => ({ ...prev, [subjectId]: String(calcPct) }))
  }

  // Step attended count up or down
  const handleStepAttended = (subjectId: string, delta: number, totalScheduled: number) => {
    const current = parseInt(attendedInputs[subjectId] || "0") || 0
    const next = Math.max(0, Math.min(totalScheduled, current + delta))
    setAttendedInputs((prev) => ({ ...prev, [subjectId]: String(next) }))
    const calcPct = totalScheduled > 0 ? Math.round((next / totalScheduled) * 100) : 0
    setPercentInputs((prev) => ({ ...prev, [subjectId]: String(calcPct) }))
  }

  // Handle individual lecture toggle
  const toggleLectureStatus = (lectureId: string) => {
    setLectureToggles((prev) => {
      const current = prev[lectureId] !== undefined ? prev[lectureId] : false
      const next = !current
      const updated = { ...prev, [lectureId]: next }

      // Update subject count preview for subject tab as well
      const lecture = julyLectures.find((l) => l.id === lectureId)
      if (lecture) {
        const subLectures = julyLectures.filter((l) => l.subjectId === lecture.subjectId)
        const attended = subLectures.filter((l) => !updated[l.id]).length
        setAttendedInputs((counts) => ({ ...counts, [lecture.subjectId]: String(attended) }))
        const total = subLectures.length
        const pct = total > 0 ? Math.round((attended / total) * 100) : 0
        setPercentInputs((pcts) => ({ ...pcts, [lecture.subjectId]: String(pct) }))
      }

      return updated
    })
  }

  // Save Subject-by-Subject attended counts
  const handleSaveBySubject = async () => {
    setSaving(true)
    try {
      for (const sub of visibleSubjects) {
        const subLectures = julyLectures.filter((l) => l.subjectId === sub.id)
        const totalScheduled = subLectures.length
        let attended = 0

        if (attendedInputs[sub.id] !== undefined && attendedInputs[sub.id] !== "") {
          attended = parseInt(attendedInputs[sub.id]) || 0
        } else if (percentInputs[sub.id] !== undefined && percentInputs[sub.id] !== "") {
          const pct = parseFloat(percentInputs[sub.id]) || 0
          attended = Math.round((pct / 100) * totalScheduled)
        }

        const clamped = Math.max(0, Math.min(totalScheduled, attended))
        await updateJulySubjectAttendance(sub.id, clamped)
      }
      setSavedSuccess(true)
      setTimeout(() => {
        setSavedSuccess(false)
        setOpen(false)
      }, 900)
    } catch (e) {
      console.error("Failed to save July attendance by subject", e)
    } finally {
      setSaving(false)
    }
  }

  // Save Individual Lectures toggles
  const handleSaveIndividual = async () => {
    setSaving(true)
    try {
      await setJulyLecturesAttendance(lectureToggles)
      setSavedSuccess(true)
      setTimeout(() => {
        setSavedSuccess(false)
        setOpen(false)
      }, 900)
    } catch (e) {
      console.error("Failed to save July individual lectures", e)
    } finally {
      setSaving(false)
    }
  }

  // Format date helper
  const formatDateStr = (id: string) => {
    const parts = id.split("-")
    if (parts.length >= 3) {
      const [y, m, d] = parts
      const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d))
      return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    }
    return id
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-3xl lg:max-w-4xl w-[92vw] max-h-[85vh] flex flex-col p-4 sm:p-6 rounded-3xl border-[3px] border-[#1A132F]/20 dark:border-primary/40 shadow-2xl bg-card text-card-foreground overflow-hidden">
        <DialogHeader className="flex-none space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl sm:text-2xl font-extrabold tracking-tight">July Attendance Entry</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Official Defaulter List Sync · App launched in August
                </DialogDescription>
              </div>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs font-bold px-3 py-1 rounded-full shrink-0">
              July 2026
            </Badge>
          </div>

          {/* Context Banner */}
          <div className="p-3 bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl flex items-start gap-2.5 text-amber-700 dark:text-amber-300">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="text-[11px] sm:text-xs leading-relaxed font-medium">
              Enter your official July Defaulter <strong>Percentage (%)</strong> or <strong>Attended Count</strong> for each subject below. No attendance is assumed by default.
            </p>
          </div>
        </DialogHeader>

        <Tabs defaultValue="subject" className="flex-1 flex flex-col min-h-0 mt-2 space-y-3 overflow-hidden">
          <div className="flex-none flex items-center justify-between gap-2 border-b pb-2">
            <TabsList className="bg-secondary/40 p-1 rounded-xl border border-border">
              <TabsTrigger value="subject" className="gap-2 text-xs font-bold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                By Percentage (%) or Subject Count
              </TabsTrigger>
              <TabsTrigger value="individual" className="gap-2 text-xs font-bold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
                <ListChecks className="h-3.5 w-3.5" />
                Individual Sessions
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: BY SUBJECT summary entry */}
          <TabsContent value="subject" className="flex-1 flex flex-col min-h-0 overflow-hidden space-y-3 mt-0">
            <div className="flex-1 overflow-y-auto pr-1.5 space-y-3 min-h-0">
              {visibleSubjects.map((sub) => {
                const subLectures = julyLectures.filter((l) => l.subjectId === sub.id)
                const totalScheduled = subLectures.length
                const rawPct = percentInputs[sub.id]
                const rawAttended = attendedInputs[sub.id]
                const isLab = sub.type === "lab"
                
                const numPct = rawPct !== undefined && rawPct !== "" ? parseFloat(rawPct) : null
                const statusColor = numPct !== null
                  ? (numPct >= 75 ? "text-emerald-600 dark:text-emerald-400" : numPct >= 70 ? "text-amber-600 dark:text-amber-400" : "text-destructive")
                  : "text-muted-foreground"

                return (
                  <div 
                    key={sub.id} 
                    className="p-3.5 sm:p-4 rounded-2xl border-2 border-border/70 bg-card hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isLab ? (
                          <FlaskConical className="h-4 w-4 text-primary shrink-0" />
                        ) : (
                          <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <span className="font-extrabold text-sm leading-tight">{sub.name}</span>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 uppercase font-bold shrink-0">
                          {isLab ? "Lab" : "Theory"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Faculty: {sub.faculty} · Scheduled in July: <span className="font-bold text-foreground">{totalScheduled}</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                      {/* Direct Percentage Entry Input */}
                      <div className="flex items-center gap-1.5 bg-secondary/30 px-2.5 py-1 rounded-xl border border-border/60">
                        <span className="text-[11px] font-extrabold text-muted-foreground uppercase whitespace-nowrap">Enter %:</span>
                        <div className="relative flex items-center">
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            placeholder="—"
                            value={rawPct ?? ""}
                            onChange={(e) => handlePctChange(sub.id, e.target.value, totalScheduled)}
                            className="h-8 w-20 text-center font-extrabold text-sm rounded-lg border-2 pr-5"
                          />
                          <span className="absolute right-2 text-xs font-black text-muted-foreground pointer-events-none">%</span>
                        </div>
                      </div>

                      {/* Attended Count Counter */}
                      <div className="flex items-center gap-2 bg-secondary/20 px-2.5 py-1 rounded-xl border border-border/40">
                        <span className="text-xs text-muted-foreground font-bold whitespace-nowrap">Attended:</span>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-sm font-bold border-2"
                            onClick={() => handleStepAttended(sub.id, -1, totalScheduled)}
                            disabled={(parseInt(rawAttended || "0") || 0) <= 0}
                          >
                            -
                          </Button>
                          <Input
                            type="number"
                            min={0}
                            max={totalScheduled}
                            placeholder="0"
                            value={rawAttended ?? ""}
                            onChange={(e) => handleAttendedChange(sub.id, e.target.value, totalScheduled)}
                            className="h-8 w-14 text-center font-extrabold text-sm rounded-lg border-2"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-sm font-bold border-2"
                            onClick={() => handleStepAttended(sub.id, 1, totalScheduled)}
                            disabled={(parseInt(rawAttended || "0") || 0) >= totalScheduled}
                          >
                            +
                          </Button>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">/ {totalScheduled}</span>
                      </div>

                      <div className="min-w-[45px] text-right">
                        <span className={cn("text-base font-black tabular-nums", statusColor)}>
                          {numPct !== null ? `${numPct}%` : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex-none pt-3 border-t flex items-center justify-end gap-3 mt-auto">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="h-10 px-5 rounded-xl font-bold border-2"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveBySubject}
                disabled={saving}
                className={cn(
                  "h-10 px-6 rounded-xl font-extrabold gap-2 transition-all shadow-md",
                  savedSuccess 
                    ? "bg-emerald-600 text-white" 
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                {savedSuccess ? (
                  <>
                    <Check className="h-4 w-4" />
                    Saved to July!
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {saving ? "Saving..." : "Save July Attendance"}
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* TAB 2: INDIVIDUAL LECTURES & LABS checklist */}
          <TabsContent value="individual" className="flex-1 flex flex-col min-h-0 overflow-hidden space-y-3 mt-0">
            <div className="flex-1 overflow-y-auto pr-1.5 space-y-2.5 min-h-0">
              {julyLectures.map((lecture) => {
                const sub = allSubjects.find((s) => s.id === lecture.subjectId)
                const isAbsent = lectureToggles[lecture.id] !== undefined ? lectureToggles[lecture.id] : lecture.isAbsent
                const isLab = sub?.type === "lab"

                return (
                  <div
                    key={lecture.id}
                    className={cn(
                      "p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 cursor-pointer",
                      isAbsent
                        ? "bg-destructive/10 border-destructive/30 hover:border-destructive/50"
                        : "bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50"
                    )}
                    onClick={() => toggleLectureStatus(lecture.id)}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground uppercase">
                          {formatDateStr(lecture.id)}
                        </span>
                        <span className="font-extrabold text-sm truncate">{sub?.name || lecture.subjectId}</span>
                        {isLab && (
                          <Badge variant="secondary" className="text-[9px] px-1 py-0 h-3.5 bg-primary/10 text-primary border-0 font-bold">
                            Lab
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="h-3.5 w-3.5" />
                          {lecture.startTime} - {lecture.endTime}
                        </span>
                        {lecture.room && (
                          <span className="flex items-center gap-1 font-medium">
                            <MapPin className="h-3.5 w-3.5" />
                            {lecture.room}
                          </span>
                        )}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      type="button"
                      variant={isAbsent ? "destructive" : "default"}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleLectureStatus(lecture.id)
                      }}
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

              {julyLectures.length === 0 && (
                <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-2xl">
                  No July sessions found for your batch/elective.
                </div>
              )}
            </div>

            <div className="flex-none pt-3 border-t flex items-center justify-end gap-3 mt-auto">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="h-10 px-5 rounded-xl font-bold border-2"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveIndividual}
                disabled={saving}
                className={cn(
                  "h-10 px-6 rounded-xl font-extrabold gap-2 transition-all shadow-md",
                  savedSuccess 
                    ? "bg-emerald-600 text-white" 
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                {savedSuccess ? (
                  <>
                    <Check className="h-4 w-4" />
                    Saved to July!
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {saving ? "Saving..." : "Save July Sessions"}
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
