"use client"

import { useEffect, useState } from "react"
import { useAttendanceStore } from "@/lib/attendance-store"
import { LoginForm } from "./login-form"
import { Dashboard } from "./dashboard"

export function AttendanceApp() {
  const isAuthenticated = useAttendanceStore((state) => state.isAuthenticated)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginForm />
  }

  return <Dashboard />
}
