"use client"

import { useEffect, useState } from "react"
import { useAttendanceStore } from "@/lib/attendance-store"
import { LoginForm } from "./login-form"
import { Dashboard } from "./dashboard"
import { Preferences } from '@capacitor/preferences'
import { Network } from '@capacitor/network'
import { SplashScreen } from '@capacitor/splash-screen'
import { Capacitor } from '@capacitor/core'
import { toast } from "sonner"

export function AttendanceApp() {
  const isAuthenticated = useAttendanceStore((state) => state.isAuthenticated)
  const login = useAttendanceStore((state) => state.login)
  const [mounted, setMounted] = useState(false)
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    async function initNative() {
      // 1. Splash Screen & Platform Check
      const isNative = Capacitor.isNativePlatform()

      // 2. Preferences Auto-login
      if (isNative) {
        try {
          const { value } = await Preferences.get({ key: 'attendy-user' })
          if (value) {
            const user = JSON.parse(value)
            if (user && user.name) {
              login(user.id, user.name, user.rollNo, user.division, user.branch || "Computer")
            }
          }
        } catch (e) {
          console.error('Error reading preferences', e)
        }
      }

      // 3. Network Listener
      if (isNative) {
        const checkNetwork = async () => {
          const status = await Network.getStatus()
          setIsOffline(!status.connected)
          if (!status.connected) {
            toast.error("You are currently offline. Showing cached data.")
          }
        }
        await checkNetwork()
        Network.addListener('networkStatusChange', status => {
          setIsOffline(!status.connected)
          if (!status.connected) {
            toast.error("Network connection lost.")
          } else {
            toast.success("Network connection restored.")
          }
        })
      }


      // 5. Hide splash screen
      if (isNative) {
        await SplashScreen.hide()
      }

      setMounted(true)
    }

    initNative()

    return () => {
      if (Capacitor.isNativePlatform()) {
        Network.removeAllListeners()
      }
    }
  }, [login])

  // Normal web mount
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      setMounted(true)
    }
  }, [])

  // Auto-recovery of legacy local attendance (e.g. from version v4 cache)
  useEffect(() => {
    if (!mounted || !isAuthenticated) return

    // Find if there is any legacy storage key in localStorage
    const legacyKeys = Object.keys(localStorage).filter(
      key => key.startsWith("attendance-storage-monthly-v") && key !== "attendance-storage-monthly-v5"
    )

    if (legacyKeys.length > 0) {
      // Sort to get the latest version (e.g. v4)
      legacyKeys.sort((a, b) => b.localeCompare(a))
      const latestLegacyKey = legacyKeys[0]
      const legacyDataStr = localStorage.getItem(latestLegacyKey)
      
      if (legacyDataStr) {
        try {
          const parsed = JSON.parse(legacyDataStr)
          const legacyAbsences = parsed?.state?.absences
          
          if (Array.isArray(legacyAbsences) && legacyAbsences.length > 0) {
            // Found legacy absences! Let's display a toast to restore them.
            toast("Found July attendance data on this device.", {
              description: `Restore ${legacyAbsences.length} attendance records and sync them to Supabase?`,
              action: {
                label: "Restore & Sync",
                onClick: async () => {
                  const store = useAttendanceStore.getState()
                  
                  // Merge legacy absences with current absences
                  const currentAbsences = store.absences || []
                  const mergedAbsences = Array.from(new Set([...currentAbsences, ...legacyAbsences]))
                  
                  // Set store states
                  useAttendanceStore.setState({ absences: mergedAbsences })
                  
                  // Re-initialize current month's lectures to reflect these absences
                  store.initializeMonth(store.currentMonth, store.currentYear)
                  
                  // Force sync to database
                  if (store.user) {
                    try {
                      const res = await fetch("/api/attendance", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          studentId: store.user.id,
                          rollNo: store.user.rollNo,
                          absentLectureIds: mergedAbsences
                        })
                      })
                      const data = await res.json()
                      if (data.success) {
                        toast.success("Attendance successfully restored and synced to Supabase!")
                        // Remove the legacy key so they aren't prompted again
                        localStorage.removeItem(latestLegacyKey)
                      } else {
                        toast.error("Failed to sync restored data to Supabase.")
                      }
                    } catch (e) {
                      console.error(e)
                      toast.error("Network error syncing restored data.")
                    }
                  }
                }
              },
              duration: 20000,
            })
          }
        } catch (e) {
          console.error("Failed to parse legacy attendance data", e)
        }
      }
    }
  }, [mounted, isAuthenticated])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#1A132F] flex items-center justify-center">
        <div className="animate-pulse text-[#2ec7ff]">Initializing Attendy...</div>
      </div>
    )
  }

  return (
    <>
      {isOffline && (
        <div className="bg-destructive text-destructive-foreground text-[10px] font-bold text-center py-1 z-50 relative uppercase tracking-widest leading-none">
          OFFLINE MODE - Check Internet Connection
        </div>
      )}
      {!isAuthenticated ? <LoginForm /> : <Dashboard />}
    </>
  )
}
