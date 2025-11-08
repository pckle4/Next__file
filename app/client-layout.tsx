"use client"
import { useEffect } from "react"
import type React from "react"
import { Toaster } from "@/components/ui/toaster"
import SimpleHeader from "@/components/simple-header"
import { ThemeProvider } from "@/components/theme-provider"

interface ClientLayoutProps {
  children: React.ReactNode
  className: string
}

export default function ClientLayout({ children, className }: ClientLayoutProps) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const originalFocus = Element.prototype.focus
      Element.prototype.focus = function (options: FocusOptions = {}) {
        return originalFocus.call(this, { preventScroll: true, ...options })
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleError = (event: ErrorEvent) => {
        if (event.message && event.message.includes("ResizeObserver loop completed with undelivered notifications")) {
          event.preventDefault()
          event.stopPropagation()
          return true
        }
        return false
      }

      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        if (event.reason?.message?.includes("ResizeObserver loop")) {
          event.preventDefault()
          return
        }
      }

      window.addEventListener("error", handleError)
      window.addEventListener("unhandledrejection", handleUnhandledRejection)

      return () => {
        window.removeEventListener("error", handleError)
        window.removeEventListener("unhandledrejection", handleUnhandledRejection)
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return

    const original = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
    }

    const allowIST = (firstArg: unknown) => {
      // allow logs that start with "[HH:MM:SS]" – used by our important event logger
      if (typeof firstArg !== "string") return false
      return /^\[\d{2}:\d{2}:\d{2}\]/.test(firstArg)
    }

    const filtered =
      (fn: (...args: any[]) => void) =>
      (...args: any[]) => {
        const first = args[0]
        // suppress our verbose internal logs that start with "[nw]"
        if (typeof first === "string" && first.startsWith("[nw]")) return
        // allow IST-timestamped logs (peer/file events), suppress everything else
        if (allowIST(first)) return fn(...args)
      }

    console.log = filtered(original.log)
    console.info = filtered(original.info)
    console.warn = filtered(original.warn)
    console.error = filtered(original.error)

    return () => {
      console.log = original.log
      console.info = original.info
      console.warn = original.warn
      console.error = original.error
    }
  }, [])

  return (
    <body className={className}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
        <SimpleHeader />
        {children}
        <Toaster />
      </ThemeProvider>
    </body>
  )
}
