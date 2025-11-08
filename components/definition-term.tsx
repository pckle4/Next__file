"use client"

import type * as React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ChevronUp } from "lucide-react"

type DefinitionTermProps = {
  term: string
  definition: string
  children: React.ReactNode
}

export function DefinitionTerm({ term, definition, children }: DefinitionTermProps) {
  return (
    <span className="inline-flex items-baseline gap-1">
      <span>{children}</span>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Show definition for ${term}`}
            className="h-4 w-4 p-0 align-super -translate-y-0.5 text-muted-foreground hover:text-foreground"
          >
            <ChevronUp className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="max-w-xs text-sm leading-relaxed">
          <div className="font-medium mb-1">{term}</div>
          <div className="text-muted-foreground">{definition}</div>
        </PopoverContent>
      </Popover>
    </span>
  )
}
