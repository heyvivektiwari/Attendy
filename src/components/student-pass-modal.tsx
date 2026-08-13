"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, ShieldAlert, Award, Printer, Copy, Check, Sparkles, School, User, Calendar, BookOpen, FlaskConical, QrCode } from "lucide-react"
import { useAttendanceStore } from "@/lib/attendance-store"
import { cn } from "@/lib/utils"

export function StudentPassModal() {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const { user, selectedBatch, branch, currentMonth, currentYear, getAttendanceStats } = useAttendanceStore()

  const stats = getAttendanceStats({ month: currentMonth, year: currentYear })
  const theoryPct = stats.theory.percentage
  const labPct = stats.lab.percentage

  const isSafe = theoryPct >= 75 && labPct >= 75
  const isWarning = (theoryPct >= 70 || labPct >= 70) && !isSafe

  const handleCopyDetails = () => {
    const text = `ATTENDY DIGITAL VERIFICATION PASS\nStudent: ${user?.name || "Student"}\nRoll No: ${user?.rollNo || "N/A"}\nBranch: ${branch}\nBatch: ${selectedBatch}\nTheory Average: ${theoryPct}%\nLab Average: ${labPct}%\nVerification Status: ${isSafe ? "VERIFIED SAFE (75%+ in both)" : isWarning ? "WARNING (70-74%)" : "DEFAULTER RISK (<70%)"}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2 h-9 px-3.5 rounded-xl border-2 font-extrabold bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 shadow-sm transition-all"
      >
        <Award className="h-4 w-4" />
        <span>Student Pass</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md p-0 rounded-3xl overflow-hidden border-[3px] border-[#1A132F]/20 dark:border-border/60 shadow-2xl bg-card text-card-foreground">
          {/* Card Header Banner */}
          <div className="bg-gradient-to-r from-[#005691] via-[#004A7C] to-[#070411] p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between relative z-10 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
                  <School className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-sm tracking-tight text-white">LTCE COLLEGE OF ENGG</h3>
                  <p className="text-[10px] text-white/70 font-semibold uppercase tracking-widest">Digital Attendance Pass</p>
                </div>
              </div>

              <Badge className={cn(
                "font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-lg backdrop-blur-md border",
                isSafe && "bg-emerald-500/90 text-white border-emerald-400",
                isWarning && "bg-amber-500/90 text-white border-amber-400",
                !isSafe && !isWarning && "bg-destructive/90 text-white border-red-400"
              )}>
                {isSafe ? "Verified Safe" : isWarning ? "Warning" : "Defaulter Risk"}
              </Badge>
            </div>

            {/* Student Profile Info */}
            <div className="flex items-center gap-4 relative z-10 pt-2">
              <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md border-2 border-white/20 flex items-center justify-center text-white font-black text-2xl shadow-inner shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : "S"}
              </div>

              <div className="space-y-0.5 min-w-0">
                <h2 className="text-lg font-black tracking-tight text-white truncate">{user?.name || "Vivek Tiwari"}</h2>
                <div className="flex flex-wrap items-center gap-2 text-xs text-white/80 font-bold">
                  <span>Roll: {user?.rollNo || "SEA156"}</span>
                  <span>•</span>
                  <span>Div: {user?.division || "A"}</span>
                  <span>•</span>
                  <span>Batch: {selectedBatch}</span>
                </div>
                <p className="text-[11px] text-white/70 font-medium truncate">{branch === "DataScience" ? "Data Science (CSE-DS)" : "Computer Engineering"}</p>
              </div>
            </div>
          </div>

          {/* Body Metrics Grid */}
          <div className="p-6 space-y-5 bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-secondary/30 border-2 border-border/50 text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-xs uppercase font-black text-muted-foreground">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Theory Average
                </div>
                <p className="text-2xl font-black text-foreground">{theoryPct}%</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-secondary/30 border-2 border-border/50 text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-xs uppercase font-black text-muted-foreground">
                  <FlaskConical className="h-4 w-4 text-primary" />
                  Lab Average
                </div>
                <p className="text-2xl font-black text-foreground">{labPct}%</p>
              </div>
            </div>

            {/* Verification Footer Card */}
            <div className="p-4 rounded-2xl bg-secondary/20 border-2 border-border/40 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Verification Ref</span>
                <p className="text-xs font-mono font-bold text-foreground">ATTENDY-VERIFIED-{user?.rollNo || "SEA156"}-2026</p>
                <p className="text-[10px] text-muted-foreground font-medium">Valid for Class Advisors, HOD & Parents</p>
              </div>

              <div className="p-2 rounded-xl bg-white dark:bg-black/40 border border-border/60 shadow-sm shrink-0">
                <QrCode className="h-8 w-8 text-foreground" />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="outline"
                onClick={handleCopyDetails}
                className="flex-1 gap-2 h-11 rounded-xl border-2 font-extrabold"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? "Copied Pass!" : "Copy Pass"}</span>
              </Button>

              <Button
                onClick={handlePrint}
                className="flex-1 gap-2 h-11 rounded-xl font-extrabold bg-primary text-primary-foreground"
              >
                <Printer className="h-4 w-4" />
                <span>Print / Save PDF</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
