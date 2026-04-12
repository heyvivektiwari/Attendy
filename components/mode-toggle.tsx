"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    const isDark = theme === "dark"
    const nextTheme = isDark ? "light" : "dark"
    
    if (!document.startViewTransition) {
      setTheme(nextTheme)
      return
    }

    document.startViewTransition(() => {
      setTheme(nextTheme)
    })
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-xl w-12 h-12 border-[3px] border-[#1A132F]/20 dark:border-primary/40 shadow-[0_4px_15px_rgba(26,19,47,0.08)] bg-white dark:bg-transparent hover:border-primary transition-all active:scale-90"
      onClick={toggleTheme}
    >
      <Sun className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

