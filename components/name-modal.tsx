"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User } from "lucide-react"

interface NameModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (name: string) => void
  initialName: string
}

export function NameModal({ isOpen, onClose, onSave, initialName }: NameModalProps) {
  const [name, setName] = useState(initialName || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (name.trim()) {
      onSave(name.trim())
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Welcome to nowhile
          </DialogTitle>
          <DialogDescription>
            Please enter your display name to start sharing files securely. Your name will be shown in [brackets] for
            easy identification.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              placeholder="Enter your name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              autoFocus
              className="text-center"
            />
            {name.trim() && (
              <div className="text-xs text-muted-foreground text-center">
                Will appear as: <span className="font-mono text-primary">[{name.trim()}]</span>
              </div>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={!name.trim()}>
            Start Sharing
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
