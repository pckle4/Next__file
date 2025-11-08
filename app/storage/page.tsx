"use client"

import { StorageAnalyzer } from "@/components/storage-analyzer"

export default function StoragePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Storage Analysis</h1>
            <p className="text-muted-foreground">
              Analyze and manage all browser storage including localStorage, sessionStorage, cookies, and IndexedDB
            </p>
          </div>

          <StorageAnalyzer />
        </div>
      </div>
    </div>
  )
}
