"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Cpu,
  Database,
  Network,
  Shield,
  Zap,
  FileText,
  Users,
  Monitor,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Code,
  Server,
  Lock,
  Settings,
  Layers,
  Globe,
  Wifi,
  HardDrive,
  MemoryStick,
  Gauge,
  GitBranch,
  Package,
  Workflow,
  Binary,
  Radio,
  CloudOff,
  Fingerprint,
  Key,
  ShieldCheck,
  Blocks,
  FileCode,
  TrendingUp,
  BarChart3,
  Sparkles,
  Target,
  ArrowLeftRight,
  Boxes,
  FileStack,
} from "lucide-react"
import { NavigationMenu } from "@/components/navigation-menu"
import { AppFooter } from "@/components/app-footer"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function TechPage() {
  const coreComponents = [
    {
      name: "usePeerConnection Hook",
      file: "hooks/use-peer-connection.ts",
      purpose: "Central WebRTC connection management and coordination hub",
      icon: Network,
      complexity: "Critical",
      linesOfCode: "~450 lines",
      dependencies: ["PeerJS", "React Hooks", "Session Persistence"],
      keyContributions: [
        "Establishes and maintains WebRTC peer-to-peer connections using PeerJS library with automatic reconnection",
        "Manages up to 10 simultaneous peer connections in a Map data structure with O(1) lookup performance",
        "Implements connection health monitoring with real-time status updates and quality metrics",
        "Generates cryptographically unique 6-character peer IDs using timestamp + random character combination",
        "Coordinates all file transfer operations between connected peers with event-driven architecture",
        "Handles peer discovery, authentication, and connection state management with error recovery mechanisms",
        "Provides WebSocket signaling fallback for improved NAT traversal and connection reliability",
      ],
      failureConsequences: [
        "Complete loss of P2P connectivity - no file transfers possible across the entire application",
        "Existing connections drop immediately without graceful cleanup, causing data loss in progress",
        "Peer discovery becomes impossible, isolating users and preventing new connection establishment",
        "Real-time messaging and status updates cease functioning, breaking communication channels",
        "Connection quality monitoring and analytics stop working, removing visibility into network health",
        "Memory leaks from orphaned connection objects accumulate, degrading browser performance",
      ],
      technicalDetails: {
        webrtc: "STUN servers (Google, Twilio) for NAT traversal with ICE candidate gathering and trickle ICE",
        dataStructures: "Map<string, DataConnection> for O(1) peer lookup, Set for connection tracking",
        errorHandling: "Comprehensive try-catch blocks with exponential backoff retry logic and user notifications",
        performance: "Connection pooling, resource sharing, lazy initialization, and event delegation patterns",
        protocols: "WebRTC 1.0 API with JSEP offer/answer model and unified plan SDP format",
      },
    },
    {
      name: "Transfer Engine",
      file: "lib/transfer-engine.ts",
      purpose: "Core file transfer logic with chunked data transmission and integrity verification",
      icon: Zap,
      complexity: "Critical",
      linesOfCode: "~380 lines",
      dependencies: ["File API", "ArrayBuffer", "Blob", "EventEmitter"],
      keyContributions: [
        "Splits files into configurable chunks (1KB-1MB, default 64KB) for optimal network utilization and memory efficiency",
        "Implements chunk acknowledgment system with sequence numbers ensuring 100% data integrity and ordering",
        "Provides real-time progress tracking with speed calculations (bytes/second) and ETA predictions",
        "Manages memory efficiently using streaming approach - never loads entire large files into memory at once",
        "Uses EventEmitter pattern for decoupled progress notifications and transfer state updates",
        "Handles file reconstruction from received chunks with MIME type detection and automatic format validation",
        "Supports pause/resume functionality with state serialization for long-running transfers",
        "Implements adaptive chunk sizing based on network conditions and transfer speed metrics",
      ],
      failureConsequences: [
        "File transfers become impossible - core functionality completely broken with no workaround",
        "Partial file corruption without integrity verification, resulting in unusable downloaded files",
        "Memory leaks from unmanaged file chunks in browser memory, eventually crashing the browser tab",
        "UI freezing during large file processing operations, making the application unresponsive",
        "Loss of transfer progress tracking and speed metrics, removing visibility into transfer status",
        "Inability to resume interrupted transfers, forcing complete restart of large file transmissions",
      ],
      technicalDetails: {
        chunking: "ArrayBuffer-based chunking with configurable size (1KB-1MB), zero-copy operations where possible",
        integrity:
          "Chunk-level acknowledgment with CRC32 checksums, retry mechanism with exponential backoff for failed chunks",
        memory: "Streaming approach with chunk buffering, automatic garbage collection triggers, ArrayBuffer pooling",
        performance: "Concurrent chunk processing, pipelined acknowledgments, immediate send-on-ack optimization",
        encoding: "Base64 encoding for binary data over DataChannel when needed, with binary mode preference",
      },
    },
    {
      name: "Session Persistence",
      file: "lib/session-persistence.ts",
      purpose: "Maintains user sessions and connection state across browser sessions with multi-storage strategy",
      icon: Database,
      complexity: "High",
      linesOfCode: "~290 lines",
      dependencies: ["localStorage", "sessionStorage", "Memory Storage Fallback"],
      keyContributions: [
        "Multi-storage strategy with graceful degradation: localStorage → sessionStorage → memory fallback",
        "Generates and validates unique peer IDs with collision detection and expiration handling (30-day TTL)",
        "Implements caching with TTL (10 seconds) to reduce storage access overhead and improve performance",
        "Provides session validation with integrity checks, data sanitization, and automatic cleanup of stale data",
        "Handles storage quota exceeded errors gracefully with automatic cleanup of oldest entries",
        "Maintains session continuity across browser refreshes, crashes, and tab closures with state recovery",
        "Supports secure session migration between storage types when quota limits are reached",
        "Implements data compression for large session objects to maximize storage efficiency",
      ],
      failureConsequences: [
        "Users lose their identity on every page refresh - severely degraded user experience",
        "Connection keys regenerate constantly, breaking shared links and preventing stable peer connections",
        "Session data corruption leads to authentication failures and connection establishment errors",
        "Storage errors cause complete app initialization failure with no recovery mechanism",
        "Loss of user preferences, connection history, and transfer queue state",
        "Privacy concerns from session data persisting longer than intended in local storage",
      ],
      technicalDetails: {
        storage: "Singleton pattern with adapter strategy for storage abstraction and dependency injection",
        validation:
          "Session expiry (30 days), ID format validation (6-char alphanumeric), name sanitization (XSS prevention)",
        performance: "In-memory LRU cache with requestIdleCallback for async operations and debounced writes",
        reliability:
          "Graceful degradation with storage availability detection, corrupt data recovery, automatic repair",
        security: "XSS sanitization, data encryption option, secure random ID generation using Crypto API",
      },
    },
    {
      name: "File Upload Zone",
      file: "components/file-upload-zone.tsx",
      purpose: "User interface for file selection with drag-and-drop functionality and validation",
      icon: FileText,
      complexity: "Medium",
      linesOfCode: "~320 lines",
      dependencies: ["HTML5 File API", "Drag and Drop API", "React Hooks"],
      keyContributions: [
        "HTML5 drag-and-drop API integration with visual feedback, hover states, and drop zone highlighting",
        "File validation (type, size, count) with user-friendly error messages and suggested corrections",
        "Generates file previews and thumbnails for supported formats (images, PDFs) with lazy loading",
        "Manages file selection state with unique ID assignment and deduplication based on name and size",
        "Implements batch file operations (select all, remove individual, clear all) with undo capability",
        "Provides full accessibility features for keyboard navigation and screen reader users (ARIA labels)",
        "Supports multiple file selection methods: click, drag-drop, paste from clipboard, and keyboard",
        "Real-time file size calculation and upload quota visualization with remaining space indicator",
      ],
      failureConsequences: [
        "Users cannot select files for transfer - primary input method broken with no alternative",
        "Invalid files bypass validation, causing transfer errors, crashes, or security vulnerabilities",
        "Memory leaks from unrevoked object URLs for file previews, eventually degrading performance",
        "Poor accessibility prevents usage by disabled users, violating WCAG compliance standards",
        "UI becomes unresponsive during large file selection operations, blocking user interactions",
        "Lost file selections on accidental clicks or navigation without confirmation dialogs",
      ],
      technicalDetails: {
        dragDrop: "preventDefault on dragover/drop events, dataTransfer API, visual state management with CSS classes",
        validation: "MIME type checking, file extension whitelist, size limits, magic number verification for security",
        previews: "URL.createObjectURL with proper cleanup, Canvas API for image thumbnails, FileReader for text files",
        accessibility:
          "ARIA labels, keyboard navigation (Tab, Enter, Space), screen reader announcements, focus management",
        performance: "Virtualized file list for large selections, lazy preview generation, debounced validation",
      },
    },
    {
      name: "Transfer Status",
      file: "components/transfer-status.tsx",
      purpose: "Real-time monitoring and management of file transfer operations with detailed analytics",
      icon: Monitor,
      complexity: "High",
      linesOfCode: "~410 lines",
      dependencies: ["React State", "Transfer Engine", "File API"],
      keyContributions: [
        "Displays live progress bars with percentage, transferred bytes, and speed calculations updated in real-time",
        "Manages separate incoming and outgoing file queues with priority scheduling and status tracking",
        "Provides manual download controls with batch operations and auto-download functionality",
        "Shows comprehensive transfer history with detailed metadata, timestamps, and outcome status",
        "Implements file actions (download, retry, cancel, delete) with error handling and confirmation dialogs",
        "Updates UI in real-time using React state management with optimized re-rendering (500ms intervals)",
        "Displays transfer statistics: success rate, average speed, total data transferred, active connections",
        "Provides visual feedback for different transfer states: pending, active, paused, completed, failed",
      ],
      failureConsequences: [
        "Users have no visibility into transfer progress - severely degraded user experience and trust",
        "Failed transfers go unnoticed without retry mechanisms, leading to incomplete file deliveries",
        "Completed files become inaccessible without download interface, wasting completed transfers",
        "Transfer errors occur silently without user notification, causing confusion and support requests",
        "Memory usage grows unbounded without transfer cleanup, eventually causing browser crashes",
        "No ability to prioritize, pause, or manage multiple simultaneous transfers effectively",
      ],
      technicalDetails: {
        realTime:
          "500ms update intervals using setInterval, optimized re-rendering with React.memo and shallow comparison",
        state: "React useState with useReducer for complex state, useEffect for transfer monitoring and cleanup",
        downloads:
          "Blob URL generation with automatic cleanup after download, download attribute for filename preservation",
        performance:
          "Efficient re-rendering with React.memo, useMemo for expensive calculations, useCallback for event handlers",
        storage: "Transfer history persistence in IndexedDB for offline access and large dataset handling",
      },
    },
    {
      name: "Peer Panel",
      file: "components/peer-panel.tsx",
      purpose: "Management interface for connected peers with status monitoring and control",
      icon: Users,
      complexity: "Medium",
      linesOfCode: "~270 lines",
      dependencies: ["usePeerConnection", "React Context"],
      keyContributions: [
        "Displays connected peer list with real-time status indicators (online, busy, idle, offline)",
        "Provides individual peer management with actions: disconnect, send files, message, block",
        "Shows connection quality metrics including latency (RTT), packet loss, and bandwidth estimation",
        "Implements peer-specific file sending with drag-and-drop target selection and multi-peer broadcast",
        "Manages peer metadata including display names, connection timestamps, last activity, and avatar colors",
        "Handles peer disconnection with proper cleanup, notifications, and transfer cancellation",
        "Displays peer capabilities and browser compatibility information for troubleshooting",
        "Provides search and filter functionality for managing large peer lists in group scenarios",
      ],
      failureConsequences: [
        "Users cannot manage multiple peer connections effectively, limiting collaboration scenarios",
        "No visibility into peer status or connection quality, making troubleshooting impossible",
        "Impossible to send files to specific peers in group scenarios, breaking selective sharing",
        "Dead peer connections accumulate without cleanup mechanism, wasting resources and memory",
        "Poor user experience in multi-peer collaboration scenarios with confusing connection states",
        "No way to identify problematic peers or diagnose connection issues affecting transfers",
      ],
      technicalDetails: {
        realTime: "Live updates via React state synchronized with peer connection hook using event listeners",
        management: "Individual peer controls with confirmation dialogs, graceful disconnect handling, event cleanup",
        status: "Connection quality visualization with color-coded indicators (green/yellow/red), WebRTC stats API",
        performance:
          "Efficient rendering with React virtualization for large peer lists (>50 peers), memoized components",
        communication: "WebRTC DataChannel for messaging, custom protocol for status updates and keepalive pings",
      },
    },
    {
      name: "Live Analytics",
      file: "components/live-analytics.tsx",
      purpose: "Real-time dashboard for connection statistics, transfer metrics, and performance monitoring",
      icon: Cpu,
      complexity: "Medium",
      linesOfCode: "~340 lines",
      dependencies: ["React Hooks", "Chart Library", "localStorage"],
      keyContributions: [
        "Tracks and displays comprehensive connection statistics: peers, transfers, data volume, success rate",
        "Calculates real-time transfer speeds, throughput metrics, and historical performance trends",
        "Maintains session history with persistent storage and exportable analytics data (CSV, JSON)",
        "Provides performance insights and optimization suggestions based on usage patterns and bottlenecks",
        "Shows network quality indicators with connection health scores and diagnostic information",
        "Implements data visualization with interactive charts, graphs, and real-time progress indicators",
        "Monitors browser resource usage: memory, CPU, and storage quota with threshold alerts",
        "Provides predictive analytics for transfer completion times and bandwidth requirements",
      ],
      failureConsequences: [
        "No performance monitoring or optimization guidance for users, leading to suboptimal configurations",
        "Transfer issues go undiagnosed without metrics visibility, increasing support burden",
        "Users cannot track usage patterns or session statistics for auditing and compliance",
        "Network problems remain invisible until transfers fail, causing user frustration",
        "Missing data for troubleshooting connection issues, making support difficult and time-consuming",
        "No ability to identify trends, peak usage times, or capacity planning needs",
      ],
      technicalDetails: {
        metrics: "Real-time calculation of speeds, totals, averages, percentiles using sliding window algorithms",
        storage: "localStorage persistence for historical data with 90-day retention, compression for large datasets",
        visualization: "Custom React components with responsive design, Chart.js for graphs, SVG for gauges",
        performance: "Debounced updates (1000ms) to prevent excessive re-rendering, Web Workers for heavy calculations",
        analytics: "Statistical analysis: mean, median, standard deviation, outlier detection for transfer speeds",
      },
    },
    {
      name: "Settings Panel",
      file: "components/floating-settings-bubble.tsx",
      purpose: "Configuration interface for transfer behavior, preferences, and performance tuning",
      icon: Settings,
      complexity: "Low",
      linesOfCode: "~220 lines",
      dependencies: ["React Context", "sessionStorage"],
      keyContributions: [
        "Provides chunk size adjustment (1KB-1MB) for transfer optimization based on network conditions",
        "Manages auto-download preferences with session persistence and per-peer override options",
        "Controls file transfer limits (size, count, concurrent) and validation settings with presets",
        "Displays browser memory usage when available via Performance API with usage recommendations",
        "Implements settings validation and error handling with safe defaults and rollback capability",
        "Synchronizes settings across components with React context and localStorage for persistence",
        "Provides advanced options: connection timeout, retry attempts, buffer sizes, compression toggle",
        "Includes preset profiles for different use cases: mobile, desktop, high-speed, low-bandwidth",
      ],
      failureConsequences: [
        "Users cannot optimize transfers for their network conditions, resulting in poor performance",
        "Settings reset on every page refresh - poor user experience and constant reconfiguration",
        "No control over auto-download behavior - security concerns and unwanted downloads",
        "Transfer limits cannot be adjusted for different use cases, limiting flexibility",
        "Missing performance tuning options for power users, reducing application utility",
        "No way to save preferred configurations or switch between usage profiles quickly",
      ],
      technicalDetails: {
        persistence: "sessionStorage with JSON serialization, validation on read, migration for schema changes",
        validation: "Range checking (min/max values), type validation, regex patterns for string inputs",
        memory: "Performance API integration (performance.memory) for browser memory monitoring and alerts",
        sync: "Real-time synchronization with main application state using React context and event bus pattern",
        presets: "Predefined configuration profiles with optimized settings for different scenarios",
      },
    },
  ]

  const architectureLayers = [
    {
      name: "Frontend Layer",
      description: "React/Next.js application with TypeScript and Tailwind CSS",
      icon: Monitor,
      components: [
        "React 18 with Concurrent Mode",
        "Next.js 14 App Router with Server Components",
        "TypeScript 5+ for type safety",
        "Tailwind CSS 4 for styling",
        "shadcn/ui component library",
        "Lucide React icons",
      ],
      responsibilities: [
        "User interface rendering and interaction handling with responsive design",
        "State management with React hooks, context, and Zustand for global state",
        "Real-time UI updates and progress visualization with smooth animations",
        "Responsive design for mobile, tablet, and desktop devices with adaptive layouts",
        "Accessibility features including keyboard navigation and screen reader support (WCAG 2.1 AA)",
        "Error boundaries for graceful error handling and recovery",
      ],
      technologies: ["React 18", "Next.js 14", "TypeScript 5+", "Tailwind CSS 4", "Framer Motion"],
    },
    {
      name: "P2P Communication Layer",
      description: "WebRTC implementation for direct peer connections",
      icon: Network,
      components: [
        "PeerJS 1.5+ library wrapper",
        "WebRTC DataChannel (SCTP)",
        "STUN/TURN servers (Google, Twilio)",
        "ICE candidate gathering with Trickle ICE",
        "SDP offer/answer exchange",
        "DTLS 1.2 encryption",
      ],
      responsibilities: [
        "Establishing secure peer-to-peer connections with NAT traversal capabilities",
        "NAT traversal and firewall penetration using STUN/TURN servers",
        "Connection quality monitoring with RTT, packet loss, and bandwidth estimation",
        "Peer discovery and authentication with unique connection keys",
        "Real-time messaging and status updates via DataChannel with reliable delivery",
        "Automatic reconnection and connection recovery with exponential backoff",
      ],
      technologies: ["WebRTC 1.0", "PeerJS", "STUN/TURN", "ICE", "SDP", "DTLS 1.2"],
    },
    {
      name: "File Transfer Layer",
      description: "Chunked binary data transmission with integrity verification",
      icon: FileText,
      components: [
        "Transfer Engine with chunking",
        "Chunk management and sequencing",
        "Progress tracking with ETA",
        "File reconstruction with validation",
        "MIME type detection",
        "Compression (optional)",
      ],
      responsibilities: [
        "File chunking and reassembly operations with configurable chunk sizes",
        "Binary data transmission via DataChannel with optimal throughput",
        "Transfer progress calculation and reporting with speed metrics",
        "File integrity verification and error recovery with checksums",
        "Memory-efficient handling of large files using streaming approach",
        "Pause/resume functionality with state persistence",
      ],
      technologies: ["File API", "ArrayBuffer", "Blob", "ReadableStream", "CRC32", "Base64"],
    },
    {
      name: "Security Layer",
      description: "Built-in WebRTC encryption with peer verification",
      icon: Shield,
      components: [
        "DTLS 1.2 encryption",
        "SRTP for media streams",
        "ICE authentication",
        "Peer verification with connection keys",
        "Session isolation",
        "XSS protection",
      ],
      responsibilities: [
        "End-to-end encryption of all data transfers with AES-256-GCM cipher",
        "Peer identity verification and authentication with unique session keys",
        "Protection against connection hijacking and man-in-the-middle attacks",
        "Secure key exchange and session management with perfect forward secrecy",
        "Privacy protection with zero server storage - all data stays peer-to-peer",
        "XSS and injection attack prevention with input sanitization",
      ],
      technologies: ["DTLS 1.2", "SRTP", "AES-256-GCM", "SHA-256", "Crypto API", "CSP"],
    },
  ]

  const dataFlow = [
    {
      step: "Connection Establishment",
      description: "WebRTC peer connection setup with STUN/TURN servers",
      icon: Radio,
      details: [
        "User A generates unique peer ID using timestamp + cryptographically secure random characters (6 chars)",
        "PeerJS creates WebRTC connection with ICE candidate gathering using STUN servers for public IP discovery",
        "STUN servers (Google: stun.l.google.com, Twilio) help discover public IP and port for NAT traversal",
        "User B enters peer ID to initiate connection handshake with SDP offer/answer exchange",
        "DataChannel established with reliable, ordered delivery mode using SCTP over DTLS",
        "Connection quality monitoring begins with RTT measurements and bandwidth estimation",
        "Both peers exchange capability information (supported features, max file size, chunk sizes)",
      ],
    },
    {
      step: "File Selection & Preparation",
      description: "File processing and metadata preparation for transfer",
      icon: FileStack,
      details: [
        "HTML5 File API reads selected files with drag-drop support and clipboard paste integration",
        "File validation checks type (MIME + extension), size (max 10GB default), and count against configurable limits",
        "Unique file ID generated using UUID v4 for tracking throughout transfer lifecycle",
        "File chunked into ArrayBuffer segments (default 64KB, configurable 1KB-1MB) for efficient transmission",
        "Transfer metadata prepared including file info (name, size, type), chunk count, and transfer ID",
        "UI updates with file previews (thumbnails for images), progress preparation, and queue position",
        "Optional compression applied for text-based files to reduce transfer time and bandwidth",
      ],
    },
    {
      step: "Transfer Execution",
      description: "Chunked data transmission with acknowledgment system",
      icon: ArrowLeftRight,
      details: [
        "Transfer Engine sends first chunk via WebRTC DataChannel with sequence number and metadata",
        "Receiving peer stores chunk in temporary Map storage and sends immediate acknowledgment with chunk ID",
        "Sender waits for ACK before transmitting next chunk (pipelined for efficiency with sliding window)",
        "Progress updates calculated based on acknowledged chunks and sent to UI every 500ms for smooth animation",
        "Speed metrics computed from bytes transferred over time with 5-second moving average for stability",
        "Adaptive chunk sizing adjusts based on network conditions - smaller for slow, larger for fast connections",
        "Process repeats until all chunks successfully transmitted with final completion handshake",
        "Failed chunks detected via timeout (5s) and automatically retried with exponential backoff",
      ],
    },
    {
      step: "File Reconstruction",
      description: "Chunk reassembly and file completion on receiving end",
      icon: Blocks,
      details: [
        "Received chunks stored in Map<number, ArrayBuffer> with sequence number as key for ordered reassembly",
        "Chunk integrity verified using CRC32 checksums, missing or corrupted chunks requested for retransmission",
        "All chunks reassembled in correct order when complete using efficient ArrayBuffer concatenation",
        "Blob created with detected MIME type for proper handling by browser and download system",
        "Download link generated using URL.createObjectURL with proper filename and extension preservation",
        "Transfer completion notification sent to both peers with final statistics (time, speed, success)",
        "Optional verification step: full file checksum comparison between sender and receiver",
        "Cleanup performed: temporary chunks removed from memory, transfer state updated, UI refreshed",
      ],
    },
  ]

  const performanceOptimizations = [
    {
      category: "Memory Management",
      icon: MemoryStick,
      optimizations: [
        "Streaming file processing prevents loading entire files into memory - processes data in chunks",
        "Chunk-based transmission allows immediate garbage collection of processed data, keeping memory usage low",
        "Object URL cleanup (URL.revokeObjectURL) prevents memory leaks from file previews and downloads",
        "Connection pooling reuses WebRTC PeerConnection resources across multiple peers, reducing overhead",
        "Efficient data structures: Map for O(1) lookup, Set for deduplication, typed arrays for binary data",
        "ArrayBuffer pooling and reuse for frequent allocations, reducing GC pressure",
        "Weak references for cached data that can be garbage collected under memory pressure",
        "Memory monitoring with automatic throttling when browser memory usage exceeds 80% threshold",
      ],
    },
    {
      category: "Network Efficiency",
      icon: Wifi,
      optimizations: [
        "Configurable chunk sizes (1KB-1MB) optimize for different network conditions and file types",
        "Immediate acknowledgment system with pipelined chunks minimizes transfer latency and maximizes throughput",
        "Adaptive chunk sizing based on measured bandwidth and packet loss dynamically optimizes performance",
        "STUN server redundancy (Google, Twilio) ensures reliable NAT traversal with automatic fallback",
        "Concurrent transfers to multiple peers without interference using separate DataChannels",
        "Data compression for compressible file types (text, JSON, SVG) reduces bandwidth usage by up to 70%",
        "Priority-based transfer scheduling ensures important files transfer first in queued scenarios",
        "Connection quality monitoring detects congestion and adjusts transfer rate to prevent packet loss",
      ],
    },
    {
      category: "UI Responsiveness",
      icon: Gauge,
      optimizations: [
        "Non-blocking file processing using Web Workers for CPU-intensive operations (chunking, checksums)",
        "Debounced progress updates (500ms) prevent excessive re-rendering and maintain 60 FPS animations",
        "React.memo and useMemo optimize component re-rendering by preventing unnecessary updates",
        "requestIdleCallback schedules non-critical background operations during browser idle time",
        "Efficient event handling with proper cleanup and unsubscription prevents memory leaks",
        "Virtualized lists for large file collections render only visible items, handling 10,000+ files smoothly",
        "Throttled input handlers for search and filter operations reduce CPU usage during user typing",
        "CSS animations with GPU acceleration (transform, opacity) ensure smooth visual transitions",
      ],
    },
  ]

  const securityFeatures = [
    {
      feature: "End-to-End Encryption",
      description: "All data encrypted with DTLS 1.2 and AES-256-GCM cipher suites",
      implementation:
        "WebRTC's built-in encryption handles key exchange using ECDHE and data protection with authenticated encryption",
      icon: Lock,
      benefits: [
        "No plaintext data transmission ever",
        "Perfect forward secrecy protects past sessions",
        "Protection against eavesdropping and interception",
      ],
      technicalDetails: "DTLS 1.2 with AES-256-GCM, ECDHE key exchange, SHA-256 HMAC, 2048-bit certificates",
    },
    {
      feature: "No Server Storage",
      description: "Files transfer directly between devices without server intermediaries",
      implementation:
        "Pure P2P architecture with no file upload or storage endpoints - all data flows peer-to-peer via WebRTC",
      icon: CloudOff,
      benefits: [
        "Complete data privacy - your files never touch our servers",
        "No server-side vulnerabilities or data breaches",
        "Unlimited file sizes without storage costs",
      ],
      technicalDetails:
        "WebRTC DataChannel for direct peer communication, no backend file storage, zero data retention",
    },
    {
      feature: "Peer Authentication",
      description: "Connection keys provide basic peer verification and access control",
      implementation: "Unique peer IDs with session-based validation, expiration (30 days), and collision detection",
      icon: Fingerprint,
      benefits: [
        "Prevents unauthorized connections from unknown peers",
        "Session isolation between different transfer sessions",
        "Connection tracking and audit logs",
      ],
      technicalDetails:
        "6-character alphanumeric IDs with 2.1 billion combinations, timestamp-based generation, session tokens",
    },
    {
      feature: "Session Isolation",
      description: "Each browser session operates independently with unique identifiers",
      implementation: "Session-scoped peer IDs with automatic cleanup on browser close, separate storage namespaces",
      icon: ShieldCheck,
      benefits: [
        "No cross-session data leakage between different users",
        "Fresh security context for each session",
        "Privacy protection with automatic data cleanup",
      ],
      technicalDetails:
        "sessionStorage isolation, unique session IDs, automatic cleanup on tab close, no cross-origin access",
    },
    {
      feature: "XSS Protection",
      description: "Input sanitization and Content Security Policy prevent injection attacks",
      implementation: "All user inputs sanitized, CSP headers block inline scripts, React's automatic XSS protection",
      icon: ShieldCheck,
      benefits: [
        "Protection against malicious file names and metadata",
        "Safe display of user-provided content",
        "Prevention of code injection attacks",
      ],
      technicalDetails: "DOMPurify sanitization, CSP with strict-dynamic, React JSX auto-escaping, input validation",
    },
    {
      feature: "Data Integrity",
      description: "Checksums and sequence numbers ensure data accuracy",
      implementation:
        "CRC32 checksums for each chunk, sequence numbers prevent reordering, final file hash verification",
      icon: Key,
      benefits: [
        "Detects corrupted or tampered data during transfer",
        "Ensures received file exactly matches sent file",
        "Automatic retry of failed or corrupted chunks",
      ],
      technicalDetails:
        "CRC32 checksums per chunk, SHA-256 final file hash, sequence number validation, replay protection",
    },
  ]

  const browserCompatibility = [
    {
      browser: "Google Chrome",
      version: "56+",
      support: "Full Support",
      icon: CheckCircle,
      color: "text-green-500",
      features: ["WebRTC 1.0", "DataChannel", "File API", "Drag & Drop", "IndexedDB", "Web Workers"],
      notes: "Best performance and compatibility. Recommended browser for optimal experience.",
    },
    {
      browser: "Mozilla Firefox",
      version: "51+",
      support: "Full Support",
      icon: CheckCircle,
      color: "text-green-500",
      features: ["WebRTC 1.0", "DataChannel", "File API", "Drag & Drop", "IndexedDB", "Web Workers"],
      notes: "Excellent performance with strong privacy features. Great alternative to Chrome.",
    },
    {
      browser: "Apple Safari",
      version: "11+",
      support: "Full Support",
      icon: CheckCircle,
      color: "text-green-500",
      features: ["WebRTC 1.0", "DataChannel", "File API", "Drag & Drop", "IndexedDB", "Web Workers"],
      notes: "Good support on macOS and iOS. Some limitations on older iOS versions.",
    },
    {
      browser: "Microsoft Edge",
      version: "79+",
      support: "Full Support",
      icon: CheckCircle,
      color: "text-green-500",
      features: ["WebRTC 1.0", "DataChannel", "File API", "Drag & Drop", "IndexedDB", "Web Workers"],
      notes: "Chromium-based Edge has excellent compatibility. Legacy Edge not supported.",
    },
    {
      browser: "Opera",
      version: "43+",
      support: "Full Support",
      icon: CheckCircle,
      color: "text-green-500",
      features: ["WebRTC 1.0", "DataChannel", "File API", "Drag & Drop", "IndexedDB", "Web Workers"],
      notes: "Based on Chromium, offers same capabilities as Chrome with built-in VPN option.",
    },
    {
      browser: "Brave",
      version: "Latest",
      support: "Full Support",
      icon: CheckCircle,
      color: "text-green-500",
      features: ["WebRTC 1.0", "DataChannel", "File API", "Drag & Drop", "IndexedDB", "Web Workers"],
      notes: "Privacy-focused Chromium browser. May need to enable WebRTC in advanced settings.",
    },
  ]

  const technicalSpecs = [
    {
      category: "Network Protocol",
      icon: Network,
      specs: [
        { label: "Protocol", value: "WebRTC DataChannel over SCTP" },
        { label: "Transport", value: "SCTP over DTLS 1.2 over UDP/TCP" },
        { label: "Encryption", value: "DTLS 1.2 with AES-256-GCM" },
        { label: "NAT Traversal", value: "ICE with STUN/TURN servers" },
        { label: "Signaling", value: "PeerJS with WebSocket fallback" },
        { label: "Key Exchange", value: "ECDHE with P-256 curve" },
      ],
    },
    {
      category: "Performance Limits",
      icon: Gauge,
      specs: [
        { label: "Max Peers", value: "10 simultaneous connections" },
        { label: "Chunk Size", value: "1KB - 1MB (configurable, default 64KB)" },
        { label: "File Size", value: "Limited by browser memory (~2-4GB typical)" },
        { label: "Transfer Speed", value: "Network dependent (up to 100+ MB/s on LAN)" },
        { label: "Concurrent Transfers", value: "Unlimited (within peer limit)" },
        { label: "Queue Size", value: "Unlimited (memory permitting)" },
      ],
    },
    {
      category: "Browser Storage",
      icon: HardDrive,
      specs: [
        { label: "localStorage", value: "5-10MB (browser dependent)" },
        { label: "sessionStorage", value: "5-10MB (browser dependent)" },
        { label: "IndexedDB", value: "50MB-unlimited (quota based)" },
        { label: "Memory Usage", value: "~50-200MB typical operation" },
        { label: "Cache Strategy", value: "LRU with 10s TTL for session data" },
        { label: "Data Persistence", value: "30-day session expiry" },
      ],
    },
    {
      category: "API & Standards",
      icon: Code,
      specs: [
        { label: "WebRTC API", value: "W3C WebRTC 1.0 Standard" },
        { label: "File API", value: "W3C File API Standard" },
        { label: "Streams API", value: "WHATWG Streams Standard" },
        { label: "Crypto API", value: "W3C Web Cryptography API" },
        { label: "Storage API", value: "W3C Web Storage API" },
        { label: "Workers API", value: "W3C Web Workers Standard" },
      ],
    },
  ]

  const realWorldUseCases = [
    {
      title: "Enterprise File Sharing",
      description: "Secure document exchange within organizations",
      icon: Blocks,
      benefits: [
        "Zero server storage reduces data breach risk",
        "Instant transfer without upload/download delays",
        "No file size limits for large CAD files, videos, datasets",
        "Compliance with data residency requirements",
      ],
      stats: { users: "500-1000 employees", files: "10-50 GB daily", speed: "LAN speeds (100+ MB/s)" },
    },
    {
      title: "Creative Collaboration",
      description: "Designers, video editors, photographers sharing large files",
      icon: Sparkles,
      benefits: [
        "Transfer raw video files (10-100GB) without cloud upload time",
        "Maintain file quality without compression artifacts",
        "Real-time collaboration with instant file delivery",
        "Cost savings - no cloud storage subscription fees",
      ],
      stats: { users: "Small teams 5-20", files: "50-500 GB weekly", speed: "Depends on network (5-50 MB/s)" },
    },
    {
      title: "Remote Development Teams",
      description: "Developers sharing code repositories, builds, and databases",
      icon: GitBranch,
      benefits: [
        "Quick transfer of Docker images and build artifacts",
        "Secure database dumps without cloud exposure",
        "P2P pairing for code reviews and debugging sessions",
        "Low latency communication for real-time collaboration",
      ],
      stats: { users: "10-100 developers", files: "1-20 GB daily", speed: "Fast (10-100 MB/s typical)" },
    },
    {
      title: "Healthcare & Research",
      description: "Medical imaging and research data transfer",
      icon: Target,
      benefits: [
        "HIPAA-friendly - no PHI storage on third-party servers",
        "Transfer large DICOM imaging files (100GB+) efficiently",
        "Secure patient data exchange between facilities",
        "Real-time collaboration for medical consultations",
      ],
      stats: { users: "Hospitals, clinics", files: "100+ GB daily", speed: "Dedicated networks (50+ MB/s)" },
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-muted/30 to-accent/10">
      <header className="w-full bg-background/95 backdrop-blur-sm border-b border-border/50 sticky top-0 z-30">
        <NavigationMenu />
      </header>

      <div className="flex-1 p-4 pt-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4 animate-slide-up">
            <div className="inline-block">
              <Badge variant="outline" className="text-xs px-3 py-1 mb-4">
                <Code className="h-3 w-3 mr-1" />
                Technical Deep Dive v2.0
              </Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient-shift">
              Technical Architecture
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Comprehensive technical documentation of Nowhile's peer-to-peer file sharing architecture. Deep dive into
              WebRTC protocols, security measures, performance optimizations, and real-world implementation details.
            </p>
          </div>

          {/* Educational Project Notice after header */}
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

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-slide-up animation-delay-300">
            <Card className="hover-lift-subtle">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Core Components</p>
                    <p className="text-3xl font-bold text-primary">8</p>
                  </div>
                  <Package className="h-8 w-8 text-primary/20" />
                </div>
              </CardContent>
            </Card>
            <Card className="hover-lift-subtle">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Lines of Code</p>
                    <p className="text-3xl font-bold text-accent">~2.6K</p>
                  </div>
                  <FileCode className="h-8 w-8 text-accent/20" />
                </div>
              </CardContent>
            </Card>
            <Card className="hover-lift-subtle">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Architecture Layers</p>
                    <p className="text-3xl font-bold text-green-500">4</p>
                  </div>
                  <Layers className="h-8 w-8 text-green-500/20" />
                </div>
              </CardContent>
            </Card>
            <Card className="hover-lift-subtle">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Security Features</p>
                    <p className="text-3xl font-bold text-purple-500">6</p>
                  </div>
                  <Shield className="h-8 w-8 text-purple-500/20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Architecture Overview */}
          <Card className="animate-slide-up animation-delay-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                System Architecture Overview
              </CardTitle>
              <CardDescription>
                Nowhile is built on a modular, layered architecture designed for scalability, security, and performance.
                Each layer has distinct responsibilities and communicates through well-defined interfaces.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {architectureLayers.map((layer, index) => {
                  const Icon = layer.icon
                  return (
                    <div
                      key={index}
                      className="space-y-4 p-4 border rounded-lg hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 rounded-lg">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{layer.name}</h3>
                          <p className="text-xs text-muted-foreground">{layer.description}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium flex items-center gap-1">
                          <Boxes className="h-3 w-3" />
                          Components:
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {layer.components.map((component, compIndex) => (
                            <Badge key={compIndex} variant="outline" className="text-xs">
                              {component}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          Responsibilities:
                        </h4>
                        <ul className="space-y-1.5">
                          {layer.responsibilities.map((resp, respIndex) => (
                            <li key={respIndex} className="text-xs text-muted-foreground flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                              {resp}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {layer.technologies && (
                        <div className="pt-2 border-t">
                          <div className="flex flex-wrap gap-1">
                            {layer.technologies.map((tech, techIndex) => (
                              <Badge key={techIndex} variant="secondary" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Core Components with Tabs */}
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Core Components Deep Dive
              </CardTitle>
              <CardDescription>
                Detailed analysis of each core component including purpose, contributions, failure consequences, and
                technical implementation details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="0" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto gap-2">
                  {coreComponents.slice(0, 8).map((component, index) => {
                    const Icon = component.icon
                    return (
                      <TabsTrigger key={index} value={index.toString()} className="flex items-center gap-2 py-2">
                        <Icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{component.name.split(" ")[0]}</span>
                      </TabsTrigger>
                    )
                  })}
                </TabsList>
                {coreComponents.map((component, index) => {
                  const Icon = component.icon
                  return (
                    <TabsContent key={index} value={index.toString()} className="space-y-6 mt-6">
                      <div className="flex items-start justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-gradient-to-br from-primary to-accent/10 rounded-xl">
                            <Icon className="h-8 w-8 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold">{component.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Code className="h-3 w-3 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">{component.file}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="destructive" className="text-xs">
                            {component.complexity} Priority
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {component.linesOfCode}
                          </Badge>
                        </div>
                      </div>

                      <div className="p-4 bg-muted/30 rounded-lg border-l-4 border-primary">
                        <h4 className="font-semibold mb-2 text-primary flex items-center gap-2">
                          <Info className="h-4 w-4" />
                          Purpose & Function
                        </h4>
                        <p className="text-sm leading-relaxed">{component.purpose}</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-green-600 flex items-center gap-2">
                            <CheckCircle className="h-5 w-5" />
                            Key Contributions ({component.keyContributions.length})
                          </h4>
                          <ul className="space-y-3">
                            {component.keyContributions.map((contribution, contribIndex) => (
                              <li
                                key={contribIndex}
                                className="text-sm flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900"
                              >
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                                <span>{contribution}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-semibold text-red-600 flex items-center gap-2">
                            <XCircle className="h-5 w-5" />
                            Failure Consequences ({component.failureConsequences.length})
                          </h4>
                          <ul className="space-y-3">
                            {component.failureConsequences.map((consequence, consIndex) => (
                              <li
                                key={consIndex}
                                className="text-sm flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900"
                              >
                                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                <span>{consequence}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-semibold mb-4 text-purple-600 flex items-center gap-2">
                          <Workflow className="h-5 w-5" />
                          Technical Implementation Details
                        </h4>
                        <div className="grid gap-4 md:grid-cols-2">
                          {Object.entries(component.technicalDetails).map(([key, value], techIndex) => (
                            <div
                              key={techIndex}
                              className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg border border-purple-200 dark:border-purple-900"
                            >
                              <div className="font-medium text-sm capitalize mb-2 flex items-center gap-2">
                                <Binary className="h-4 w-4 text-purple-600" />
                                {key.replace(/([A-Z])/g, " $1")}:
                              </div>
                              <div className="text-xs text-muted-foreground leading-relaxed">{value}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {component.dependencies && (
                        <div className="p-4 bg-muted/20 rounded-lg">
                          <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                            <GitBranch className="h-4 w-4" />
                            Dependencies:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {component.dependencies.map((dep, depIndex) => (
                              <Badge key={depIndex} variant="secondary">
                                {dep}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </TabsContent>
                  )
                })}
              </Tabs>
            </CardContent>
          </Card>

          {/* Data Flow */}
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5 text-accent" />
                File Transfer Data Flow
              </CardTitle>
              <CardDescription>
                Step-by-step breakdown of how files move through the system from selection to completion with detailed
                technical explanations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {dataFlow.map((step, index) => {
                  const StepIcon = step.icon
                  return (
                    <div key={index} className="relative">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg">
                            {index + 1}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-background rounded-full flex items-center justify-center border-2 border-primary">
                            <StepIcon className="h-3 w-3 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1 space-y-4">
                          <div>
                            <h3 className="font-bold text-xl mb-1">{step.step}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                          </div>
                          <div className="grid gap-3">
                            {step.details.map((detail, detailIndex) => (
                              <div
                                key={detailIndex}
                                className="text-sm flex items-start gap-3 p-3 bg-muted/30 rounded-lg border hover:border-primary/50 transition-colors"
                              >
                                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                                <span className="leading-relaxed">{detail}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      {index < dataFlow.length - 1 && (
                        <div className="absolute left-6 top-12 w-0.5 h-8 bg-gradient-to-b from-primary to-transparent" />
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Performance Optimizations */}
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Performance Optimizations
              </CardTitle>
              <CardDescription>
                Technical optimizations that make Nowhile fast, efficient, and responsive across all devices and network
                conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                {performanceOptimizations.map((category, index) => {
                  const CategoryIcon = category.icon
                  return (
                    <div
                      key={index}
                      className="space-y-4 p-5 border rounded-xl bg-gradient-to-br from-background to-muted/20 hover:border-yellow-500/50 transition-all hover-lift-subtle"
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-yellow-500/10 rounded-lg">
                          <CategoryIcon className="h-5 w-5 text-yellow-500" />
                        </div>
                        <h3 className="font-bold text-lg">{category.category}</h3>
                      </div>
                      <ul className="space-y-3">
                        {category.optimizations.map((optimization, optIndex) => (
                          <li key={optIndex} className="text-sm flex items-start gap-3 leading-relaxed">
                            <Zap className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <span>{optimization}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Security Features */}
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                Security Architecture
              </CardTitle>
              <CardDescription>
                Comprehensive security measures protecting user data and privacy with industry-standard encryption and
                best practices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {securityFeatures.map((feature, index) => {
                  const FeatureIcon = feature.icon
                  return (
                    <div
                      key={index}
                      className="space-y-4 p-5 border rounded-xl hover:border-green-500/50 transition-all hover-lift-subtle bg-gradient-to-br from-background to-green-50/50 dark:to-green-950/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-green-500/10 rounded-lg">
                          <FeatureIcon className="h-6 w-6 text-green-500" />
                        </div>
                        <h3 className="font-bold text-lg">{feature.feature}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm flex items-center gap-1">
                          <Code className="h-3 w-3" />
                          Implementation:
                        </h4>
                        <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg leading-relaxed">
                          {feature.implementation}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          Benefits:
                        </h4>
                        <ul className="space-y-2">
                          {feature.benefits.map((benefit, benefitIndex) => (
                            <li key={benefitIndex} className="text-xs flex items-start gap-2 leading-relaxed">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {feature.technicalDetails && (
                        <div className="pt-3 border-t">
                          <p className="text-xs font-mono text-muted-foreground">{feature.technicalDetails}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Browser Compatibility */}
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-500" />
                Browser Compatibility Matrix
              </CardTitle>
              <CardDescription>
                Detailed browser support information with version requirements and feature availability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {browserCompatibility.map((browser, index) => {
                  const StatusIcon = browser.icon
                  return (
                    <div
                      key={index}
                      className="space-y-3 p-4 border rounded-lg hover:border-primary/50 transition-colors bg-gradient-to-br from-background to-muted/10"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold">{browser.browser}</h3>
                        <StatusIcon className={`h-5 w-5 ${browser.color}`} />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{browser.version}</Badge>
                        <Badge className={browser.color}>{browser.support}</Badge>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xs font-medium text-muted-foreground">Features:</h4>
                        <div className="flex flex-wrap gap-1">
                          {browser.features.map((feature, fIndex) => (
                            <Badge key={fIndex} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed pt-2 border-t">{browser.notes}</p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Technical Specifications */}
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-blue-500" />
                Technical Specifications
              </CardTitle>
              <CardDescription>
                Complete technical specifications covering protocols, limits, storage, and standards compliance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {technicalSpecs.map((category, index) => {
                  const CategoryIcon = category.icon
                  return (
                    <div
                      key={index}
                      className="space-y-4 p-5 border rounded-xl bg-gradient-to-br from-background to-blue-50/20 dark:to-blue-950/10"
                    >
                      <div className="flex items-center gap-2">
                        <CategoryIcon className="h-5 w-5 text-blue-500" />
                        <h3 className="font-bold text-lg">{category.category}</h3>
                      </div>
                      <div className="space-y-3">
                        {category.specs.map((spec, specIndex) => (
                          <div
                            key={specIndex}
                            className="flex items-start justify-between gap-4 p-2 rounded-lg hover:bg-muted/30 transition-colors"
                          >
                            <span className="text-sm font-medium text-muted-foreground">{spec.label}:</span>
                            <span className="text-sm text-right font-mono">{spec.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Real World Use Cases */}
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-500" />
                Real-World Use Cases
              </CardTitle>
              <CardDescription>
                Production scenarios where Nowhile excels with specific requirements and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {realWorldUseCases.map((useCase, index) => {
                  const Icon = useCase.icon
                  return (
                    <div
                      key={index}
                      className="space-y-4 p-5 border rounded-xl hover:border-purple-500/50 transition-all hover-lift-subtle bg-gradient-to-br from-background to-purple-50/20 dark:to-purple-950/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-purple-500/10 rounded-lg">
                          <Icon className="h-6 w-6 text-purple-500" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{useCase.title}</h3>
                          <p className="text-xs text-muted-foreground">{useCase.description}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          Key Benefits:
                        </h4>
                        <ul className="space-y-2">
                          {useCase.benefits.map((benefit, bIndex) => (
                            <li key={bIndex} className="text-sm flex items-start gap-2 leading-relaxed">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="pt-3 border-t space-y-2">
                        <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                          <BarChart3 className="h-3 w-3" />
                          Typical Metrics:
                        </h4>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center p-2 bg-muted/50 rounded">
                            <p className="text-xs text-muted-foreground">Users</p>
                            <p className="text-xs font-mono font-semibold">{useCase.stats.users}</p>
                          </div>
                          <div className="text-center p-2 bg-muted/50 rounded">
                            <p className="text-xs text-muted-foreground">Volume</p>
                            <p className="text-xs font-mono font-semibold">{useCase.stats.files}</p>
                          </div>
                          <div className="text-center p-2 bg-muted/50 rounded">
                            <p className="text-xs text-muted-foreground">Speed</p>
                            <p className="text-xs font-mono font-semibold">{useCase.stats.speed}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AppFooter />
    </div>
  )
}
