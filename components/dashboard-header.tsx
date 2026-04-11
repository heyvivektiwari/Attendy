"use client"

import { useAttendanceStore } from "@/lib/attendance-store"
import { Button } from "@/components/ui/button"
import { GraduationCap, LogOut } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { Logo } from "@/components/logo"

export function DashboardHeader() {
  const { user, logout } = useAttendanceStore()

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo imageSize={44} textSize="text-2xl" />
        </div>

        <div className="flex items-center gap-3">
          <ModeToggle />

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (window.confirm("Are you sure you want to log out of Attendy?")) {
                logout()
              }
            }}
            className="rounded-full border-border/80 hover:border-destructive hover:text-destructive hover:bg-destructive/5 transition-colors gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
