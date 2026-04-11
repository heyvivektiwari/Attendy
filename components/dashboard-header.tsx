"use client"

import { useAttendanceStore } from "@/lib/attendance-store"
import { Button } from "@/components/ui/button"
import { GraduationCap, LogOut } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"

export function DashboardHeader() {
  const { user, logout } = useAttendanceStore()
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none">Attendy</h1>
            <p className="text-xs text-muted-foreground">SE Sem IV Div A</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <div className="hidden sm:block text-right mr-4">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">Roll No: {user.rollNo}</p>
            </div>
          )}
          
          <ModeToggle />

          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="rounded-full text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
