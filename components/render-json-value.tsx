"use client"

import type React from "react"
import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

interface RenderJsonValueProps {
  value: any
  keyPath: string
  actualSize?: number
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function RenderJsonValue({ value, keyPath, actualSize }: RenderJsonValueProps): React.ReactElement {
  const [isExpanded, setIsExpanded] = useState(false)

  if (value === null) {
    return <span className="text-muted-foreground italic">null</span>
  }

  if (value === undefined) {
    return <span className="text-muted-foreground italic">undefined</span>
  }

  if (typeof value === "boolean") {
    return <span className="text-blue-600 dark:text-blue-400">{value.toString()}</span>
  }

  if (typeof value === "number") {
    return <span className="text-green-600 dark:text-green-400">{value}</span>
  }

  if (typeof value === "string") {
    if (value.length > 100) {
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              String ({value.length} chars)
            </button>
            {actualSize && <span className="text-xs text-muted-foreground">({formatBytes(actualSize)})</span>}
          </div>
          {isExpanded ? (
            <div className="text-orange-600 dark:text-orange-400 break-all whitespace-pre-wrap text-xs p-2 bg-muted/50 rounded">
              "{value}"
            </div>
          ) : (
            <div className="text-orange-600 dark:text-orange-400 break-all text-xs">"{value.substring(0, 100)}..."</div>
          )}
        </div>
      )
    }
    return <span className="text-orange-600 dark:text-orange-400 break-all">"{value}"</span>
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-muted-foreground">[]</span>
    }

    return (
      <div className="space-y-1">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            Array ({value.length} items)
          </button>
          {actualSize && <span className="text-xs text-muted-foreground">({formatBytes(actualSize)})</span>}
        </div>
        {isExpanded && (
          <div className="ml-4 space-y-1 text-xs">
            {value.map((item, index) => (
              <div key={index} className="flex gap-2">
                <span className="text-muted-foreground">[{index}]:</span>
                <RenderJsonValue value={item} keyPath={`${keyPath}[${index}]`} />
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (typeof value === "object") {
    const keys = Object.keys(value)
    if (keys.length === 0) {
      return <span className="text-muted-foreground">{"{}"}</span>
    }

    return (
      <div className="space-y-1">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            Object ({keys.length} keys)
          </button>
          {actualSize && <span className="text-xs text-muted-foreground">({formatBytes(actualSize)})</span>}
        </div>
        {isExpanded && (
          <div className="ml-4 space-y-1 text-xs">
            {keys.map((key) => (
              <div key={key} className="flex gap-2">
                <span className="text-purple-600 dark:text-purple-400 font-mono">"{key}":</span>
                <RenderJsonValue value={value[key]} keyPath={`${keyPath}.${key}`} />
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Fallback for any other type
  return <span className="text-muted-foreground break-all">{String(value)}</span>
}

export function renderJsonValue(value: any, keyPath: string, actualSize?: number): React.ReactElement {
  return <RenderJsonValue value={value} keyPath={keyPath} actualSize={actualSize} />
}

// Default export for convenience
export default RenderJsonValue
