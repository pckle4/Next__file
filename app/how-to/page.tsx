"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Upload,
  Download,
  Wifi,
  Shield,
  Zap,
  CheckCircle,
  AlertTriangle,
  Info,
  Globe,
  Lock,
  Server,
  Smartphone,
  Monitor,
  Tablet,
  Network,
  Key,
  Link,
  Activity,
  Database,
  Cpu,
  HardDrive,
  Signal,
  Eye,
  Settings,
  BarChart3,
  FileImage,
  Boxes,
  Target,
  Gauge,
  TrendingUp,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Router,
  CloudOff,
  Fingerprint,
  Layers,
  Maximize2,
  MemoryStick,
  Timer,
} from "lucide-react"
import { NavigationMenu } from "@/components/navigation-menu"
import { AppFooter } from "@/components/app-footer"

export default function HowToPage() {
  const steps = [
    {
      title: "Generate Your Connection Key",
      description: "Your unique 6-character key is automatically generated using WebRTC peer ID system",
      icon: Key,
      details: [
        "Each session gets a cryptographically secure peer ID generated using timestamp + random characters",
        "Session persistence system maintains your identity across browser refreshes for 30 days",
        "Share this key with others to establish direct WebRTC peer-to-peer connections",
        "Key remains active during your entire browser session with automatic cleanup on close",
        "Copy button uses Clipboard API for easy sharing across platforms and devices",
        "Refresh the page to generate a new key if needed, with automatic session migration",
        "Connection keys are case-insensitive and use alphanumeric characters only",
        "Each key is globally unique within the PeerJS network namespace",
      ],
      technical: "Uses WebRTC PeerJS with STUN/TURN servers for NAT traversal and ICE candidate gathering",
      tips: [
        "Share keys through secure channels like encrypted messaging apps",
        "Use the copy button for accurate key sharing without typos",
        "Connection keys expire when the browser session ends",
      ],
    },
    {
      title: "Connect to Peers",
      description: "Enter another user's connection key to establish a secure P2P connection with enhanced monitoring",
      icon: Link,
      details: [
        "Enter the 6-character key in the connection field with automatic validation",
        "Multiple peer connections supported simultaneously (up to 10 concurrent connections)",
        "Enhanced connection status box with expandable peer details and mobile optimization",
        "Individual peer disconnect buttons for granular connection management",
        "Connection heartbeat system monitors health with 5-second interval checks",
        "Automatic reconnection on temporary network issues with exponential backoff (1s, 2s, 4s, 8s)",
        "Connection quality assessment: excellent (<100ms), good (<300ms), poor (>300ms)",
        "Real-time peer connection/disconnection logging with detailed peer ID tracking",
        "Visual connection state indicators: connecting, connected, disconnected, error",
        "ICE connection state monitoring for WebRTC transport-level diagnostics",
      ],
      technical: "Establishes WebRTC DataChannel with DTLS 1.2 encryption and continuous heartbeat monitoring",
      tips: [
        "Wait for 'Connected' status before sending files",
        "Green indicators mean optimal connection quality",
        "Yellow/Red warnings suggest network optimization needed",
      ],
    },
    {
      title: "Select and Send Files",
      description: "Advanced file selection with colored file type icons and enhanced visual feedback",
      icon: Upload,
      details: [
        "HTML5 drag-and-drop API with visual feedback and accessibility support (WCAG 2.1 AA compliant)",
        "Support for all file types and sizes with MIME type detection and validation",
        "Colored file type icons: images (blue), videos (purple), audio (green), documents (orange), archives (gray)",
        "Different icon shades for incoming vs outgoing files for easy identification",
        "File preview generation with thumbnail support and metadata extraction (name, size, type, modified date)",
        "Configurable file limits (adjustable in settings) with real-time validation",
        "Send to all peers or select specific recipients with target peer selection dropdown",
        "Batch file transfers with individual progress tracking and chunk management",
        "Create text files directly in the app with built-in editor functionality",
        "Multiple file selection support using Ctrl/Cmd+Click or Shift+Click",
        "Right-click context menu for advanced file operations",
        "Keyboard shortcut: Ctrl/Cmd+Enter to send selected files",
      ],
      technical: "Files are chunked (default 64KB) and sent via WebRTC DataChannel with integrity verification",
      tips: [
        "Use drag-and-drop for quickest file selection",
        "Select 'All Peers' to broadcast files to everyone",
        "Monitor transfer speeds in real-time analytics panel",
      ],
    },
    {
      title: "Receive Files Instantly",
      description: "Real-time file reception with enhanced visual indicators and mobile-responsive design",
      icon: Download,
      details: [
        "Real-time transfer progress with speed calculations (KB/s, MB/s) and ETA estimates",
        "Chunk-level acknowledgment system ensures 100% data integrity with retry mechanism",
        "Mobile-responsive file history with same desktop features but optimized sizing",
        "Auto-download option for seamless experience with manual override controls",
        "Transfer history with detailed metadata: filename, size, sender, timestamp, status",
        "File integrity verification on completion with automatic error detection using checksums",
        "Memory-efficient chunk reassembly without loading entire files into memory at once",
        "Automatic MIME type detection and proper file extension handling",
        "Received files are stored temporarily in browser memory before download",
        "Download location follows browser's default download folder settings",
        "Failed transfers can be retried without re-requesting from sender",
        "Cancel button available during active transfers to abort reception",
      ],
      technical: "Received chunks are stored in Map structure and reassembled with checksum verification",
      tips: [
        "Enable auto-download in settings for hands-free operation",
        "Check file details before downloading",
        "View transfer history for all received files",
      ],
    },
    {
      title: "Monitor Analytics & Performance",
      description: "AI-enhanced storage analytics with automatic updates and comprehensive insights",
      icon: BarChart3,
      details: [
        "Live connection status with latency monitoring and quality indicators (ping, jitter)",
        "AI-enhanced expandable storage analyzer with automatic real-time updates every 5 seconds",
        "Storage data automatically refreshes without manual intervention or clicking expand",
        "Files sent and received counters with total data volume tracking (bytes, KB, MB, GB)",
        "Real-time transfer speeds with historical averages and peak performance metrics",
        "Connection history and session analytics with persistent localStorage tracking",
        "Peer activity monitoring with individual connection quality metrics per peer",
        "Performance optimization suggestions based on network conditions and usage patterns",
        "Browser memory usage monitoring when Performance API is available",
        "Download/upload bandwidth utilization graphs and charts",
        "Connection uptime tracking and session duration statistics",
        "Transfer success rate percentage and failure reason analysis",
      ],
      technical:
        "Real-time metrics collected via WebRTC stats API with localStorage persistence and event-driven updates",
      tips: [
        "Storage analyzer updates automatically in real-time",
        "Use performance insights to optimize chunk size",
        "Monitor connection health for best transfer timing",
      ],
    },
  ]

  const features = [
    {
      title: "End-to-End Encryption",
      description: "All transfers are encrypted using WebRTC's built-in DTLS/SRTP security protocols with AES-256",
      icon: Shield,
      color: "text-green-500",
      details: "Military-grade encryption with perfect forward secrecy and unique session keys",
      specs: [
        "DTLS 1.2 with ECDHE key exchange",
        "AES-256-GCM cipher suite",
        "SHA-384 message authentication",
        "Perfect forward secrecy (PFS)",
      ],
    },
    {
      title: "Zero Server Storage",
      description: "Files transfer directly between devices via WebRTC DataChannels, never stored on any servers",
      icon: CloudOff,
      color: "text-blue-500",
      details: "Zero-knowledge architecture with automatic memory cleanup and no data retention",
      specs: [
        "Direct peer-to-peer connections",
        "No server intermediary for files",
        "Automatic memory garbage collection",
        "No cloud storage or logs",
      ],
    },
    {
      title: "Multi-Peer Support",
      description: "Connect to up to 10 peers simultaneously with efficient connection pooling and resource sharing",
      icon: Users,
      color: "text-purple-500",
      details: "Advanced peer management with individual connection monitoring and quality assessment",
      specs: [
        "Up to 10 concurrent connections",
        "Individual peer quality metrics",
        "Connection pool optimization",
        "Selective file broadcasting",
      ],
    },
    {
      title: "Real-time Monitoring",
      description: "Live progress tracking, connection quality metrics, and instant status notifications",
      icon: Activity,
      color: "text-yellow-500",
      details: "Sub-second latency for status updates with comprehensive analytics dashboard",
      specs: [
        "5-second heartbeat monitoring",
        "<100ms status update latency",
        "Live transfer progress bars",
        "Connection quality indicators",
      ],
    },
  ]

  const troubleshooting = [
    {
      issue: "Connection Failed",
      icon: XCircle,
      severity: "high",
      solutions: [
        "Check if both devices have stable internet with sufficient bandwidth (minimum 1 Mbps recommended)",
        "Disable VPN or proxy temporarily as they may interfere with WebRTC's UDP transport",
        "Try refreshing the page to regenerate peer ID and clear session data from localStorage",
        "Ensure firewall isn't blocking WebRTC connections (UDP ports 3478, 19302 for STUN)",
        "Verify both browsers support WebRTC DataChannels (Chrome 56+, Firefox 51+, Safari 11+, Edge 79+)",
        "Check connection status component for specific error messages and diagnostics",
        "Try using a different network if corporate firewalls block WebRTC",
        "Ensure both peers are on networks that support UDP traffic",
      ],
      prevention: [
        "Use modern browsers with full WebRTC support",
        "Avoid restrictive network environments",
        "Keep browser updated to latest version",
      ],
    },
    {
      issue: "Slow Transfer Speed",
      icon: Gauge,
      severity: "medium",
      solutions: [
        "Move devices closer together if using WiFi to improve signal strength (< 30ft ideal)",
        "Close other bandwidth-intensive applications and browser tabs to free resources",
        "Adjust chunk size in floating settings bubble (smaller for unstable, larger for fast networks)",
        "Switch to a wired Ethernet connection if possible for maximum stability (gigabit recommended)",
        "Monitor connection quality indicators in peer panel for optimization hints",
        "Check live analytics for performance insights and bottleneck identification",
        "Ensure both devices have sufficient CPU and RAM available",
        "Disable browser extensions that may throttle connections",
        "Check router QoS settings aren't limiting WebRTC traffic",
      ],
      prevention: [
        "Use wired connections when transferring large files",
        "Optimize chunk size based on network conditions",
        "Close unnecessary background applications",
      ],
    },
    {
      issue: "Files Not Downloading",
      icon: AlertTriangle,
      severity: "medium",
      solutions: [
        "Check browser's download permissions in Settings > Privacy > Site Settings",
        "Ensure sufficient storage space available on receiving device (check disk space)",
        "Try manual download instead of auto-download in transfer status panel",
        "Clear browser cache and restart the session if persistence issues occur",
        "Verify file integrity using the built-in verification system",
        "Check transfer status component for detailed error messages and retry options",
        "Disable popup blockers that may prevent download prompts",
        "Try a different browser if issue persists",
        "Check browser console for JavaScript errors affecting downloads",
      ],
      prevention: [
        "Enable auto-download in settings for smoother experience",
        "Regularly clear browser cache and temporary files",
        "Maintain adequate free disk space",
      ],
    },
    {
      issue: "Transfer Keeps Failing",
      icon: RefreshCw,
      severity: "high",
      solutions: [
        "Reduce chunk size in settings for unstable network connections (try 16KB or 32KB)",
        "Monitor connection heartbeat indicators for quality degradation",
        "Check browser memory usage in settings panel for resource constraints",
        "Ensure both peers maintain active browser tabs during large transfers",
        "Try transferring smaller batches of files to reduce memory pressure",
        "Use live analytics to identify patterns in transfer failures",
        "Disable browser sleep/hibernation during active transfers",
        "Check for network instability using connection quality metrics",
        "Restart browser to clear memory leaks from long sessions",
      ],
      prevention: [
        "Keep browser tabs active during transfers",
        "Use appropriate chunk sizes for your network",
        "Monitor system resources before large transfers",
      ],
    },
  ]

  const deviceCompatibility = [
    {
      device: "Desktop",
      icon: Monitor,
      support: "Full Support",
      details: "All features with optimal performance",
      browsers: ["Chrome 56+", "Firefox 51+", "Edge 79+", "Opera 43+"],
      performance: "Best for large transfers",
    },
    {
      device: "Mobile",
      icon: Smartphone,
      support: "Optimized",
      details: "Touch-friendly with memory considerations",
      browsers: ["Chrome Android", "Safari iOS 11+", "Firefox Android"],
      performance: "Good for < 100MB files",
    },
    {
      device: "Tablet",
      icon: Tablet,
      support: "Full Support",
      details: "Responsive design with desktop features",
      browsers: ["Safari iPadOS", "Chrome Android", "Samsung Internet"],
      performance: "Excellent for all file sizes",
    },
  ]

  const advancedFeatures = [
    {
      title: "Connection Heartbeat Monitoring",
      icon: Activity,
      description: "Continuous 5-second interval health checks with 3-second timeout detection",
      benefits: ["Early connection issue detection", "Automatic reconnection triggers", "Quality metrics collection"],
    },
    {
      title: "Chunk-Based Transfer System",
      icon: Boxes,
      description: "Configurable chunking (1KB-1MB) for memory-efficient large file transfers",
      benefits: ["Reduced memory footprint", "Pausable/resumable transfers", "Progress granularity"],
    },
    {
      title: "Storage Analytics Dashboard",
      icon: Database,
      description: "Real-time browser storage monitoring across localStorage, sessionStorage, IndexedDB, Cookies",
      benefits: ["Automatic updates every 5 seconds", "Storage health scoring", "Cleanup recommendations"],
    },
    {
      title: "Multi-Target Broadcasting",
      icon: Target,
      description: "Send files to all connected peers simultaneously or select specific recipients",
      benefits: ["Efficient group collaboration", "Selective file distribution", "Bandwidth optimization"],
    },
    {
      title: "File Type Detection",
      icon: FileImage,
      description: "Automatic MIME type detection with color-coded icons for quick visual identification",
      benefits: ["Visual file categorization", "Proper extension handling", "Metadata extraction"],
    },
    {
      title: "Connection Quality Indicators",
      icon: Signal,
      description: "Real-time latency monitoring with color-coded quality assessment (green/yellow/red)",
      benefits: ["Network performance visibility", "Optimal transfer timing", "Troubleshooting guidance"],
    },
  ]

  const keyboardShortcuts = [
    { keys: "Ctrl/Cmd + Enter", action: "Send selected files to connected peers", icon: Upload },
    { keys: "Escape", action: "Clear current file selection", icon: XCircle },
    { keys: "Ctrl/Cmd + Click", action: "Multi-select files", icon: CheckCircle2 },
    { keys: "Shift + Click", action: "Select range of files", icon: Maximize2 },
  ]

  const performanceMetrics = [
    {
      metric: "Transfer Speed",
      icon: Zap,
      typical: "1-10 MB/s",
      optimal: "20-50 MB/s",
      factors: "Network bandwidth, chunk size, device performance",
    },
    {
      metric: "Connection Latency",
      icon: Timer,
      typical: "50-200ms",
      optimal: "<100ms",
      factors: "Geographic distance, network hops, ISP routing",
    },
    {
      metric: "Memory Usage",
      icon: MemoryStick,
      typical: "50-200 MB",
      optimal: "<100 MB",
      factors: "Active transfers, chunk size, browser optimization",
    },
    {
      metric: "Max File Size",
      icon: HardDrive,
      typical: "Up to 2GB",
      optimal: "<500 MB per file",
      factors: "Browser memory limits, device RAM, network stability",
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-muted/30 to-accent/10">
      <header className="w-full bg-background/95 backdrop-blur-sm border-b border-border/50 sticky top-0 z-30">
        <NavigationMenu />
      </header>

      <div className="flex-1 p-4 pt-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 mb-4">
              <Info className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Comprehensive User Guide</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
              How to Use Nowhile
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Master Nowhile's advanced peer-to-peer file transfer system with WebRTC technology, chunked transfers,
              real-time monitoring, and comprehensive analytics. No servers, no storage, just direct device-to-device
              transfers with military-grade encryption.
            </p>
            <div className="flex flex-wrap gap-3 justify-center pt-2">
              <Badge variant="outline" className="gap-1">
                <Shield className="h-3 w-3" />
                DTLS 1.2 Encrypted
              </Badge>
              <Badge variant="outline" className="gap-1">
                <CloudOff className="h-3 w-3" />
                Zero Server Storage
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Users className="h-3 w-3" />
                Multi-Peer Support
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Zap className="h-3 w-3" />
                Real-Time Monitoring
              </Badge>
            </div>
          </div>

          <Alert className="border-2 border-orange-500/50 bg-gradient-to-r from-orange-500/10 via-yellow-500/10 to-orange-500/10 animate-pulse-subtle">
            <AlertTriangle className="h-5 w-5 text-orange-500 animate-bounce-subtle" />
            <AlertTitle className="text-lg font-bold text-orange-600 dark:text-orange-400">
              Educational Project Notice
            </AlertTitle>
            <AlertDescription className="text-sm leading-relaxed space-y-2">
              <p className="font-semibold">
                This is an educational project created for learning purposes. Please be aware:
              </p>
              <ul className="space-y-1 ml-4 list-disc">
                <li>
                  <strong>Features In Development:</strong> Some features might not work as expected or fail to deliver
                  optimal performance as this is a demonstration project
                </li>
                <li>
                  <strong>Privacy Notice:</strong> Do NOT enter personal details, sensitive information, or confidential
                  data as this is an educational site
                </li>
                <li>
                  <strong>No Guarantees:</strong> This project comes with no warranties or guarantees of functionality,
                  security, or data persistence
                </li>
                <li>
                  <strong>Testing Environment:</strong> Use this application for testing and learning purposes only, not
                  for production or critical file transfers
                </li>
              </ul>
              <p className="text-xs italic pt-2">
                By using this application, you acknowledge that it is an educational demonstration and accept full
                responsibility for any data you choose to transfer.
              </p>
            </AlertDescription>
          </Alert>

          {/* Device Compatibility Card */}
          <Card className="animate-slide-up border-2 hover:border-primary/30 transition-all">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Device & Browser Compatibility</CardTitle>
                  <CardDescription>Nowhile works seamlessly across all modern devices and browsers</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                {deviceCompatibility.map((item, index) => {
                  const Icon = item.icon
                  return (
                    <div
                      key={index}
                      className="flex flex-col gap-3 p-4 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 hover:border-primary/30 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold text-lg">{item.device}</div>
                          <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                            {item.support}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">{item.details}</div>
                      <Separator />
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          Supported Browsers:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {item.browsers.map((browser, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {browser}
                            </Badge>
                          ))}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 pt-1">
                          <TrendingUp className="h-3 w-3 text-green-500" />
                          {item.performance}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Step-by-Step Guide */}
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">Step-by-Step Guide</h2>
              <p className="text-muted-foreground">Follow these steps to start transferring files securely</p>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              {steps.map((step, index) => {
                const Icon = step.icon
                return (
                  <Card
                    key={index}
                    className="animate-bounce-in border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-card to-card/50"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl border border-primary/20">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <Badge variant="outline" className="text-xs font-semibold">
                          Step {index + 1} of {steps.length}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{step.title}</CardTitle>
                      <CardDescription className="text-base">{step.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                          <CheckCircle className="h-4 w-4" />
                          Key Features:
                        </div>
                        <ul className="space-y-2 pl-2">
                          {step.details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="leading-relaxed">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Separator />

                      <Alert className="bg-blue-500/5 border-blue-500/20">
                        <Cpu className="h-4 w-4 text-blue-500" />
                        <AlertDescription className="text-xs leading-relaxed">
                          <strong className="text-blue-500">Technical Details:</strong> {step.technical}
                        </AlertDescription>
                      </Alert>

                      {step.tips && (
                        <>
                          <Separator />
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-semibold text-accent">
                              <Zap className="h-4 w-4" />
                              Pro Tips:
                            </div>
                            <ul className="space-y-1.5 pl-2">
                              {step.tips.map((tip, tipIndex) => (
                                <li key={tipIndex} className="flex items-start gap-2 text-xs text-muted-foreground">
                                  <Target className="h-3 w-3 text-accent mt-0.5 flex-shrink-0" />
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Key Features with Enhanced Details */}
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">Core Features</h2>
              <p className="text-muted-foreground">Enterprise-grade capabilities built into Nowhile</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <Card
                    key={index}
                    className="animate-slide-up hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30 bg-gradient-to-br from-card to-muted/20"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="p-3 bg-gradient-to-br from-muted to-muted/50 rounded-xl border border-border">
                          <Icon className={`h-8 w-8 ${feature.color}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1">{feature.title}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="space-y-3">
                        <Badge variant="outline" className="text-xs">
                          {feature.details}
                        </Badge>
                        <div className="space-y-2">
                          <div className="text-xs font-semibold text-muted-foreground">Technical Specifications:</div>
                          <ul className="space-y-1">
                            {feature.specs.map((spec, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                                <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                                {spec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Advanced Features Grid */}
          <Card className="animate-slide-up border-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Layers className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Advanced Features</CardTitle>
                  <CardDescription>Professional capabilities for power users</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {advancedFeatures.map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <div
                      key={index}
                      className="p-4 rounded-lg bg-gradient-to-br from-muted/50 to-muted/20 border border-border/50 hover:border-primary/30 transition-all"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Icon className="h-5 w-5 text-primary" />
                        <h4 className="font-semibold text-sm">{feature.title}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{feature.description}</p>
                      <Separator className="my-2" />
                      <div className="space-y-1">
                        {feature.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                            <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                            {benefit}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card className="animate-slide-up border-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Gauge className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Real-world performance expectations and optimization targets</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {performanceMetrics.map((metric, index) => {
                  const Icon = metric.icon
                  return (
                    <div
                      key={index}
                      className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 border border-border/50"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Icon className="h-5 w-5 text-primary" />
                        <h4 className="font-semibold">{metric.metric}</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Typical</div>
                          <div className="text-sm font-semibold text-yellow-600">{metric.typical}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Optimal</div>
                          <div className="text-sm font-semibold text-green-600">{metric.optimal}</div>
                        </div>
                      </div>
                      <Separator className="my-2" />
                      <div className="text-xs text-muted-foreground">
                        <strong>Factors:</strong> {metric.factors}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Keyboard Shortcuts */}
          <Card className="animate-slide-up border-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Settings className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Keyboard Shortcuts</CardTitle>
                  <CardDescription>Speed up your workflow with keyboard commands</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {keyboardShortcuts.map((shortcut, index) => {
                  const Icon = shortcut.icon
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50"
                    >
                      <Icon className="h-5 w-5 text-primary flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-mono text-sm font-semibold">{shortcut.keys}</div>
                        <div className="text-xs text-muted-foreground">{shortcut.action}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Troubleshooting Guide with Enhanced Details */}
          <Card className="animate-slide-up border-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <CardTitle>Troubleshooting Guide</CardTitle>
                  <CardDescription>Common issues and their solutions to ensure smooth file transfers</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="issue-0" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                  {troubleshooting.map((item, index) => {
                    const Icon = item.icon
                    return (
                      <TabsTrigger key={index} value={`issue-${index}`} className="gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{item.issue}</span>
                      </TabsTrigger>
                    )
                  })}
                </TabsList>

                {troubleshooting.map((item, index) => {
                  const Icon = item.icon
                  return (
                    <TabsContent key={index} value={`issue-${index}`} className="space-y-4 mt-4">
                      <div className="flex items-center gap-3 mb-4">
                        <Icon className={`h-6 w-6 ${item.severity === "high" ? "text-red-500" : "text-yellow-500"}`} />
                        <div>
                          <h4 className="font-semibold text-lg">{item.issue}</h4>
                          <Badge
                            variant="outline"
                            className={
                              item.severity === "high"
                                ? "text-red-600 border-red-600"
                                : "text-yellow-600 border-yellow-600"
                            }
                          >
                            {item.severity === "high" ? "High Priority" : "Medium Priority"}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h5 className="font-semibold text-sm mb-3 flex items-center gap-2">
                            <Settings className="h-4 w-4 text-primary" />
                            Solutions:
                          </h5>
                          <ul className="space-y-2">
                            {item.solutions.map((solution, solutionIndex) => (
                              <li key={solutionIndex} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="leading-relaxed">{solution}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <Separator />

                        <div>
                          <h5 className="font-semibold text-sm mb-3 flex items-center gap-2">
                            <Shield className="h-4 w-4 text-green-500" />
                            Prevention Tips:
                          </h5>
                          <ul className="space-y-2">
                            {item.prevention.map((tip, tipIndex) => (
                              <li key={tipIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <Target className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </TabsContent>
                  )
                })}
              </Tabs>
            </CardContent>
          </Card>

          {/* Pro Tips & Best Practices - Enhanced */}
          <Card className="animate-slide-up border-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Zap className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <CardTitle>Pro Tips & Best Practices</CardTitle>
                  <CardDescription>Expert recommendations for optimal performance and security</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Security Best Practices */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <Shield className="h-5 w-5 text-green-500" />
                    </div>
                    <h4 className="font-semibold text-green-600">Security Best Practices</h4>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-sm">
                      <Lock className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                      <div>
                        <div className="font-medium mb-1">Secure Key Sharing</div>
                        <div className="text-muted-foreground text-xs leading-relaxed">
                          Only share connection keys with trusted contacts through secure channels like encrypted
                          messaging apps (Signal, WhatsApp)
                        </div>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <Fingerprint className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                      <div>
                        <div className="font-medium mb-1">Verify File Sources</div>
                        <div className="text-muted-foreground text-xs leading-relaxed">
                          Always verify file contents and sources before opening received files, especially executables
                        </div>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <Eye className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                      <div>
                        <div className="font-medium mb-1">Monitor Connections</div>
                        <div className="text-muted-foreground text-xs leading-relaxed">
                          Regularly check connection heartbeat indicators for unusual activity patterns or unknown peers
                        </div>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <Shield className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                      <div>
                        <div className="font-medium mb-1">Automatic Encryption</div>
                        <div className="text-muted-foreground text-xs leading-relaxed">
                          All transfers automatically use end-to-end DTLS 1.2 encryption with AES-256 cipher suites
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Performance Optimization */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Zap className="h-5 w-5 text-blue-500" />
                    </div>
                    <h4 className="font-semibold text-blue-600">Performance Optimization</h4>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-sm">
                      <Router className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0" />
                      <div>
                        <div className="font-medium mb-1">Network Optimization</div>
                        <div className="text-muted-foreground text-xs leading-relaxed">
                          Use the same local network when possible for optimal WebRTC performance (LAN transfers are 10x
                          faster)
                        </div>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <Activity className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0" />
                      <div>
                        <div className="font-medium mb-1">Keep Tabs Active</div>
                        <div className="text-muted-foreground text-xs leading-relaxed">
                          Maintain active browser tabs during transfers to prevent browser throttling and connection
                          drops
                        </div>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <Settings className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0" />
                      <div>
                        <div className="font-medium mb-1">Chunk Size Tuning</div>
                        <div className="text-muted-foreground text-xs leading-relaxed">
                          Adjust chunk size in settings: smaller (16-32KB) for unstable connections, larger (256KB-1MB)
                          for fast networks
                        </div>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <BarChart3 className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0" />
                      <div>
                        <div className="font-medium mb-1">Real-Time Analytics</div>
                        <div className="text-muted-foreground text-xs leading-relaxed">
                          Monitor live analytics for performance insights and use connection quality indicators for
                          optimal timing
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <Separator />

              {/* Technical Specifications */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Server className="h-5 w-5 text-purple-500" />
                  </div>
                  <h4 className="font-semibold text-purple-600">Technical Specifications</h4>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 text-sm">
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="font-semibold mb-1 flex items-center gap-2">
                      <Network className="h-4 w-4 text-primary" />
                      Protocol
                    </div>
                    <div className="text-xs text-muted-foreground">
                      WebRTC DataChannel with SCTP over DTLS over UDP/ICE
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="font-semibold mb-1 flex items-center gap-2">
                      <Lock className="h-4 w-4 text-primary" />
                      Encryption
                    </div>
                    <div className="text-xs text-muted-foreground">DTLS 1.2 with AES-256-GCM and SHA-384 MAC</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="font-semibold mb-1 flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-primary" />
                      Max File Size
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Limited by browser memory (recommended &lt;2GB per file)
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="font-semibold mb-1 flex items-center gap-2">
                      <Boxes className="h-4 w-4 text-primary" />
                      Chunk Size
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Configurable 1KB-1MB (default 64KB for optimal balance)
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="font-semibold mb-1 flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" />
                      Heartbeat
                    </div>
                    <div className="text-xs text-muted-foreground">
                      5-second interval checks with 3-second timeout detection
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="font-semibold mb-1 flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Max Peers
                    </div>
                    <div className="text-xs text-muted-foreground">
                      10 simultaneous connections with connection pooling
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="font-semibold mb-1 flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary" />
                      Browser Support
                    </div>
                    <div className="text-xs text-muted-foreground">Chrome 56+, Firefox 51+, Safari 11+, Edge 79+</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="font-semibold mb-1 flex items-center gap-2">
                      <Wifi className="h-4 w-4 text-primary" />
                      Network
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Works behind NAT/Firewall with STUN/TURN fallback
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="font-semibold mb-1 flex items-center gap-2">
                      <CloudOff className="h-4 w-4 text-primary" />
                      Storage
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Zero server-side storage, 30-day session persistence
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Reference Card */}
          <Card className="animate-slide-up border-2 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Info className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Quick Reference</CardTitle>
                  <CardDescription>Essential information at a glance</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 text-sm">
                <div className="p-3 rounded-lg bg-background/50 border border-border">
                  <div className="font-semibold mb-1 text-green-600">Connection Quality</div>
                  <div className="text-xs text-muted-foreground">
                    <div>🟢 Excellent: &lt;100ms</div>
                    <div>🟡 Good: &lt;300ms</div>
                    <div>🔴 Poor: &gt;300ms</div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border">
                  <div className="font-semibold mb-1 text-blue-600">File Icons</div>
                  <div className="text-xs text-muted-foreground">
                    <div>🔵 Images</div>
                    <div>🟣 Videos</div>
                    <div>🟢 Audio</div>
                    <div>🟠 Documents</div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border">
                  <div className="font-semibold mb-1 text-purple-600">Optimal Settings</div>
                  <div className="text-xs text-muted-foreground">
                    <div>Fast: 256KB-1MB chunks</div>
                    <div>Normal: 64KB chunks</div>
                    <div>Slow: 16-32KB chunks</div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border">
                  <div className="font-semibold mb-1 text-orange-600">Session Info</div>
                  <div className="text-xs text-muted-foreground">
                    <div>Duration: 30 days max</div>
                    <div>Auto-cleanup enabled</div>
                    <div>Persistent across refreshes</div>
                  </div>
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
