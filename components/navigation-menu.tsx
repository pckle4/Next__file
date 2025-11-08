"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { HelpCircle, FileQuestion, Menu, X, Github, Shield, Cpu } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"

export function NavigationMenu() {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { icon: FileQuestion, label: "FAQs", href: "/faq", description: "Common questions" },
    { icon: HelpCircle, label: "How To", href: "/how-to", description: "Usage guides" },
    { icon: Cpu, label: "Tech", href: "/tech", description: "Technical details" },
  ]

  return (
    <nav className="w-full relative bg-background/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-50 shadow-lg shadow-background/10">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center gap-2 sm:gap-4">
            <img
              src="/images/brand-logo.png"
              alt="NOWHILE"
              width={120}
              height={32}
              className="h-7 sm:h-8 w-auto opacity-80 transition-opacity"
              loading="eager"
              decoding="async"
            />
          </div>

          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex items-center gap-1 sm:gap-2 p-2 bg-background/60 backdrop-blur-md border border-border/30 rounded-2xl shadow-xl shadow-background/20 text-justify">
              {menuItems.map((item, index) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-300 text-muted-foreground hover:text-foreground font-medium animate-fade-in group backdrop-blur-sm hover:backdrop-blur-md hover:shadow-lg"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  asChild
                >
                  <Link href={item.href} target="_blank" rel="noopener noreferrer">
                    <item.icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-semibold">{item.label}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex items-center gap-2 px-3 py-2 border border-border/30 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 text-muted-foreground hover:text-foreground rounded-xl group backdrop-blur-sm"
              asChild
            >
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold hidden lg:inline">GitHub</span>
              </a>
            </Button>

            <ThemeToggle />

            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="border border-border/30 hover:bg-accent hover:text-accent-foreground p-2 transition-all duration-300 text-muted-foreground hover:text-foreground rounded-xl backdrop-blur-sm"
              >
                <div className="relative z-10">
                  {isOpen ? <X className="h-5 w-5 animate-scale-in" /> : <Menu className="h-5 w-5" />}
                </div>
              </Button>
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 z-50 animate-slide-up">
            <div className="mx-3 sm:mx-4 mt-2 bg-background/90 backdrop-blur-xl border border-border/30 rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-4 space-y-2">
                <div className="space-y-2">
                  {menuItems.map((item) => (
                    <Button
                      key={item.label}
                      variant="ghost"
                      size="sm"
                      className="w-full flex items-center gap-3 px-4 py-3 border border-border/30 hover:bg-primary/10 hover:text-primary transition-all duration-300 text-muted-foreground hover:text-foreground rounded-xl group backdrop-blur-sm"
                      asChild
                    >
                      <a href={item.href} target="_blank" rel="noopener noreferrer">
                        <item.icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-semibold">{item.label}</span>
                      </a>
                    </Button>
                  ))}
                </div>

                <div className="border-t border-border/30 pt-4 mt-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 border border-border/30 hover:bg-accent hover:text-accent-foreground transition-all duration-300 justify-center text-muted-foreground hover:text-foreground rounded-xl group backdrop-blur-sm"
                      asChild
                    >
                      <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                        GitHub
                      </a>
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-xl border border-border/30 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">Theme</span>
                    </div>
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
