"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, FileSpreadsheet, Download } from "lucide-react"
import { useAttendanceStore, getMonthLabel, SEMESTER_MONTHS, theorySubjects, labSubjects, dsTheorySubjects, dsLabSubjects } from "@/lib/attendance-store"

export function ExportReportModal() {
  const { user, branch, selectedBatch, selectedElective, currentMonth, currentYear, getAttendanceStats } = useAttendanceStore()
  const [open, setOpen] = useState(false)
  
  // Default export option value format: "m-y" or "overall"
  const [exportTarget, setExportTarget] = useState<string>(`${currentMonth}-${currentYear}`)

  const getTargetStats = () => {
    if (exportTarget === "overall") {
      return getAttendanceStats({ startMonth: 6, startYear: 2026, endMonth: 10, endYear: 2026 })
    }
    const [m, y] = exportTarget.split("-").map(Number)
    return getAttendanceStats({ month: m, year: y })
  }

  const getTargetLabel = () => {
    if (exportTarget === "overall") return "Academic Term (July - Nov 2026)"
    const [m, y] = exportTarget.split("-").map(Number)
    return getMonthLabel(m, y)
  }

  const stats = getTargetStats()
  const scopeTitle = getTargetLabel()

  const visibleSubjects = (branch === "DataScience" ? [...dsTheorySubjects, ...dsLabSubjects] : [...theorySubjects, ...labSubjects]).filter((s) => {
    if (branch === "DataScience") return true
    if (s.id === "pec_nlp" || s.id === "pecl_nlp") return selectedElective === "NLP"
    if (s.id === "pec_bda" || s.id === "pecl_bda") return selectedElective === "BDA"
    return true
  })

  const exportCSV = async () => {
    let csv = `ATTENDY OFFICIAL ATTENDANCE STATEMENT\n`
    csv += `Student Name,${user?.name || "Student"}\n`
    csv += `Roll Number,${user?.rollNo || "N/A"}\n`
    csv += `Branch,${branch === "DataScience" ? "Data Science (CSE-DS)" : "Computer Engineering"}\n`
    csv += `Batch,${selectedBatch}\n`
    csv += `Report Period,${scopeTitle}\n\n`

    csv += `Subject Code,Subject Name,Type,Total Scheduled,Attended,Absences,Percentage (%),Status\n`

    visibleSubjects.forEach((sub) => {
      const record = stats.bySubject.get(sub.id)
      const total = record?.totalLectures || 0
      const attended = record?.attendedLectures || 0
      const absent = total - attended
      const pct = total > 0 ? Math.round((attended / total) * 100) : 100
      const status = pct >= 75 ? "SAFE" : pct >= 70 ? "WARNING" : "CRITICAL"

      csv += `"${sub.code}","${sub.name}","${sub.type.toUpperCase()}",${total},${attended},${absent},${pct}%,${status}\n`
    })

    csv += `\nSUMMARY\n`
    csv += `Theory Average,${stats.theory.attended}/${stats.theory.total},${stats.theory.percentage}%\n`
    csv += `Lab Average,${stats.lab.attended}/${stats.lab.total},${stats.lab.percentage}%\n`

    const fileName = `Attendance_Report_${user?.rollNo || "Student"}_${exportTarget}.csv`
    const file = new File([csv], fileName, { type: "text/csv" })

    // On iOS Brave/Safari, use Native Web Share if available
    if (typeof navigator !== "undefined" && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "Attendance Report",
          text: `Attendance report for ${user?.name || "Student"} (${scopeTitle})`
        })
        return
      } catch (e) {
        console.log("Share API cancelled or failed, falling back to download", e)
      }
    }

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    setTimeout(() => {
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-10 px-3 rounded-xl border-[3px] border-[#1A132F]/15 dark:border-border/60 shadow-sm hover:border-primary transition-all">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="hidden sm:inline font-bold text-xs">Export CSV</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md p-6 rounded-2xl border-[3px] border-[#1A132F]/15 dark:border-border/60 shadow-2xl bg-card text-card-foreground">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-extrabold tracking-tight">Export Attendance CSV</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Select any month or academic period below to download your attendance CSV file.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-xs font-bold text-primary uppercase">Select Report Period / Month</label>
            <Select value={exportTarget} onValueChange={(val: string) => setExportTarget(val)}>
              <SelectTrigger className="h-11 border-[2px] border-border rounded-xl font-semibold">
                <SelectValue placeholder="Select Month or Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overall">Academic Term (July - Nov 2026)</SelectItem>
                {SEMESTER_MONTHS.map((m) => (
                  <SelectItem key={`${m.month}-${m.year}`} value={`${m.month}-${m.year}`}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="pt-2">
            <Button onClick={exportCSV} className="w-full h-12 rounded-xl font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-md">
              <Download className="h-4 w-4" />
              Download CSV Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
