"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Printer, FileSpreadsheet } from "lucide-react"
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
        console.log("Share API cancelled or failed, trying download fallback", e)
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

  const exportPDFPrint = () => {
    const rowsHtml = visibleSubjects.map((sub) => {
      const record = stats.bySubject.get(sub.id)
      const total = record?.totalLectures || 0
      const attended = record?.attendedLectures || 0
      const absent = total - attended
      const pct = total > 0 ? Math.round((attended / total) * 100) : 100
      const statusColor = pct >= 75 ? "#10b981" : pct >= 70 ? "#f59e0b" : "#ef4444"
      const statusText = pct >= 75 ? "Safe" : pct >= 70 ? "Warning" : "Critical"

      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${sub.code}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${sub.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-transform: uppercase; font-size: 11px;">${sub.type}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${total}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #10b981; font-weight: bold;">${attended}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #ef4444;">${absent}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: 800;">${pct}%</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center; color: ${statusColor}; font-weight: bold;">${statusText}</td>
        </tr>
      `
    }).join("")

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Attendance Statement - ${user?.name || "Student"}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 30px; color: #0f172a; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #005691; padding-bottom: 15px; margin-bottom: 20px; }
            .title { font-size: 24px; font-weight: 900; color: #005691; }
            .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
            .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; background: #f8fafc; padding: 15px; border-radius: 10px; margin-bottom: 25px; border: 1px solid #e2e8f0; }
            .meta-item { display: flex; flex-direction: column; }
            .meta-label { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; }
            .meta-val { font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 2px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
            th { background: #005691; color: white; text-align: left; padding: 10px; font-size: 12px; text-transform: uppercase; }
            .summary-box { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 20px; }
            .card { padding: 15px; background: #f1f5f9; border-radius: 10px; text-align: center; border: 1px solid #cbd5e1; }
            .card-title { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; }
            .card-val { font-size: 22px; font-weight: 900; color: #005691; margin-top: 5px; }
            .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">ATTENDY</div>
              <div class="subtitle">Official Student Attendance Statement</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 12px; font-weight: bold;">Date: ${new Date().toLocaleDateString()}</div>
              <div style="font-size: 11px; color: #64748b;">Period: ${scopeTitle}</div>
            </div>
          </div>

          <div class="meta-grid">
            <div class="meta-item"><span class="meta-label">Student Name</span><span class="meta-val">${user?.name || "Student"}</span></div>
            <div class="meta-item"><span class="meta-label">Roll Number</span><span class="meta-val">${user?.rollNo || "N/A"}</span></div>
            <div class="meta-item"><span class="meta-label">Branch</span><span class="meta-val">${branch === "DataScience" ? "Data Science (CSE-DS)" : "Computer Engineering"}</span></div>
            <div class="meta-item"><span class="meta-label">Batch</span><span class="meta-val">${selectedBatch}</span></div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Subject Name</th>
                <th>Type</th>
                <th style="text-align: center;">Total</th>
                <th style="text-align: center;">Attended</th>
                <th style="text-align: center;">Absent</th>
                <th style="text-align: center;">Attendance %</th>
                <th style="text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="summary-box">
            <div class="card">
              <div class="card-title">Theory Average</div>
              <div class="card-val">${stats.theory.percentage}%</div>
              <div style="font-size: 11px; color: #64748b;">${stats.theory.attended} / ${stats.theory.total} lectures</div>
            </div>
            <div class="card">
              <div class="card-title">Lab Average</div>
              <div class="card-val">${stats.lab.percentage}%</div>
              <div style="font-size: 11px; color: #64748b;">${stats.lab.attended} / ${stats.lab.total} labs</div>
            </div>
          </div>

          <div class="footer">
            Generated via Attendy Portal • Developed by Vivek Tiwari
          </div>
        </body>
      </html>
    `

    // Try popup window first
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
      }, 250)
      return
    }

    // Hidden iframe fallback for iOS Brave / Mobile Safari popup blockers
    const iframe = document.createElement("iframe")
    iframe.style.position = "fixed"
    iframe.style.right = "0"
    iframe.style.bottom = "0"
    iframe.style.width = "0"
    iframe.style.height = "0"
    iframe.style.border = "0"
    document.body.appendChild(iframe)

    const doc = iframe.contentWindow?.document || iframe.contentDocument
    if (doc) {
      doc.open()
      doc.write(htmlContent)
      doc.close()
      setTimeout(() => {
        iframe.contentWindow?.focus()
        iframe.contentWindow?.print()
        setTimeout(() => {
          document.body.removeChild(iframe)
        }, 1500)
      }, 300)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-10 px-3 rounded-xl border-[3px] border-[#1A132F]/15 dark:border-border/60 shadow-sm hover:border-primary transition-all">
          <FileText className="w-4 h-4 text-primary" />
          <span className="hidden sm:inline font-bold text-xs">Export Report</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md p-6 rounded-2xl border-[3px] border-[#1A132F]/15 dark:border-border/60 shadow-2xl bg-card text-card-foreground">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-extrabold tracking-tight">Export Attendance Report</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Select any month or term below to export your subject attendance statement.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-xs font-bold text-primary uppercase">Select Report Period / Month</label>
            <Select value={exportTarget} onValueChange={(val: string) => setExportTarget(val)}>
              <SelectTrigger className="h-11 border-[2px] border-border rounded-xl">
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

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button onClick={exportPDFPrint} className="h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white gap-2 shadow-md">
              <Printer className="h-4 w-4" />
              Print / Save PDF
            </Button>
            <Button onClick={exportCSV} variant="outline" className="h-12 rounded-xl font-bold border-2 border-primary/40 hover:bg-primary/10 gap-2">
              <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Download CSV
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
