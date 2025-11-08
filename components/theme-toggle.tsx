"use client"

import { useTheme } from "next-themes"
import { Toggle } from "@/components/ui/toggle"
import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Toggle size="sm" className="w-9 h-9">
        <div className="h-4 w-4" />
      </Toggle>
    )
  }

  return (
    <Toggle
      size="sm"
      pressed={theme === "dark"}
      onPressedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-9 h-9 hover:bg-accent/50 transition-all duration-200"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </Toggle>
  )
}
