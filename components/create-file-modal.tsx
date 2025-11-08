"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  FileText,
  Download,
  Save,
  X,
  Upload,
  Plus,
  Code,
  FileJson,
  Hash,
  Type,
  Sparkles,
  Zap,
  FileCode2,
  Database,
  Terminal,
  Settings,
  Braces,
  Globe,
  ImageIcon,
  File,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CreateFileModalProps {
  isOpen: boolean
  onClose: () => void
  onFileCreated?: (file: File) => void
}

const FILE_TEMPLATES = {
  text: { extension: "txt", icon: FileText, color: "text-blue-600", bgColor: "bg-blue-50" },
  markdown: { extension: "md", icon: Hash, color: "text-purple-600", bgColor: "bg-purple-50" },
  json: { extension: "json", icon: FileJson, color: "text-green-600", bgColor: "bg-green-50" },
  javascript: { extension: "js", icon: Code, color: "text-yellow-600", bgColor: "bg-yellow-50" },
  typescript: { extension: "ts", icon: FileCode2, color: "text-blue-500", bgColor: "bg-blue-50" },
  html: { extension: "html", icon: Globe, color: "text-orange-600", bgColor: "bg-orange-50" },
  css: { extension: "css", icon: Type, color: "text-pink-600", bgColor: "bg-pink-50" },
  python: { extension: "py", icon: Terminal, color: "text-green-500", bgColor: "bg-green-50" },
  java: { extension: "java", icon: Code, color: "text-red-500", bgColor: "bg-red-50" },
  cpp: { extension: "cpp", icon: Code, color: "text-indigo-600", bgColor: "bg-indigo-50" },
  c: { extension: "c", icon: Code, color: "text-gray-600", bgColor: "bg-gray-50" },
  php: { extension: "php", icon: Code, color: "text-purple-500", bgColor: "bg-purple-50" },
  ruby: { extension: "rb", icon: Terminal, color: "text-red-600", bgColor: "bg-red-50" },
  sql: { extension: "sql", icon: Database, color: "text-cyan-600", bgColor: "bg-cyan-50" },
  xml: { extension: "xml", icon: Braces, color: "text-orange-500", bgColor: "bg-orange-50" },
  yaml: { extension: "yaml", icon: Settings, color: "text-teal-600", bgColor: "bg-teal-50" },
  bash: { extension: "sh", icon: Terminal, color: "text-slate-600", bgColor: "bg-slate-50" },
  csv: { extension: "csv", icon: FileText, color: "text-emerald-600", bgColor: "bg-emerald-50" },
  svg: { extension: "svg", icon: ImageIcon, color: "text-violet-600", bgColor: "bg-violet-50" },
  log: { extension: "log", icon: File, color: "text-gray-500", bgColor: "bg-gray-50" },
}

const CreateFileModal = ({ isOpen, onClose, onFileCreated }: CreateFileModalProps) => {
  const [fileName, setFileName] = useState("")
  const [fileContent, setFileContent] = useState("")
  const [fileType, setFileType] = useState<keyof typeof FILE_TEMPLATES>("text")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      setSelectedFiles(Array.from(files))
    }
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const createTextFile = () => {
    if (!fileName.trim() || !fileContent.trim()) return null

    const template = FILE_TEMPLATES[fileType]
    const fullFileName = fileName.includes(".") ? fileName : `${fileName}.${template.extension}`

    const now = new Date()
    const dateStr = now.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    const timeStr = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })

    const timestampFooter = `\n\nCreated on ${dateStr} at ${timeStr}\n© nowhile.com`
    const finalContent = fileContent + timestampFooter

    const blob = new Blob([finalContent], { type: "text/plain" })
    return new File([blob], fullFileName, { type: "text/plain" })
  }

  const handleSave = () => {
    const textFile = createTextFile()
    if (textFile && onFileCreated) {
      onFileCreated(textFile)
    }

    selectedFiles.forEach((file) => {
      if (onFileCreated) {
        onFileCreated(file)
      }
    })

    handleClose()
  }

  const handleDownload = () => {
    const textFile = createTextFile()
    if (textFile) {
      const url = URL.createObjectURL(textFile)
      const a = document.createElement("a")
      a.href = url
      a.download = textFile.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }

    selectedFiles.forEach((file) => {
      const url = URL.createObjectURL(file)
      const a = document.createElement("a")
      a.href = url
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    })
  }

  const handleClose = () => {
    setFileName("")
    setFileContent("")
    setFileType("text")
    setSelectedFiles([])
    onClose()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const template = FILE_TEMPLATES[fileType]
  const IconComponent = template.icon
  const hasTextContent = fileName.trim() && fileContent.trim()
  const hasFiles = selectedFiles.length > 0
  const canSave = hasTextContent || hasFiles

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col transition-all duration-300 ease-in-out">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            Create & Share Files
          </DialogTitle>
          <DialogDescription>
            Create text files or select existing files to share with connected peers
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2 scroll-smooth">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className={cn("p-1.5 rounded-md transition-all duration-200", template.bgColor)}>
                <IconComponent className={cn("h-4 w-4 transition-colors duration-200", template.color)} />
              </div>
              <h3 className="font-semibold text-sm">Create Text File</h3>
              <Badge variant="secondary" className="text-xs">
                New
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fileName" className="flex items-center gap-1">
                  File Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fileName"
                  placeholder="my-document"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="font-mono transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fileType">File Type</Label>
                <Select value={fileType} onValueChange={(value: keyof typeof FILE_TEMPLATES) => setFileType(value)}>
                  <SelectTrigger className="transition-all duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    {Object.entries(FILE_TEMPLATES).map(([key, template]) => {
                      const Icon = template.icon
                      return (
                        <SelectItem key={key} value={key} className="transition-colors duration-150">
                          <div className="flex items-center gap-2">
                            <Icon className={cn("h-4 w-4", template.color)} />
                            <span className="capitalize">{key}</span>
                            <Badge variant="outline" className="text-xs">
                              .{template.extension}
                            </Badge>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fileContent" className="flex items-center gap-1">
                Content <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="fileContent"
                placeholder={`Enter your ${fileType} content here...`}
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                className="min-h-32 font-mono text-sm resize-none transition-all duration-200 focus:ring-2 focus:ring-primary/20 scroll-smooth"
                rows={6}
                required
              />
              {fileContent && (
                <div className="text-xs text-muted-foreground flex items-center gap-4 animate-in fade-in duration-200">
                  <span>
                    {fileContent.length} characters • {new Blob([fileContent]).size} bytes
                  </span>
                </div>
              )}
            </div>

            {hasTextContent && (
              <Card className="border-primary/20 bg-primary/5 animate-in fade-in slide-in-from-top-2 duration-300">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <IconComponent className={cn("h-4 w-4", template.color)} />
                    <span className="font-medium">
                      {fileName.includes(".") ? fileName : `${fileName}.${template.extension}`}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {formatFileSize(new Blob([fileContent]).size)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-accent/10 border border-accent/20">
                <Upload className="h-4 w-4 text-accent" />
              </div>
              <h3 className="font-semibold text-sm">Select Existing Files</h3>
              <Badge variant="secondary" className="text-xs">
                Optional
              </Badge>
            </div>

            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-20 border-2 border-dashed hover:border-teal-500 bg-teal-600 hover:bg-teal-700 text-gray-900 dark:text-white border-teal-500 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex flex-col items-center gap-2">
                  <Plus className="h-6 w-6 transition-transform duration-200 group-hover:rotate-90" />
                  <span className="text-sm font-medium">Choose Files</span>
                  <span className="text-xs opacity-90">Click to browse your device</span>
                </div>
              </Button>

              <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" />

              {selectedFiles.length > 0 && (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Selected Files</span>
                    <Badge variant="secondary">{selectedFiles.length} files</Badge>
                  </div>

                  <div className="space-y-2 max-h-32 overflow-y-auto scroll-smooth">
                    {selectedFiles.map((file, index) => (
                      <Card
                        key={index}
                        className="border-accent/20 animate-in fade-in slide-in-from-left-2 duration-200"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate" title={file.name}>
                                  {file.name}
                                </p>
                                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveFile(index)}
                              className="text-muted-foreground hover:text-destructive flex-shrink-0 transition-all duration-200 hover:scale-110 active:scale-95"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-4 border-t">
          <div className="flex flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Zap className="h-3 w-3" />
              <span>Instant P2P transfer</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="secondary"
              onClick={handleClose}
              className="flex-1 sm:flex-none transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>

            <div className="flex gap-2 flex-1">
              <Button
                variant="outline"
                onClick={handleDownload}
                disabled={!canSave}
                className="flex-1 bg-transparent transition-all duration-200 hover:scale-105 active:scale-95 disabled:hover:scale-100"
              >
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Download</span>
                <span className="sm:hidden">Save</span>
              </Button>

              <Button
                variant="success"
                onClick={handleSave}
                disabled={!canSave}
                className="flex-1 transition-all duration-200 hover:scale-105 active:scale-95 disabled:hover:scale-100"
              >
                <Save className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Add & Share</span>
                <span className="sm:hidden">Share</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CreateFileModal
