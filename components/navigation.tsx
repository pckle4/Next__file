"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Menu, X, Home, HelpCircle, BookOpen, FileText, Monitor, Laptop, Tablet, Smartphone } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navigationItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/how-to", label: "How To Use", icon: BookOpen },
  { href: "/components", label: "Components", icon: FileText },
  { href: "/faq", label: "FAQ", icon: HelpCircle },
]

const deviceIcons = [
  { icon: Monitor, label: "Desktop", size: "h-4 w-4" },
  { icon: Laptop, label: "Laptop", size: "h-4 w-4" },
  { icon: Tablet, label: "Tablet", size: "h-4 w-4" },
  { icon: Smartphone, label: "Mobile", size: "h-3.5 w-3.5" },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <div className="fixed top-3 left-3 z-50 md:hidden">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="ghost"
          size="sm"
          className="h-10 w-10 p-0 glass-effect border-0 hover:bg-primary/10 transition-all duration-300 hover-scale shadow-lg"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-40 p-3">
        <Card className="w-full glass-card border-0 shadow-xl">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="/images/brand-logo.png"
                  alt="NOWHILE"
                  width={120}
                  height={32}
                  className="h-8 w-auto"
                  loading="eager"
                  decoding="async"
                />
                <div className="hidden lg:flex items-center gap-1 glass-effect px-2 py-1 rounded-full">
                  {deviceIcons.map((device, index) => {
                    const Icon = device.icon
                    return (
                      <div key={device.label} className="flex items-center">
                        <Icon className={`${device.size} text-primary/70`} />
                        {index < deviceIcons.length - 1 && <div className="w-px h-3 bg-border/30 mx-1" />}
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        size="sm"
                        className={`gap-2 h-8 px-3 text-xs font-medium transition-all duration-300 hover-scale ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                            : "glass-effect border-0 hover:bg-primary/10"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span className="hidden lg:inline">{item.label}</span>
                      </Button>
                    </Link>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </nav>

      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <Card className="absolute top-16 left-3 right-3 glass-card border-0 shadow-2xl animate-scale-in">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/30">
                <div>
                  <img
                    src="/images/brand-logo.png"
                    alt="NOWHILE"
                    width={140}
                    height={36}
                    className="h-9 w-auto mb-1"
                    loading="eager"
                    decoding="async"
                  />
                  <p className="text-sm text-muted-foreground">Lightning Fast P2P Transfer</p>
                </div>
                <div className="flex items-center gap-1 glass-effect px-2 py-1 rounded-full">
                  {deviceIcons.map((device, index) => {
                    const Icon = device.icon
                    return (
                      <div key={device.label} className="flex items-center">
                        <Icon className="h-3 w-3 text-primary/70" />
                        {index < deviceIcons.length - 1 && <div className="w-px h-2 bg-border/30 mx-0.5" />}
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={`w-full justify-start gap-3 h-11 transition-all duration-300 hover-scale ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                            : "glass-effect border-0 hover:bg-primary/10"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="font-medium">{item.label}</span>
                        {isActive && (
                          <Badge className="ml-auto bg-primary-foreground/20 text-primary-foreground text-xs">
                            Active
                          </Badge>
                        )}
                      </Button>
                    </Link>
                  )
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-border/30">
                <div className="text-xs text-muted-foreground text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>Compatible across all devices</span>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    {deviceIcons.map((device) => {
                      const Icon = device.icon
                      return (
                        <div key={device.label} className="flex flex-col items-center gap-1">
                          <Icon className="h-4 w-4 text-primary/70" />
                          <span className="text-xs">{device.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
