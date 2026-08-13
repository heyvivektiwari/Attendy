"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const currentTheme = resolvedTheme || theme || "dark"
  const isDark = currentTheme === "dark"

  const toggleTheme = () => {
    const nextTheme = isDark ? "light" : "dark"
    setTheme(nextTheme)
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-xl w-12 h-12 border-[3px] border-[#1A132F]/20 dark:border-primary/40 shadow-[0_4px_15px_rgba(26,19,47,0.08)] bg-card hover:border-primary transition-all active:scale-90"
      onClick={toggleTheme}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {mounted && (
        isDark ? (
          <Moon className="h-6 w-6 text-primary transition-all rotate-0 scale-100" />
        ) : (
          <Sun className="h-6 w-6 text-amber-500 transition-all rotate-0 scale-100" />
        )
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
