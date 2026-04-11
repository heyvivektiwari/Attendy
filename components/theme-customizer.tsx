"use client"

import { useState, useEffect } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Palette, X } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeCustomizer() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  const [colors, setColors] = useState({
    background: "#FAFAFA",
    foreground: "#005691",
    primary: "#004A7C",
    safe: "#4CAF50",
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      // Set defaults based on theme if not already customized
      if (theme === "dark") {
        setColors({
          background: "#070411",
          foreground: "#ededed",
          primary: "#2ec7ff",
          safe: "#07b023",
        })
      } else {
        setColors({
          background: "#FAFAFA",
          foreground: "#1A132F",
          primary: "#004A7C",
          safe: "#4CAF50",
        })
      }
    }
  }, [theme, mounted])

  const handleColorChange = (key: string, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }))
    // Set variables globally on the document root
    document.documentElement.style.setProperty(`--${key}`, value)
    
    // If background changes, also update card and popover to match for seamless look
    if (key === "background") {
      document.documentElement.style.setProperty("--card", value)
      document.documentElement.style.setProperty("--popover", value)
    }
    // Update border and input based on primary or safe logic if needed
    if (key === "primary") {
      document.documentElement.style.setProperty("--ring", value)
    }
  }

  const resetTheme = () => {
    document.documentElement.removeAttribute("style")
  }

  if (!mounted) return null

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2 h-12 px-6 text-base">
          <Palette className="w-5 h-5" />
          <span className="hidden sm:inline">Customize</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm">Theme Colors</h4>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={resetTheme}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm">Background</span>
            <input 
              type="color" 
              value={colors.background}
              onChange={(e) => handleColorChange("background", e.target.value)}
              className="h-8 w-12 rounded cursor-pointer"
            />
          </div>
          
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm">Typography (Text)</span>
            <input 
              type="color" 
              value={colors.foreground}
              onChange={(e) => handleColorChange("foreground", e.target.value)}
              className="h-8 w-12 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-sm">Toggles & Buttons</span>
            <input 
              type="color" 
              value={colors.primary}
              onChange={(e) => handleColorChange("primary", e.target.value)}
              className="h-8 w-12 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-sm">Progress Bar (Safe)</span>
            <input 
              type="color" 
              value={colors.safe}
              onChange={(e) => handleColorChange("safe", e.target.value)}
              className="h-8 w-12 rounded cursor-pointer"
            />
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground pt-2 border-t">
          Changes apply instantly. Click the X to reset to stylesheet defaults.
        </p>
      </PopoverContent>
    </Popover>
  )
}
