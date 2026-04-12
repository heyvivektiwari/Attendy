"use client"

import { useAttendanceStore } from "@/lib/attendance-store"
import { Button } from "@/components/ui/button"
import { LogOut, Menu, Calendar, LayoutGrid, BarChart2, MessageSquare, ChevronDown, Check, X } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SEMESTER_MONTHS } from "@/lib/attendance-store"
import { Logo } from "@/components/logo"
import { ThemeCustomizer } from "@/components/theme-customizer"
import { cn } from "@/lib/utils"

import { useState } from "react"

export function DashboardHeader() {
  const { 
    user, logout, 
    statsMode, setStatsMode, 
    currentMonth, currentYear, setCurrentMonth,
    mainView, setMainView,
    rangeStartMonth, rangeStartYear,
    rangeEndMonth, rangeEndYear,
    setRange,
    hasPendingChanges, saveChanges, discardChanges
  } = useAttendanceStore()
  
  const [isCustomRangeActive, setIsCustomRangeActive] = useState(false)
  const currentMonthValue = `${currentMonth}-${currentYear}`
  const rangeStartValue = `${rangeStartMonth}-${rangeStartYear}`
  const rangeEndValue = `${rangeEndMonth}-${rangeEndYear}`

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden lg:flex w-12 h-12 border-[3px] border-[#1A132F]/20 dark:border-primary/40 rounded-full shadow-[0_4px_15px_rgba(26,19,47,0.08)] bg-white dark:bg-transparent hover:border-primary transition-all active:scale-95">
                <Menu className="h-8 w-8" strokeWidth={3} />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[310px] flex flex-col px-6">
              <SheetHeader className="px-2">
                <SheetTitle className="text-left font-bold text-2xl tracking-tight">Menu</SheetTitle>
              </SheetHeader>
              
              <div className="flex-1 overflow-auto py-8 space-y-9 px-2 pr-4">
                <div className="space-y-4">
                  <h3 className="text-base font-black text-primary uppercase tracking-tighter pl-1">Main App View</h3>
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "justify-start h-12 px-4 rounded-xl border-[3px] border-transparent transition-all", 
                        mainView === "dashboard" && "font-extrabold bg-[#005691]/15 text-[#005691] border-[#005691]/50 shadow-sm dark:bg-primary/20 dark:text-white dark:border-primary/50"
                      )} 
                      onClick={() => setMainView("dashboard")}
                    >
                      <LayoutGrid className={cn("mr-3 h-5 w-5", mainView === "dashboard" && "text-primary")} />
                      Dashboard
                    </Button>
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "justify-start h-12 px-4 rounded-xl border-[3px] border-transparent transition-all", 
                        mainView === "attendance-marker" && "font-extrabold bg-[#005691]/15 text-[#005691] border-[#005691]/50 shadow-sm dark:bg-primary/20 dark:text-white dark:border-primary/50"
                      )} 
                      onClick={() => setMainView("attendance-marker")}
                    >
                      <Calendar className={cn("mr-3 h-5 w-5", mainView === "attendance-marker" && "text-primary")} />
                      Attendance Marker
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-base font-black text-primary uppercase tracking-tighter pl-1">Stats View</h3>
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "justify-start h-12 px-4 rounded-xl border-[3px] border-transparent transition-all", 
                        statsMode === "monthly" && mainView === "dashboard" && "font-extrabold bg-[#005691]/15 text-[#005691] border-[#005691]/50 shadow-sm dark:bg-primary/20 dark:text-white dark:border-primary/50"
                      )} 
                      onClick={() => {
                        setStatsMode("monthly");
                        setMainView("dashboard");
                      }}
                    >
                      <BarChart2 className={cn("mr-3 h-5 w-5", statsMode === "monthly" && mainView === "dashboard" && "text-primary")} />
                      Monthly Average
                    </Button>
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "justify-start h-12 px-4 rounded-xl border-[3px] border-transparent transition-all", 
                        statsMode === "overall" && mainView === "dashboard" && "font-extrabold bg-[#005691]/15 text-[#005691] border-[#005691]/50 shadow-sm dark:bg-primary/20 dark:text-white dark:border-primary/50"
                      )} 
                      onClick={() => {
                        if (statsMode === "overall") {
                          setIsCustomRangeActive(!isCustomRangeActive);
                        } else {
                          setStatsMode("overall");
                          setMainView("dashboard");
                        }
                      }}
                    >
                      <BarChart2 className={cn("mr-3 h-5 w-5", statsMode === "overall" && mainView === "dashboard" && "text-primary")} />
                      Term Attendance
                      {statsMode === "overall" && <ChevronDown className={cn("ml-auto h-4 w-4 transition-transform", isCustomRangeActive && "rotate-180")} />}
                    </Button>
                  </div>
                </div>

                {statsMode === "monthly" && (
                  <div className="space-y-4">
                    <h3 className="text-base font-black text-primary uppercase tracking-tighter pl-1">Monthly Average</h3>
                    <Select 
                      value={currentMonthValue} 
                      onValueChange={(val) => {
                        const [m, y] = val.split('-').map(Number)
                        setCurrentMonth(m, y)
                      }}
                    >
                      <SelectTrigger className="h-11 border-[3px] border-[#1A132F]/15 dark:border-border/60 bg-white dark:bg-transparent rounded-xl shadow-[0_4px_15px_rgba(26,19,47,0.06)] focus:ring-primary/20">
                        <SelectValue placeholder="Select a month" />
                      </SelectTrigger>
                      <SelectContent>
                        {SEMESTER_MONTHS.filter(m => m.month <= new Date().getMonth()).map((m) => (
                          <SelectItem key={`${m.month}-${m.year}`} value={`${m.month}-${m.year}`}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {statsMode === "overall" && (
                  <div className="space-y-4">
                    <h3 className="text-base font-black text-primary uppercase tracking-tighter pl-1">Academic Term</h3>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="ghost"
                        className={cn(
                          "justify-start text-xs h-10 px-4 rounded-xl border-[3px] border-transparent transition-all",
                          rangeStartMonth === 0 && rangeEndMonth === 4 && "font-extrabold dark:bg-primary/20 dark:text-white dark:border-primary/50 bg-primary/10 border-primary/40 shadow-sm"
                        )}
                        onClick={() => setRange(0, 2026, 4, 2026)}
                      >
                        Term 1 (Jan - May)
                      </Button>
                      <Button
                        variant="ghost"
                        disabled={new Date().getMonth() < 6}
                        className={cn(
                          "justify-start text-xs h-10 px-4 rounded-xl border-[3px] border-transparent transition-all",
                          rangeStartMonth === 6 && "font-extrabold dark:bg-primary/20 dark:text-white dark:border-primary/50 bg-primary/10 border-primary/40 shadow-sm"
                        )}
                        onClick={() => setRange(6, 2026, 10, 2026)}
                      >
                        Term 2 (July - Nov)
                        {new Date().getMonth() < 6 && <span className="ml-auto opacity-50 text-[10px]">Locked</span>}
                      </Button>
                    </div>

                    {isCustomRangeActive && (
                      <div className="flex flex-col gap-3 p-3 bg-primary/5 rounded-xl border border-primary/20 animate-in fade-in slide-in-from-top-2">
                        <div>
                          <label className="text-[10px] font-bold text-primary uppercase mb-1 block">From:</label>
                          <Select 
                            value={`${rangeStartMonth}-${rangeStartYear}`} 
                            onValueChange={(val) => {
                              const [m, y] = val.split('-').map(Number)
                              setRange(m, y, rangeEndMonth, rangeEndYear)
                            }}
                          >
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue placeholder="Start" />
                            </SelectTrigger>
                            <SelectContent>
                               {SEMESTER_MONTHS.filter(m => rangeStartMonth < 5 ? m.month < 5 : m.month >= 6).map((m) => (
                                  <SelectItem key={`start-${m.month}-${m.year}`} value={`${m.month}-${m.year}`}>
                                    {m.label}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-primary uppercase mb-1 block">To:</label>
                          <Select 
                            value={`${rangeEndMonth}-${rangeEndYear}`} 
                            onValueChange={(val) => {
                              const [m, y] = val.split('-').map(Number)
                              setRange(rangeStartMonth, rangeStartYear, m, y)
                            }}
                          >
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue placeholder="End" />
                            </SelectTrigger>
                             <SelectContent>
                                {SEMESTER_MONTHS
                                  .filter(m => rangeStartMonth < 5 ? m.month < 5 : m.month >= 6)
                                  .filter(m => m.month <= new Date().getMonth())
                                  .map((m) => (
                                    <SelectItem key={`end-${m.month}-${m.year}`} value={`${m.month}-${m.year}`}>
                                      {m.label}
                                    </SelectItem>
                                  ))}
                             </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-4 mt-auto border-t border-border/40">
                  <Button 
                    variant="ghost" 
                    className={cn(
                      "justify-start w-full h-12 px-4 rounded-xl border-[3px] border-transparent transition-all", 
                      mainView === "contact" && "font-extrabold bg-[#005691]/15 text-[#005691] border-[#005691]/50 shadow-sm dark:bg-primary/20 dark:text-white dark:border-primary/50"
                    )} 
                    onClick={() => setMainView("contact")}
                  >
                    <MessageSquare className={cn("mr-3 h-5 w-5", mainView === "contact" && "text-primary")} />
                    Contact Us Support
                  </Button>
                </div>
              </div>

              <div className="pt-4 pb-8 mt-auto">
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full justify-start h-10 rounded-lg"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to log out of Attendy?")) {
                      logout()
                    }
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <span 
            className="font-black text-2xl sm:text-3xl cursor-pointer hover:opacity-80 transition-opacity ml-1 sm:ml-2 tracking-tighter"
            onClick={() => {
              setMainView("dashboard")
              window.scrollTo({ top: 0, behavior: "smooth" })
            }}
          >
            Attendy
          </span>
        </div>

        <div className="flex items-center gap-3">
          {hasPendingChanges() && (
            <div className="flex items-center gap-2 animate-in zoom-in fade-in duration-300">
               <Button 
                variant="outline" 
                size="sm" 
                onClick={() => discardChanges()}
                className="h-9 w-9 p-0 sm:w-auto sm:px-3 text-xs font-bold border-destructive text-destructive hover:bg-destructive/10"
                title="Discard Changes"
              >
                <X className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Discard</span>
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => saveChanges()}
                className="h-9 w-9 p-0 sm:w-auto sm:px-5 text-xs font-extrabold bg-primary dark:bg-primary/20 dark:text-white dark:border-primary/50 border-2 shadow-[0_0_15px_rgba(46,199,255,0.4)]"
                title="Save Changes"
              >
                <Check className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Save</span>
              </Button>
            </div>
          )}

          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
