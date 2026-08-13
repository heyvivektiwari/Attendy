"use client"

import { useState, useEffect } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Palette, X, Sparkles, Check } from "lucide-react"
import { useTheme } from "next-themes"

export const PRESET_THEMES = [
  {
    name: "Midnight OLED",
    id: "oled",
    colors: {
      background: "#000000",
      foreground: "#ffffff",
      primary: "#2ec7ff",
      safe: "#10b981",
    }
  },
  {
    name: "Cyberpunk Neon",
    id: "cyberpunk",
    colors: {
      background: "#0d021a",
      foreground: "#f4f4f5",
      primary: "#ff007f",
      safe: "#00f3ff",
    }
  },
  {
    name: "Nordic Slate",
    id: "nordic",
    colors: {
      background: "#0f172a",
      foreground: "#f8fafc",
      primary: "#38bdf8",
      safe: "#34d399",
    }
  },
  {
    name: "Emerald Glow",
    id: "emerald",
    colors: {
      background: "#041f1e",
      foreground: "#ecfdf5",
      primary: "#10b981",
      safe: "#34d399",
    }
  },
  {
    name: "Minimal Light",
    id: "light",
    colors: {
      background: "#ffffff",
      foreground: "#0f172a",
      primary: "#005691",
      safe: "#16a34a",
    }
  }
]

export function ThemeCustomizer() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [activePreset, setActivePreset] = useState<string | null>(null)
  
  const [colors, setColors] = useState({
    background: "#FAFAFA",
    foreground: "#005691",
    primary: "#004A7C",
    safe: "#4CAF50",
  })

  useEffect(() => {
    setMounted(true)
    try {
      const savedTheme = localStorage.getItem("attendy_custom_theme")
      if (savedTheme) {
        const parsed = JSON.parse(savedTheme)
        if (parsed.colors) {
          applyColorMap(parsed.colors)
          setColors(parsed.colors)
          if (parsed.presetId) setActivePreset(parsed.presetId)
        }
      }
    } catch (e) {}
  }, [])

  const applyColorMap = (colorMap: Record<string, string>) => {
    Object.entries(colorMap).forEach(([key, val]) => {
      document.documentElement.style.setProperty(`--${key}`, val)
      if (key === "background") {
        document.documentElement.style.setProperty("--card", val)
        document.documentElement.style.setProperty("--popover", val)
      }
      if (key === "primary") {
        document.documentElement.style.setProperty("--ring", val)
      }
    })
  }

  const handleApplyPreset = (preset: typeof PRESET_THEMES[number]) => {
    setActivePreset(preset.id)
    setColors(preset.colors)
    applyColorMap(preset.colors)
    if (preset.id === "light") {
      setTheme("light")
    } else {
      setTheme("dark")
    }
    try {
      localStorage.setItem("attendy_custom_theme", JSON.stringify({ presetId: preset.id, colors: preset.colors }))
    } catch (e) {}
  }

  const handleColorChange = (key: string, value: string) => {
    const updated = { ...colors, [key]: value }
    setColors(updated)
    setActivePreset(null)
    document.documentElement.style.setProperty(`--${key}`, value)
    if (key === "background") {
      document.documentElement.style.setProperty("--card", value)
      document.documentElement.style.setProperty("--popover", value)
    }
    if (key === "primary") {
      document.documentElement.style.setProperty("--ring", value)
    }
    try {
      localStorage.setItem("attendy_custom_theme", JSON.stringify({ presetId: null, colors: updated }))
    } catch (e) {}
  }

  const resetTheme = () => {
    document.documentElement.removeAttribute("style")
    setActivePreset(null)
    try {
      localStorage.removeItem("attendy_custom_theme")
    } catch (e) {}
  }

  if (!mounted) return null

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-10 px-3 rounded-xl border-[3px] border-[#1A132F]/15 dark:border-border/60 shadow-sm hover:border-primary transition-all">
          <Palette className="w-4 h-4 text-primary" />
          <span className="hidden md:inline font-bold text-xs">Theme Presets</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-4 space-y-4 rounded-2xl border-[3px] border-[#1A132F]/15 dark:border-border/60 shadow-[0_10px_40px_rgba(0,0,0,0.2)] bg-card text-card-foreground">
        <div className="flex items-center justify-between border-b pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h4 className="font-extrabold text-sm tracking-tight">Aesthetic Themes</h4>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-lg" onClick={resetTheme} title="Reset to default">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Preset Cards */}
        <div className="space-y-2">
          <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Presets</label>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_THEMES.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset)}
                className={`p-2.5 rounded-xl border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  activePreset === preset.id
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-border/60 hover:border-primary/50 hover:bg-secondary/20"
                }`}
                style={{ backgroundColor: preset.colors.background }}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="text-xs font-bold truncate" style={{ color: preset.colors.foreground }}>
                    {preset.name}
                  </span>
                  {activePreset === preset.id && (
                    <Check className="h-3.5 w-3.5 shrink-0" style={{ color: preset.colors.primary }} />
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full border border-white/20" style={{ backgroundColor: preset.colors.primary }} />
                  <span className="h-3 w-3 rounded-full border border-white/20" style={{ backgroundColor: preset.colors.safe }} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Fine-Tuning */}
        <div className="space-y-2 pt-2 border-t border-border/50">
          <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Fine-Tune Colors</label>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-semibold">Background</span>
              <input 
                type="color" 
                value={colors.background}
                onChange={(e) => handleColorChange("background", e.target.value)}
                className="h-7 w-10 rounded cursor-pointer border-0 bg-transparent"
              />
            </div>
            
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-semibold">Typography (Text)</span>
              <input 
                type="color" 
                value={colors.foreground}
                onChange={(e) => handleColorChange("foreground", e.target.value)}
                className="h-7 w-10 rounded cursor-pointer border-0 bg-transparent"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-semibold">Primary Accent</span>
              <input 
                type="color" 
                value={colors.primary}
                onChange={(e) => handleColorChange("primary", e.target.value)}
                className="h-7 w-10 rounded cursor-pointer border-0 bg-transparent"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-semibold">Safe Indicator</span>
              <input 
                type="color" 
                value={colors.safe}
                onChange={(e) => handleColorChange("safe", e.target.value)}
                className="h-7 w-10 rounded cursor-pointer border-0 bg-transparent"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
