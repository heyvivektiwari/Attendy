"use client"

import { useEffect, useState } from "react"
import { useAttendanceStore } from "@/lib/attendance-store"
import { LoginForm } from "./login-form"
import { Dashboard } from "./dashboard"
import { Preferences } from '@capacitor/preferences'
import { PushNotifications } from '@capacitor/push-notifications'
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
              login(user.name, user.rollNo, user.division)
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

      // 4. Push Notifications (Only if native)
      if (isNative) {
        PushNotifications.requestPermissions().then(result => {
          if (result.receive === 'granted') {
            PushNotifications.register();
          }
        });

        PushNotifications.addListener('registration', token => {
          console.log('DEVICE TOKEN:', token.value);
        });

        PushNotifications.addListener('pushNotificationReceived', notification => {
          toast(notification.title || "New Alert", {
            description: notification.body
          })
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
        PushNotifications.removeAllListeners()
      }
    }
  }, [login])

  // Normal web mount
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      setMounted(true)
    }
  }, [])

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
