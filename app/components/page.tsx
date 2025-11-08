"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Upload, Download, Users, BarChart3, Settings, Wifi, Shield, Zap, FileText, Monitor } from "lucide-react"
import { NavigationMenu } from "@/components/navigation-menu"
import { AppFooter } from "@/components/app-footer"

export default function ComponentsPage() {
  const components = [
    {
      name: "Connection Hub",
      description: "Manages peer connections and displays your unique connection key",
      icon: Users,
      features: [
        "Auto-generated 6-character peer ID",
        "One-click key copying",
        "Real-time connection status",
        "Multi-peer connection support",
        "Connection validation and error handling",
      ],
      techDetails: "Uses WebRTC PeerJS for establishing direct peer connections",
    },
    {
      name: "File Upload Zone",
      description: "Drag & drop interface for selecting files to share",
      icon: Upload,
      features: [
        "Drag and drop file selection",
        "Multiple file type support",
        "File preview with thumbnails",
        "File size and type validation",
        "Batch file removal",
      ],
      techDetails: "HTML5 File API with custom drag/drop handlers and file validation",
    },
    {
      name: "Transfer Status",
      description: "Real-time monitoring of file transfers with progress tracking",
      icon: Download,
      features: [
        "Live progress bars",
        "Transfer speed calculation",
        "Incoming/outgoing file queues",
        "Auto-download toggle",
        "Transfer history management",
      ],
      techDetails: "WebRTC DataChannel with chunked file transfer and progress callbacks",
    },
    {
      name: "Live Analytics",
      description: "Dashboard showing connection statistics and transfer metrics",
      icon: BarChart3,
      features: [
        "Connected peers counter",
        "Files sent/received tracking",
        "Total data transferred",
        "Connection history log",
        "Real-time status indicators",
      ],
      techDetails: "React state management with localStorage persistence",
    },
    {
      name: "Peer Panel",
      description: "Management interface for connected peers and their status",
      icon: Wifi,
      features: [
        "Connected peer list",
        "Individual peer status",
        "Direct file sending to specific peers",
        "Peer disconnection controls",
        "Connection quality indicators",
      ],
      techDetails: "PeerJS connection management with custom event handlers",
    },
    {
      name: "Settings Panel",
      description: "Configuration options for transfer behavior and preferences",
      icon: Settings,
      features: [
        "Chunk size adjustment",
        "Auto-download toggle",
        "Transfer timeout settings",
        "Connection preferences",
        "Performance optimization",
      ],
      techDetails: "React Context for global settings with localStorage persistence",
    },
    {
      name: "Connection Status",
      description: "Visual indicator of connection health and peer information",
      icon: Shield,
      features: [
        "Real-time connection status",
        "Network quality indicators",
        "Peer count display",
        "Connection error reporting",
        "Reconnection status",
      ],
      techDetails: "WebRTC connection state monitoring with custom status logic",
    },
  ]

  const architecture = [
    {
      layer: "Frontend",
      description: "React with Next.js App Router",
      technologies: ["Next.js 14", "React 18", "TypeScript", "Tailwind CSS", "shadcn/ui"],
      icon: Monitor,
    },
    {
      layer: "P2P Communication",
      description: "WebRTC for direct peer connections",
      technologies: ["PeerJS", "WebRTC DataChannel", "STUN/TURN servers", "ICE candidates"],
      icon: Wifi,
    },
    {
      layer: "File Transfer",
      description: "Chunked binary data transmission",
      technologies: ["File API", "ArrayBuffer", "Blob", "Base64 encoding", "Progress tracking"],
      icon: FileText,
    },
    {
      layer: "Security",
      description: "Built-in WebRTC encryption",
      technologies: ["DTLS encryption", "SRTP", "ICE authentication", "Peer verification"],
      icon: Shield,
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-muted/30 to-accent/10">
      <header className="w-full bg-background/95 backdrop-blur-sm border-b border-border/50 sticky top-0 z-30">
        <NavigationMenu />
      </header>

      <div className="flex-1 p-4 pt-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4 animate-slide-up">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              App Components
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Explore the modular components that power Nowhile's peer-to-peer file sharing experience
            </p>
          </div>

          {/* Components Grid */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-8">Core Components</h2>
            <div className="grid gap-6 lg:grid-cols-2">
              {components.map((component, index) => {
                const Icon = component.icon
                return (
                  <Card
                    key={index}
                    className="animate-bounce-in border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{component.name}</CardTitle>
                          <CardDescription>{component.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2 text-sm">Key Features:</h4>
                        <ul className="space-y-1">
                          {component.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-start gap-2 text-sm">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Separator />
                      <div>
                        <h4 className="font-semibold mb-1 text-sm">Technical Implementation:</h4>
                        <p className="text-sm text-muted-foreground">{component.techDetails}</p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Architecture Overview */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Architecture Overview</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {architecture.map((layer, index) => {
                const Icon = layer.icon
                return (
                  <Card
                    key={index}
                    className="text-center animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardContent className="pt-6">
                      <div className="flex justify-center mb-4">
                        <div className="p-3 bg-muted rounded-full">
                          <Icon className="h-8 w-8 text-primary" />
                        </div>
                      </div>
                      <h3 className="font-semibold mb-2">{layer.layer}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{layer.description}</p>
                      <div className="space-y-1">
                        {layer.technologies.map((tech, techIndex) => (
                          <Badge key={techIndex} variant="outline" className="text-xs mr-1 mb-1">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Technical Details */}
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-accent" />
                Technical Highlights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-semibold text-green-600">Performance Optimizations:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Chunked file transfer for large files</li>
                    <li>• Configurable chunk sizes for optimal speed</li>
                    <li>• Connection pooling for multiple peers</li>
                    <li>• Efficient memory management for file handling</li>
                    <li>• Real-time progress tracking without blocking UI</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-blue-600">Security Features:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• End-to-end encryption via WebRTC DTLS</li>
                    <li>• No server-side file storage</li>
                    <li>• Peer authentication and validation</li>
                    <li>• Secure connection key generation</li>
                    <li>• Protection against connection hijacking</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AppFooter />
    </div>
  )
}
