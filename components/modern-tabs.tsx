"use client"

import type React from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Tab {
  id: string
  label: string
  icon: React.ReactNode
  badge?: number
  content: React.ReactNode
  tooltip?: React.ReactNode | string
}

interface ModernTabsProps {
  tabs: Tab[]
  defaultTab?: string
  className?: string
}

export function ModernTabs({ tabs, defaultTab, className }: ModernTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

  const activeTabData = tabs.find((tab) => tab.id === activeTab)

  return (
    <div className={cn("w-full", className)}>
      {/* Tab Navigation */}
      <TooltipProvider>
        <div className="bg-card border border-border rounded-t-lg overflow-hidden">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const button = (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  aria-selected={activeTab === tab.id}
                  aria-label={tab.label}
                  className={cn(
                    "group flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 whitespace-nowrap border-b-2 hover:bg-muted/50",
                    activeTab === tab.id
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  <div
                    className={cn(
                      "transition-all duration-200",
                      activeTab === tab.id ? "opacity-100 scale-105 animate-float" : "opacity-80 group-hover:scale-110",
                    )}
                  >
                    {tab.icon}
                  </div>
                  <span className="text-pretty">{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <div
                      className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-bold transition-colors duration-200",
                        activeTab === tab.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                      )}
                      aria-label={`Count ${tab.badge}`}
                    >
                      {tab.badge}
                    </div>
                  )}
                </button>
              )

              return tab.tooltip ? (
                <Tooltip key={tab.id} delayDuration={200}>
                  <TooltipTrigger asChild>{button}</TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="bg-popover text-popover-foreground border border-border shadow-lg"
                  >
                    {typeof tab.tooltip === "string" ? <span>{tab.tooltip}</span> : tab.tooltip}
                  </TooltipContent>
                </Tooltip>
              ) : (
                button
              )
            })}
          </div>
        </div>
      </TooltipProvider>

      {/* Tab Content */}
      <div className="bg-card border-x border-b border-border rounded-b-lg">
        <div className="p-4">{activeTabData?.content}</div>
      </div>
    </div>
  )
}
