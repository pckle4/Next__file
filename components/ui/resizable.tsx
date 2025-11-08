"use client"

import * as React from "react"
import { GripVerticalIcon } from "lucide-react"
import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"

const ResizeObserverErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  React.useEffect(() => {
    const originalError = window.onerror
    const originalUnhandledRejection = window.onunhandledrejection

    window.onerror = (message, source, lineno, colno, error) => {
      if (typeof message === "string" && message.includes("ResizeObserver loop")) {
        // Suppress ResizeObserver loop errors
        return true
      }
      return originalError ? originalError(message, source, lineno, colno, error) : false
    }

    window.onunhandledrejection = (event) => {
      if (event.reason?.message?.includes("ResizeObserver loop")) {
        event.preventDefault()
        return
      }
      return originalUnhandledRejection ? originalUnhandledRejection(event) : undefined
    }

    return () => {
      window.onerror = originalError
      window.onunhandledrejection = originalUnhandledRejection
    }
  }, [])

  return <>{children}</>
}

function ResizablePanelGroup({ className, ...props }: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) {
  return (
    <ResizeObserverErrorBoundary>
      <ResizablePrimitive.PanelGroup
        data-slot="resizable-panel-group"
        className={cn("flex h-full w-full data-[panel-group-direction=vertical]:flex-col", className)}
        {...props}
      />
    </ResizeObserverErrorBoundary>
  )
}

function ResizablePanel({ ...props }: React.ComponentProps<typeof ResizablePrimitive.Panel>) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean
}) {
  return (
    <ResizablePrimitive.PanelResizeHandle
      data-slot="resizable-handle"
      className={cn(
        "bg-border focus-visible:ring-ring relative flex w-px items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:translate-x-0 data-[panel-group-direction=vertical]:after:-translate-y-1/2 [&[data-panel-group-direction=vertical]>div]:rotate-90",
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div className="bg-border z-10 flex h-4 w-3 items-center justify-center rounded-xs border">
          <GripVerticalIcon className="size-2.5" />
        </div>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
