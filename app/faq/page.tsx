"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  HelpCircle,
  Shield,
  Zap,
  AlertCircle,
  CheckCircle,
  Info,
  Settings,
  Lock,
  Database,
  Activity,
  Layers,
  Code,
  AlertTriangle,
  Boxes,
} from "lucide-react"
import { NavigationMenu } from "@/components/navigation-menu"
import { AppFooter } from "@/components/app-footer"

export default function FAQPage() {
  const faqs = [
    {
      category: "Getting Started",
      icon: HelpCircle,
      color: "text-blue-500",
      questions: [
        {
          q: "How do I start sharing files?",
          a: "Simply open the app, and you'll get a unique 6-character connection key generated using WebRTC peer ID system with timestamp + cryptographically secure random characters. Share this key with others through secure channels like encrypted messaging apps, or enter someone else's key to establish a direct peer-to-peer connection and start transferring files instantly via WebRTC DataChannel.",
          technical:
            "Uses PeerJS library with STUN/TURN servers for NAT traversal and ICE candidate gathering protocol",
        },
        {
          q: "Do I need to create an account?",
          a: "No account required! Just enter your name when you first open the app. Your session uses our advanced session persistence system that stores your identity in localStorage with 30-day expiration, maintaining complete privacy while persisting across browser refreshes. The multi-storage strategy gracefully degrades from localStorage → sessionStorage → in-memory fallback if storage is unavailable.",
          technical: "Session data cached with 10-second TTL, automatic cleanup of stale entries, and XSS sanitization",
        },
        {
          q: "What file types are supported?",
          a: "All file types are supported without restrictions - documents (PDF, DOCX, TXT), images (JPG, PNG, SVG), videos (MP4, AVI, MKV), audio (MP3, WAV, FLAC), archives (ZIP, RAR, 7Z), and more. Our transfer engine automatically detects MIME types using magic number verification, handles binary data transmission efficiently with ArrayBuffer processing, and maintains file integrity throughout transfer with CRC32 checksums.",
          technical: "MIME type detection with extension validation, binary mode preference over Base64 when possible",
        },
        {
          q: "Is there a file size limit?",
          a: "No hard server-imposed limits! Our chunked transfer system breaks files into configurable segments (default 64KB, adjustable 1KB-1MB in settings) allowing efficient transfer of files of any size. Large files are processed using streaming approach without loading entirely into memory, limited only by your browser's available memory (typically 2-4GB practical limit depending on device RAM and other open tabs).",
          technical:
            "Streaming with chunk buffering, automatic garbage collection triggers, ArrayBuffer pooling for performance",
        },
        {
          q: "Why do my settings reset when I refresh the page?",
          a: "Settings like chunk size, file transfer limits, and auto-download preferences are now automatically saved to your browser's sessionStorage with JSON serialization and validation on read. The floating settings bubble remembers your preferences including max files per transfer (default 100), chunk size (64KB), and auto-download toggle. Settings persist throughout your browser session with schema migration support for backward compatibility.",
          technical:
            "Singleton pattern with validation (range checking, type validation, regex patterns), safe defaults and rollback",
        },
        {
          q: "Can I use this on my phone or tablet?",
          a: "Yes! Nowhile is fully responsive and works on all modern mobile browsers with WebRTC support including Chrome Android, Safari iOS 11+, Firefox Android, and Samsung Internet. The UI automatically adapts for touch interfaces with larger tap targets, swipe gestures, and optimized layouts. However, desktop browsers typically provide better performance for large file transfers (>100MB) due to mobile device memory constraints and background tab throttling.",
          technical:
            "Touch-friendly controls with pointer events, responsive breakpoints, virtualized lists for mobile performance",
        },
        {
          q: "How long does my session last?",
          a: "Your session persists for up to 30 days from the last activity with automatic expiration cleanup. The session persistence system validates session data on each page load, checking for corruption, expiry timestamps, and ID format validity (6-character alphanumeric). Sessions are automatically cleaned up when expired, and you can manually regenerate your peer ID by refreshing the page if needed.",
          technical:
            "localStorage with TTL, requestIdleCallback for async operations, debounced writes to reduce I/O overhead",
        },
        {
          q: "What happens if I close my browser during a transfer?",
          a: "Active transfers will be interrupted and cannot resume after browser close because WebRTC connections are session-based and require both peers to remain online. However, completed file metadata is saved in your transfer history (stored in IndexedDB with 90-day retention) so you can track what was sent/received. For large files, keep your browser tab active and device awake during transfers to prevent interruption from system sleep or background throttling.",
          technical:
            "Transfer history persists in IndexedDB, connection state is not recoverable after session termination",
        },
      ],
    },
    {
      category: "Security & Privacy",
      icon: Shield,
      color: "text-green-500",
      questions: [
        {
          q: "How secure are my file transfers?",
          a: "All transfers use WebRTC's built-in end-to-end encryption with DTLS 1.2 (Datagram Transport Layer Security) and AES-256-GCM cipher suites providing military-grade protection. Our security layer ensures perfect forward secrecy with ECDHE key exchange using P-256 elliptic curve, meaning unique encryption keys for each session that cannot be compromised even if long-term keys are leaked. SHA-384 HMAC provides message authentication to detect tampering.",
          technical:
            "DTLS handshake with certificate verification, 2048-bit RSA certificates, AES-256-GCM authenticated encryption",
        },
        {
          q: "Are my files stored anywhere on your servers?",
          a: "Absolutely not! Our zero-knowledge architecture ensures files transfer directly between peers via WebRTC DataChannels with no server intermediaries for file data. We never store, see, log, or have any access to your files. Everything happens peer-to-peer with files existing only in browser memory temporarily during transfer, then immediately in the recipient's download folder. Our servers only facilitate initial peer discovery through WebSocket signaling, not file content.",
          technical:
            "Pure P2P with direct DataChannel connections, automatic memory cleanup with URL.revokeObjectURL, zero data retention",
        },
        {
          q: "Can others intercept my connection key?",
          a: "Connection keys are session-specific identifiers that expire when you close your browser (sessionStorage cleanup). Our session persistence system generates cryptographically secure peer IDs with timestamp-based uniqueness (2.1 billion possible combinations for 6 characters) and collision detection. Only share keys with trusted contacts through secure channels (encrypted messaging, in-person, phone call). Keys themselves don't contain encryption material - actual data encryption happens via WebRTC's DTLS handshake.",
          technical:
            "Crypto API for secure random generation, session tokens with automatic expiration, no key reuse across sessions",
        },
        {
          q: "What happens to my data after transfer completes?",
          a: "Nothing is stored anywhere permanently! Our transfer engine performs comprehensive cleanup immediately after completion: temporary chunks are removed from memory Maps with automatic garbage collection, transfer state is cleared from React state, object URLs are revoked to prevent memory leaks, and ArrayBuffers are deallocated. Files exist only on the recipient's device in their download location. No traces remain in browser memory after cleanup cycle completes.",
          technical:
            "Explicit memory cleanup with URL.revokeObjectURL, Map.clear() for chunks, null assignment for GC triggers",
        },
        {
          q: "How does the app detect if my connection is compromised?",
          a: "Our connection heartbeat system continuously monitors connection health with 5-second interval checks and 3-second timeout detection. It measures real-time latency (RTT) using ping-pong messages, detects connection drops immediately, tracks packet loss through acknowledgment patterns, and provides quality indicators: excellent (<100ms latency), good (<300ms), poor (>300ms). The WebRTC stats API provides additional metrics like bandwidth estimation, jitter, and ICE connection state for comprehensive monitoring.",
          technical:
            "setInterval heartbeat with timeout detection, WebRTC getStats() API, RTT calculation from timestamp deltas",
        },
        {
          q: "Can I verify file integrity after receiving?",
          a: "Yes! Our transfer engine implements chunk-level integrity verification using CRC32 checksums for each chunk with automatic retry of corrupted chunks. Additionally, a final file hash (SHA-256) can be computed and compared between sender and receiver for complete end-to-end verification. The chunk acknowledgment system with sequence numbers ensures no data loss, corruption, or reordering during transmission. Failed chunks trigger exponential backoff retries (1s, 2s, 4s, 8s).",
          technical: "CRC32 per chunk, SHA-256 final hash option, sequence number validation, replay attack protection",
        },
        {
          q: "What security measures protect against malicious files?",
          a: "Nowhile does not scan or filter file content to maintain zero-knowledge privacy. Users must exercise caution: verify file sources before opening, use antivirus software on downloaded files, be wary of unexpected executable files (.exe, .app, .bat, .sh), and only connect with trusted contacts. The app protects against XSS attacks with input sanitization (DOMPurify), CSP headers blocking inline scripts, and React's automatic JSX escaping. However, file content security is the user's responsibility.",
          technical:
            "XSS protection with sanitization, CSP with strict-dynamic, no server-side file inspection for privacy",
        },
        {
          q: "How is my privacy protected compared to cloud services?",
          a: "Unlike cloud services, Nowhile offers superior privacy: (1) Zero server storage means no data breaches of your files, (2) No user tracking or analytics cookies, (3) Direct peer connections bypass third-party servers entirely, (4) No account creation means no personal information collected, (5) Session data is local-only in browser storage, (6) No file metadata logging or transfer history on our servers. Your privacy is guaranteed by architecture, not just policy.",
          technical:
            "P2P architecture eliminates server attack surface, localStorage is origin-isolated, no telemetry or tracking",
        },
      ],
    },
    {
      category: "Technical Details",
      icon: Zap,
      color: "text-yellow-500",
      questions: [
        {
          q: "Why is my transfer speed slower than expected?",
          a: "Transfer speed depends on multiple factors: network bandwidth (both upload and download), WebRTC connection quality (NAT traversal efficiency), geographic distance between peers (affects latency), concurrent transfers (bandwidth sharing), chunk size configuration (overhead vs throughput balance), device CPU performance (chunking/encryption overhead), and network congestion. Our performance optimization system allows chunk size adjustment (1KB-1MB) in settings - use larger chunks for fast networks and smaller for unstable connections.",
          technical:
            "Network conditions affect DataChannel throughput, chunk size impacts overhead, CPU needed for chunking/crypto",
        },
        {
          q: "What if the connection drops during transfer?",
          a: "Our transfer engine implements automatic recovery with chunk-level acknowledgment - if connection drops, the heartbeat system detects it immediately (within 3-8 seconds) and attempts reconnection with exponential backoff. Failed chunks are automatically identified through missing acknowledgments and retried without restarting the entire transfer. However, if the connection cannot be re-established (peer offline, network issue persists), the transfer fails and must be manually restarted from the beginning.",
          technical:
            "Chunk ACK tracking with timeout detection, exponential backoff reconnection (1s, 2s, 4s, 8s), no transfer state recovery",
        },
        {
          q: "Can I connect to multiple people simultaneously?",
          a: "Yes! Our peer connection system supports up to 10 simultaneous connections with efficient connection pooling and resource sharing. You can send files to all peers (broadcast mode) or select specific recipients individually. Each connection is independently monitored with separate heartbeat tracking, quality metrics, and transfer queues. Connection pooling reuses WebRTC PeerConnection resources efficiently, and the Map data structure provides O(1) lookup performance for peer management.",
          technical:
            "Map<string, DataConnection> for peer storage, individual DataChannels per peer, concurrent transfer support",
        },
        {
          q: "Does it work on mobile devices?",
          a: "Yes, our responsive design works on all modern mobile browsers with full WebRTC support: Chrome Android (Chrome 56+), Safari iOS (iOS 11+), Firefox Android, and Samsung Internet. The UI automatically adapts for touch interfaces with larger tap targets (minimum 44x44px), swipe gestures for navigation, and optimized layouts with responsive breakpoints. However, desktop browsers typically provide better performance for large file transfers due to mobile device memory constraints (1-2GB typical vs 4-8GB desktop) and background tab throttling.",
          technical:
            "Touch event handlers with pointer events API, responsive CSS with mobile-first breakpoints, reduced memory footprint",
        },
        {
          q: "How much memory does the app use for large files?",
          a: "Our streaming transfer engine processes files in chunks without loading them entirely into memory, keeping memory usage bounded. Memory usage scales with chunk size × number of simultaneous transfers, not total file size. Typical memory footprint is 50-200MB during active transfers. The settings panel shows real-time browser memory usage when Performance API is available (performance.memory in Chromium browsers). For optimal performance, adjust chunk size and limit concurrent transfers based on your device's available RAM.",
          technical:
            "Streaming with chunk buffering, ArrayBuffer pooling, automatic GC triggers, requestIdleCallback for non-critical ops",
        },
        {
          q: "How can I monitor my transfer performance and optimize settings?",
          a: "The live analytics component provides comprehensive real-time monitoring: connection statistics (active peers, success rate), transfer speeds (current, average, peak) in KB/s or MB/s, data volumes (total bytes sent/received), latency measurements (RTT, jitter), and connection quality scores. It also offers performance optimization suggestions based on your usage patterns and network conditions. Use the heartbeat indicators (green/yellow/red) in the peer panel to identify optimal transfer timing and adjust chunk size based on connection quality.",
          technical:
            "WebRTC getStats() API for metrics, sliding window algorithms for averages, localStorage persistence with compression",
        },
        {
          q: "What browsers and versions are supported?",
          a: "Nowhile requires modern browsers with full WebRTC DataChannel support: Chrome 56+ (best performance), Firefox 51+ (excellent privacy), Safari 11+ (macOS/iOS), Edge 79+ (Chromium-based only), Opera 43+, Brave (latest), and mobile browsers including Chrome Android and Safari iOS 11+. Legacy browsers (IE11, old Edge pre-Chromium, Safari 10 and earlier) are not supported due to missing or incomplete WebRTC implementations. Check browser version and WebRTC settings if the app fails to initialize.",
          technical:
            "WebRTC 1.0 API required, DataChannel with SCTP transport, unified plan SDP format, File API, Streams API",
        },
        {
          q: "How does NAT traversal work for connections?",
          a: "WebRTC uses ICE (Interactive Connectivity Establishment) protocol with STUN/TURN servers for NAT traversal. STUN servers (Google: stun.l.google.com, Twilio) discover your public IP and port mapping for direct connections. ICE candidate gathering finds all possible connection paths (host, server reflexive, relay). Trickle ICE optimizes connection time by sending candidates as discovered. If direct connection fails (restrictive NAT/firewall), TURN relay servers provide fallback, though with higher latency. The app automatically handles this negotiation transparently.",
          technical:
            "ICE protocol with STUN/TURN, candidate gathering (host, srflx, relay), Trickle ICE for optimization",
        },
        {
          q: "Can I pause and resume file transfers?",
          a: "Currently, the transfer system supports cancellation but not pause/resume functionality. Cancelled transfers must be restarted from the beginning. This is because implementing reliable pause/resume requires additional complexity: state serialization for chunk progress, connection recovery after extended pauses, partial file storage management, and synchronization between peers. Future versions may include this feature with transfer state persistence in IndexedDB and automatic resume on reconnection.",
          technical:
            "Transfer state is in-memory only, no persistence layer for partial transfers, cancellation triggers cleanup",
        },
        {
          q: "What are the storage limits for file history and session data?",
          a: "File history is stored in IndexedDB with browser-dependent quota (typically 50MB minimum, can be unlimited on desktop with user permission). Session data uses localStorage (5-10MB limit) with fallback to sessionStorage. The storage analyzer component monitors usage across all storage types (localStorage, sessionStorage, IndexedDB, Cookies) with automatic updates every 5 seconds and provides health scores with cleanup recommendations. Old transfer history is retained for 90 days before automatic deletion.",
          technical:
            "IndexedDB with quota management, localStorage with 5-10MB typical limit, LRU cache eviction, compression for large objects",
        },
      ],
    },
    {
      category: "Troubleshooting",
      icon: AlertCircle,
      color: "text-red-500",
      questions: [
        {
          q: "I can't connect to someone - what should I check?",
          a: "Connection failures can have multiple causes: (1) Verify both users have stable internet with minimum 1 Mbps bandwidth, (2) Check the connection key is correct (6 characters, case-insensitive, alphanumeric), (3) Ensure you're not behind restrictive corporate firewalls blocking UDP ports (3478, 19302 for STUN), (4) Disable VPN or proxy temporarily as they interfere with WebRTC, (5) Try different browsers if WebRTC is disabled in settings, (6) Check the connection status component for specific error messages and ICE connection state diagnostics.",
          technical:
            "Common failures: symmetric NAT (requires TURN), blocked UDP, WebRTC disabled, CORS issues in development",
        },
        {
          q: "Files aren't downloading automatically - how do I fix this?",
          a: "Check if auto-download is enabled in the floating settings bubble (it's disabled by default for security). If enabled but not working: (1) Verify browser's download permissions in Settings > Privacy > Site Settings, (2) Check if popup blockers are preventing downloads, (3) Ensure sufficient disk space is available, (4) Try manual download from the transfer status component, (5) Clear browser cache and restart the session, (6) Check browser console for JavaScript errors. Some browsers require user interaction for first download as security measure.",
          technical:
            "Blob URL downloads with download attribute, browser download permissions, popup blocker interference",
        },
        {
          q: "The app says 'Initializing' for too long - what's wrong?",
          a: "Extended initialization (>10 seconds) indicates issues with: (1) Our session persistence system failing to load (corrupt localStorage data), (2) WebRTC initialization errors (PeerJS connection timeout), (3) Network connectivity problems preventing STUN server access, (4) Browser incompatibility with WebRTC APIs. Solutions: Refresh the page to regenerate peer ID, clear browser cache and localStorage (may lose session data), check internet connection stability, verify browser WebRTC support, or try a different browser as fallback.",
          technical:
            "PeerJS initialization with WebSocket signaling, STUN server connectivity check, session data validation on load",
        },
        {
          q: "My connection key isn't working - why not?",
          a: "Connection keys are case-sensitive (though normalized to lowercase in code) and managed by our session persistence system. Common issues: (1) Keys expire when the session ends or after 30 days of inactivity, (2) The other person is offline or closed their browser (keys are session-based), (3) Key is mistyped (verify all 6 characters carefully), (4) Network issues preventing peer discovery, (5) Incompatible WebRTC support between browsers. Ensure both users are currently online with the app open and active.",
          technical:
            "PeerJS peer IDs with timestamp-based generation, session cleanup on close, peer discovery through signaling server",
        },
        {
          q: "My file transfer keeps failing partway through - what can I do?",
          a: "Partial transfer failures indicate network instability or chunk transmission errors. Solutions: (1) Reduce chunk size in settings (try 16KB or 32KB) for unstable connections, (2) Close other bandwidth-intensive applications, (3) Monitor connection heartbeat indicators for quality degradation before starting transfers, (4) Ensure both devices stay awake (disable sleep mode), (5) Keep browser tabs active to prevent background throttling, (6) Try wired Ethernet connection instead of WiFi, (7) Use live analytics to identify transfer failure patterns, (8) Split large files into smaller batches.",
          technical:
            "Chunk timeout detection (5s), exponential backoff retries, network quality monitoring with RTT/jitter tracking",
        },
        {
          q: "The app doesn't work in my browser - why?",
          a: "Nowhile requires modern browsers with full WebRTC DataChannel support and JavaScript enabled. Unsupported browsers: Internet Explorer (all versions - no WebRTC), Legacy Edge (pre-Chromium versions), Safari 10 and earlier (incomplete WebRTC), very old Chrome/Firefox versions (pre-2017). Required features: WebRTC 1.0 API with DataChannel, File API for file handling, Streams API for large files, Web Storage API for persistence, Crypto API for secure random numbers. Check your browser version and update to the latest if possible.",
          technical:
            "Feature detection for WebRTC DataChannel, File API, Blob constructor, localStorage, Crypto.getRandomValues",
        },
        {
          q: "Transfer speeds are very slow - how can I improve performance?",
          a: "Performance optimization strategies: (1) Move devices closer together if using WiFi (reduce signal interference), (2) Use wired Ethernet for maximum stability and speed (gigabit recommended), (3) Increase chunk size in settings to 256KB-1MB for fast networks (reduces overhead), (4) Close unnecessary browser tabs and applications (free CPU/RAM), (5) Disable browser extensions that may throttle connections, (6) Use the same local network when possible (LAN transfers are 10-100x faster), (7) Check router QoS settings aren't limiting WebRTC traffic, (8) Monitor live analytics for bottleneck identification, (9) Ensure both devices have sufficient CPU and available memory.",
          technical:
            "Chunk size affects overhead ratio, concurrent processing with Web Workers, GPU-accelerated rendering",
        },
        {
          q: "My session data or settings are lost after refresh - why?",
          a: "Session persistence should maintain data across refreshes for 30 days. If losing data: (1) Check if browser is in private/incognito mode (sessionStorage only), (2) Verify localStorage is not disabled in browser settings, (3) Check if browser storage quota is exceeded (clear old data), (4) Browser extensions might be clearing storage automatically, (5) Antivirus software may block localStorage writes, (6) Verify cookies are enabled (required for session management). The multi-storage strategy should fallback gracefully, but incognito mode limits persistence to session duration only.",
          technical:
            "Storage fallback chain: localStorage → sessionStorage → in-memory, quota management with automatic cleanup",
        },
        {
          q: "I'm getting memory errors or browser crashes during large transfers - help!",
          a: "Memory issues typically occur with: (1) Very large files (>2GB) exceeding browser memory limits, (2) Too many simultaneous transfers consuming all available RAM, (3) Chunk size too large causing memory spikes, (4) Other browser tabs consuming memory, (5) Memory leaks from object URLs not being revoked. Solutions: Split large files into smaller batches (<500MB recommended), reduce chunk size to 16-32KB, close unnecessary tabs, transfer files sequentially instead of concurrently, restart browser to clear memory leaks, use desktop browser instead of mobile for large files, monitor memory usage in settings panel.",
          technical:
            "Browser memory limits (2-4GB typical), ArrayBuffer allocation limits, automatic garbage collection with null assignment",
        },
      ],
    },
    {
      category: "Features & Capabilities",
      icon: Settings,
      color: "text-purple-500",
      questions: [
        {
          q: "Can I send files to multiple people at once?",
          a: "Yes! Nowhile supports multi-peer broadcasting. Connect to multiple peers (up to 10 simultaneous), then select 'All Peers' in the file send dropdown to broadcast files to everyone connected. Alternatively, use the individual peer selector to send to specific recipients. Each transfer is independent with separate progress tracking, acknowledgments, and connection quality monitoring. This is ideal for team collaboration, classroom file distribution, or group projects where multiple people need the same files.",
          technical:
            "Concurrent DataChannel transfers, independent chunk acknowledgment per peer, Map-based peer management",
        },
        {
          q: "What is the Storage Analyzer and how does it work?",
          a: "The AI-enhanced expandable Storage Analyzer is a real-time dashboard monitoring all browser storage types: localStorage (key-value storage for settings), sessionStorage (temporary session data), IndexedDB (structured file history database), and Cookies (session tokens). It automatically updates every 5 seconds without manual refresh, shows storage usage with color-coded health indicators (green <50%, yellow 50-75%, red >75%), provides detailed breakdowns with object counts and individual sizes, and offers smart insights recommending cleanup actions when storage is running low.",
          technical:
            "Storage Estimation API, IndexedDB cursor iteration, localStorage.length iteration, automatic polling with setInterval",
        },
        {
          q: "How do the connection quality indicators work?",
          a: "The connection heartbeat system sends ping messages every 5 seconds to each connected peer and measures round-trip time (RTT). Quality is assessed as: Excellent (green) for <100ms latency indicating local network or fast connection, Good (yellow) for <300ms latency typical of internet connections, Poor (red) for >300ms indicating high latency or unstable connection. Additional metrics include packet loss detection through missing acknowledgments, bandwidth estimation from transfer speeds, and jitter measurement for connection stability. Use these indicators to determine optimal transfer timing.",
          technical:
            "Heartbeat with timestamp deltas for RTT, WebRTC getStats() for detailed metrics, quality thresholds based on user experience",
        },
        {
          q: "Can I create text files directly in the app?",
          a: "Yes! Nowhile includes a built-in text file creator. Click the 'Create Text File' option in the file selection interface, enter your content in the text editor with syntax highlighting support, specify filename with extension (.txt, .md, .json, .csv, etc.), and the app creates a Blob with proper MIME type detection. The file is then added to your transfer queue just like uploaded files. This is useful for quick notes, sharing code snippets, configuration files, or sending messages as downloadable text files.",
          technical:
            "Blob constructor with MIME type, TextEncoder for UTF-8 encoding, File object creation with timestamp",
        },
        {
          q: "What file type icons does the app use?",
          a: "Nowhile uses color-coded Lucide React icons for quick visual file type identification: Images (blue - File, FileImage) for JPG/PNG/GIF/SVG, Videos (purple - Video, Film) for MP4/AVI/MOV/MKV, Audio (green - Music, AudioLines) for MP3/WAV/FLAC/AAC, Documents (orange - FileText, File) for PDF/DOCX/TXT/MD, Archives (gray - Archive, Folder) for ZIP/RAR/7Z/TAR, Code files (red - FileCode) for JS/TS/PY/CPP. Different icon shades distinguish incoming (lighter) vs outgoing (darker) files for easy at-a-glance identification in transfer history.",
          technical:
            "MIME type detection with RegEx patterns, icon mapping based on file extension and MIME type prefix",
        },
        {
          q: "How does the chunk-based transfer system improve performance?",
          a: "Chunking provides multiple benefits: (1) Memory efficiency - only small segments loaded at once, not entire file, (2) Progress granularity - updates every chunk for smooth progress bars, (3) Error recovery - only failed chunks need retry, not full file, (4) Streaming capability - start sending before full file is read, (5) Concurrent processing - chunk preparation parallel with transmission, (6) Adaptive sizing - adjust chunk size based on network conditions. Configurable from 1KB (unstable networks) to 1MB (fast LANs) with 64KB default balancing overhead and throughput.",
          technical:
            "ArrayBuffer.slice() for chunking, chunk sequence numbers for ordering, CRC32 per chunk, acknowledgment protocol",
        },
        {
          q: "What analytics and metrics can I track?",
          a: "The live analytics dashboard tracks comprehensive metrics: Connection statistics (total peers connected, active connections, connection uptime), Transfer metrics (files sent/received count, total data volume in bytes/KB/MB/GB, current transfer speed in KB/s or MB/s, average speed with 5-second moving average, peak speed achieved), Success rates (percentage of successful transfers, failure reasons analysis), Performance data (latency measurements, bandwidth utilization, memory usage when available via Performance API), and Session history (persistent tracking in localStorage with 90-day retention, exportable as CSV/JSON for external analysis).",
          technical:
            "Real-time calculation with sliding window algorithms, localStorage persistence with compression, chart visualization",
        },
        {
          q: "Can I control which files download automatically?",
          a: "Yes, through the floating settings bubble. Auto-download can be: (1) Globally disabled (manual download for all files - safest), (2) Globally enabled (automatic download for all received files - most convenient), (3) Per-peer override (trust certain peers for auto-download, require manual for others - balanced approach). Manual download mode displays files in the transfer status component with download buttons, allowing you to review file details (name, size, sender, type) before downloading. This provides security control while maintaining convenience for trusted sources.",
          technical:
            "Settings stored in sessionStorage with React context sync, download triggered with Blob URL and anchor click",
        },
      ],
    },
  ]

  const tips = [
    {
      title: "Performance Optimization",
      icon: Zap,
      color: "text-green-500",
      tips: [
        "Use the same WiFi network when possible for optimal WebRTC performance (LAN speeds 10-100x faster)",
        "Keep browser tabs active during transfers to prevent throttling (browsers throttle background tabs)",
        "Adjust chunk size in settings: smaller (16-32KB) for unstable connections, larger (256KB-1MB) for fast networks",
        "Monitor connection quality indicators (green/yellow/red) in the peer panel before starting large transfers",
        "Use wired Ethernet connections for large files to ensure stable bandwidth and lower latency",
        "Check live analytics for performance optimization suggestions and bottleneck identification",
        "Close unnecessary applications and browser tabs to free CPU and memory resources",
        "Disable browser extensions temporarily if experiencing performance issues or connection problems",
      ],
    },
    {
      title: "Security Best Practices",
      icon: Shield,
      color: "text-blue-500",
      tips: [
        "Only share connection keys with trusted contacts through secure channels (encrypted messaging, in-person)",
        "Verify file contents and sources before opening received files, especially executables (.exe, .app, .bat)",
        "Use unique, descriptive session names for easy peer identification and trust verification",
        "Refresh your peer ID (regenerate connection key) if you suspect it's been compromised or shared accidentally",
        "Monitor connection heartbeat indicators for unusual activity patterns or unexpected peers",
        "Remember that all transfers are end-to-end encrypted automatically with DTLS 1.2 and AES-256-GCM",
        "Use antivirus software to scan downloaded files before opening them, especially from new contacts",
        "Be cautious of unsolicited file transfers from unknown peers and verify sender identity first",
      ],
    },
    {
      title: "Troubleshooting Tips",
      icon: AlertCircle,
      color: "text-orange-500",
      tips: [
        "Refresh the page if WebRTC connections fail to establish after 10-15 seconds",
        "Check firewall and antivirus settings for WebRTC blocking (allow UDP ports 3478, 19302)",
        "Try different browsers if issues persist with WebRTC support (Chrome usually has best compatibility)",
        "Ensure both users have stable internet with sufficient bandwidth (minimum 1 Mbps for smooth transfers)",
        "Clear browser cache and localStorage if session persistence issues occur (Settings > Privacy > Clear Data)",
        "Use the connection status component to diagnose specific errors with detailed error messages",
        "Disable VPN or proxy temporarily as they can interfere with WebRTC's NAT traversal mechanism",
        "Check browser console (F12) for JavaScript errors if app doesn't initialize or behaves unexpectedly",
      ],
    },
    {
      title: "Advanced Features",
      icon: Layers,
      color: "text-purple-500",
      tips: [
        "Use the Storage Analyzer (updates every 5 seconds automatically) to monitor browser storage usage and health",
        "Enable auto-download in settings for trusted peers to streamline workflow and save clicks",
        "Use keyboard shortcuts: Ctrl/Cmd+Enter to send, Escape to clear selection, Ctrl+Click for multi-select",
        "Send to 'All Peers' for broadcasting files to multiple recipients simultaneously in group scenarios",
        "Monitor live analytics for detailed performance insights including speeds, volumes, and connection quality",
        "Create text files directly in the app for quick notes or code snippets without leaving the browser",
        "Use the detailed file history (90-day retention in IndexedDB) to track all past transfers with metadata",
        "Export analytics data as CSV/JSON for external analysis, reporting, or performance tracking",
      ],
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
              <HelpCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Comprehensive FAQ & Knowledge Base</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Find detailed answers to common questions about using Nowhile's advanced peer-to-peer file sharing system
              with WebRTC technology, chunked transfers, real-time monitoring, comprehensive analytics, and
              military-grade end-to-end encryption
            </p>
            <div className="flex flex-wrap gap-2 justify-center pt-2">
              <Badge variant="outline" className="gap-1">
                <Code className="h-3 w-3" />
                {faqs.reduce((sum, cat) => sum + cat.questions.length, 0)}+ Detailed Answers
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Info className="h-3 w-3" />
                Technical Explanations
              </Badge>
              <Badge variant="outline" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Best Practices Included
              </Badge>
            </div>
          </div>

          {/* Educational Project Notice - IMPORTANT */}
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 animate-slide-up animation-delay-300">
            {faqs.map((category, index) => {
              const Icon = category.icon
              return (
                <Card key={index} className="hover-lift-subtle border-2">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className={`p-3 bg-gradient-to-br from-muted to-muted/50 rounded-xl`}>
                        <Icon className={`h-8 w-8 ${category.color}`} />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{category.category}</p>
                        <p className="text-3xl font-bold text-primary">{category.questions.length}</p>
                        <p className="text-xs text-muted-foreground">questions</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* FAQ Categories */}
          <div className="space-y-8">
            {faqs.map((category, categoryIndex) => {
              const CategoryIcon = category.icon
              return (
                <div key={categoryIndex} className="space-y-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-muted to-muted/30 rounded-xl border-2 border-border">
                      <CategoryIcon className={`h-7 w-7 ${category.color}`} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{category.category}</h2>
                      <p className="text-sm text-muted-foreground">{category.questions.length} detailed answers</p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {category.questions.map((faq, faqIndex) => (
                      <Card
                        key={faqIndex}
                        className="animate-bounce-in border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-card to-card/50"
                        style={{ animationDelay: `${(categoryIndex * 4 + faqIndex) * 0.05}s` }}
                      >
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-start gap-2 leading-tight">
                            <HelpCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            {faq.q}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                          {faq.technical && (
                            <>
                              <div className="border-t border-border/50 pt-3">
                                <Alert className="bg-blue-500/5 border-blue-500/20">
                                  <Code className="h-4 w-4 text-blue-500" />
                                  <AlertDescription className="text-xs leading-relaxed">
                                    <strong className="text-blue-500">Technical:</strong> {faq.technical}
                                  </AlertDescription>
                                </Alert>
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Quick Tips Section - Enhanced */}
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">Pro Tips & Best Practices</h2>
              <p className="text-muted-foreground">Expert recommendations organized by category</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {tips.map((tipCategory, index) => {
                const Icon = tipCategory.icon
                return (
                  <Card
                    key={index}
                    className="animate-slide-up border-2 hover:border-primary/30 transition-all bg-gradient-to-br from-card to-muted/20"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="p-2 bg-gradient-to-br from-muted to-muted/50 rounded-lg">
                          <Icon className={`h-5 w-5 ${tipCategory.color}`} />
                        </div>
                        {tipCategory.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {tipCategory.tips.map((tip, tipIndex) => (
                          <li key={tipIndex} className="flex items-start gap-2 text-sm leading-relaxed">
                            <CheckCircle className={`h-4 w-4 ${tipCategory.color} mt-0.5 flex-shrink-0`} />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Still Need Help Card */}
          <Card className="animate-slide-up text-center border-2 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="pt-6 space-y-6">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Info className="h-10 w-10 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Still Need Help?</h3>
                <p className="text-muted-foreground mb-4 max-w-2xl mx-auto leading-relaxed">
                  If you can't find the answer you're looking for, the app includes comprehensive error messages,
                  real-time connection monitoring with quality indicators, live analytics dashboard with performance
                  insights, and detailed status indicators to help diagnose and resolve any issues.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="outline" className="text-sm gap-1">
                  <Lock className="h-3 w-3" />
                  DTLS 1.2 End-to-End Encryption
                </Badge>
                <Badge variant="outline" className="text-sm gap-1">
                  <Activity className="h-3 w-3" />
                  Real-time Connection Monitoring
                </Badge>
                <Badge variant="outline" className="text-sm gap-1">
                  <Boxes className="h-3 w-3" />
                  Chunked Transfer Technology
                </Badge>
                <Badge variant="outline" className="text-sm gap-1">
                  <Database className="h-3 w-3" />
                  Automatic Storage Analytics
                </Badge>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground italic">
                  Check the connection status component for specific error codes, use live analytics for performance
                  diagnostics, and monitor the heartbeat indicators for connection quality assessment.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AppFooter />
    </div>
  )
}
