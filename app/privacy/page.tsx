"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Lock,
  Shield,
  Eye,
  Database,
  Zap,
  Users,
  Activity,
  Server,
  AlertTriangle,
  CheckCircle,
  Code,
  TerminalSquare,
  BookOpen,
} from "lucide-react"
import { NavigationMenu } from "@/components/navigation-menu"
import { AppFooter } from "@/components/app-footer"

export default function PrivacyPage() {
  const sections = [
    {
      title: "Zero-Knowledge Architecture",
      icon: Eye,
      color: "text-blue-500",
      content:
        "Nowhile operates on a zero-knowledge principle, meaning we never access, store, or have any visibility into your files. All file transfers occur directly between peers using WebRTC DataChannels with end-to-end encryption via DTLS 1.2. No file content is transmitted through our servers. We cannot see what you're sending, to whom, or the file metadata like names or sizes during transfer. This architectural design ensures maximum privacy by eliminating the server as a data access point.",
    },
    {
      title: "What We Don't Collect",
      icon: Shield,
      color: "text-green-500",
      content:
        "Nowhile does NOT collect: (1) Personal information (name, email, phone, address), (2) File contents or metadata (file names, sizes, types, content hashes), (3) Transfer details (what was sent, to whom, when), (4) Browser or device fingerprints, (5) IP addresses (though ISPs see your traffic), (6) Usage analytics or telemetry, (7) Cookies for tracking purposes. We do not use third-party analytics services, advertising networks, or data brokers. Your privacy is fundamental to our design, not negotiable.",
    },
    {
      title: "Local Session Storage",
      icon: Database,
      color: "text-purple-500",
      content:
        "Nowhile stores session data ONLY in your browser using localStorage and IndexedDB: (1) Peer ID: your unique 6-character session identifier, (2) Transfer history: metadata-only records of past transfers (no file contents), (3) Settings: your preferences for chunk size and auto-download, (4) Session metadata: login timestamp and last activity time. All data is stored locally on your device with AES encryption where possible. This data is NEVER sent to our servers and cannot be accessed remotely. Clearing your browser storage removes all Nowhile data permanently.",
    },
    {
      title: "WebRTC Connection Data",
      icon: Activity,
      color: "text-cyan-500",
      content:
        "WebRTC uses STUN and TURN servers to establish peer connections through NAT/firewalls: (1) STUN servers: receive your external IP address to help with connection establishment (minimal privacy impact), (2) TURN servers: relay your traffic if direct connection is impossible (relayed connections see encrypted data only, not file contents), (3) ICE candidates: connection options exchanged between peers, not stored long-term. While these servers may log connection events, they cannot access encrypted file data. Nowhile does not operate these servers - they're provided by third parties with their own privacy policies.",
    },
    {
      title: "Data You Voluntarily Provide",
      icon: Users,
      color: "text-amber-500",
      content:
        "The only information Nowhile requires you to provide is your name during first use, which is stored locally in your session. This helps other users identify you during peer connections. You can change your name anytime - we do not validate, verify, or store this information on our servers. Any communication through Nowhile's chat feature is transmitted end-to-end encrypted and not stored on servers. We do not have access to chat messages. If you contact us through email, those communications are handled according to our support policy.",
    },
    {
      title: "Automatic Data Deletion",
      icon: Zap,
      color: "text-yellow-500",
      content:
        "Nowhile implements automatic data cleanup: (1) Session data: 30-day expiration from last access, then automatic deletion, (2) Transfer history: 90-day retention for reference, then purged, (3) Temporary files: immediate deletion after transfer completion, (4) Browser caches: cleared on page unload unless explicitly disabled. You can manually delete all local data anytime by clearing browser storage. When your session expires, all associated metadata is removed from your device. No manual request to delete data is necessary - deletion happens automatically.",
    },
    {
      title: "End-to-End Encryption",
      icon: Lock,
      color: "text-red-500",
      content:
        "All peer-to-peer connections use WebRTC's mandatory DTLS 1.2 encryption: (1) Key exchange: ECDHE with P-256 elliptic curve for perfect forward secrecy, (2) Cipher suite: AES-256-GCM for authenticated encryption, (3) SHA-384 HMAC: detects any tampering or corruption, (4) Certificate validation: prevents man-in-the-middle attacks during key exchange. Each connection session generates unique encryption keys that are never reused. This means even if someone captures network traffic, they cannot decrypt your files. Encryption is applied automatically without user action.",
    },
    {
      title: "Security Best Practices",
      icon: Code,
      color: "text-indigo-500",
      content:
        "For maximum privacy: (1) Share connection keys only with trusted contacts through secure channels (encrypted messaging, phone), (2) Verify peer identity before sharing sensitive files, (3) Use VPN if concerned about ISP traffic analysis (though data is still encrypted), (4) Enable two-factor authentication on your email if you contact support, (5) Never grant Nowhile microphone/camera permissions (we don't request these), (6) Keep your browser updated for security patches, (7) Clear browser storage before using on shared computers. These practices enhance privacy beyond what Nowhile provides.",
    },
    {
      title: "Third-Party Services",
      icon: Server,
      color: "text-orange-500",
      content:
        "Nowhile integrates with: (1) PeerJS: manages WebRTC peer connections, may log connection events per their privacy policy, (2) WebRTC STUN/TURN servers: facilitate connection setup, may log IP addresses per their operators' policies. We do not integrate with advertising networks, analytics services, or social media trackers. We do not embed third-party content, pixels, or beacons. Links to third-party sites (GitHub, contact email) are your choice to visit - their privacy policies apply when you leave Nowhile.",
    },
    {
      title: "Data Breach Notification",
      icon: AlertTriangle,
      color: "text-red-600",
      content:
        "Due to our zero-knowledge architecture, a breach of Nowhile servers would not expose your files, personal information, or sensitive data. We maintain minimal information on servers (connection metadata only), so the impact of any potential breach is extremely limited. In the unlikely event of a security incident, we will notify users of what information was affected within 24 hours. Since file contents are never stored server-side, no file data is at risk from server compromises.",
    },
    {
      title: "GDPR and Data Rights",
      icon: TerminalSquare,
      color: "text-blue-600",
      content:
        "If you're in the EU or a GDPR-compliant jurisdiction: (1) Right to access: your local session data is accessible directly in your browser storage (no server request needed), (2) Right to deletion: delete your local storage to remove all data immediately, (3) Right to portability: your data is stored locally, you can export it anytime, (4) No data controller: Nowhile is not your data controller since we don't process personal data - you control everything locally. We do not require explicit consent for service operation since we collect minimal data. Contact support for privacy inquiries.",
    },
    {
      title: "Children's Privacy",
      icon: Users,
      color: "text-green-600",
      content:
        "Nowhile does not intentionally collect information from children under 13 (COPPA) or under 16 (GDPR). We do not target children, request birth dates, or knowingly process children's data. Parents concerned about children's use should monitor their activity and establish appropriate usage policies. Since we don't collect personal information, we cannot knowingly process children's data. If you believe we have information about a child in violation of applicable laws, contact us immediately.",
    },
    {
      title: "Changes to Privacy Policy",
      icon: BookOpen,
      color: "text-purple-600",
      content:
        "We may update this Privacy Policy to reflect changes in our practices, technology, legal requirements, or other factors. Material changes will be announced prominently on this page with an updated timestamp. Your continued use of Nowhile after policy changes constitutes acceptance of the updated Privacy Policy. We recommend checking this page periodically. If you do not agree with updated privacy practices, you can discontinue use and clear your local data.",
    },
  ]

  return (
    <main className="min-h-screen bg-background">
      <NavigationMenu />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-blue-500/15 rounded-lg border border-blue-500/30">
              <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">Privacy Policy</h1>
          </div>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl">
            Last updated: {new Date().toLocaleDateString()}. Your privacy is our top priority. This policy explains
            exactly what we collect and don't collect.
          </p>
        </div>

        <Alert className="mb-8 bg-green-500/10 border-green-500/30 rounded-xl">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-900 dark:text-green-200">Zero-Knowledge Commitment</AlertTitle>
          <AlertDescription className="text-green-800 dark:text-green-300">
            Nowhile is an educational project built with privacy-first design. We never access, store, or transmit your
            file contents. All transfers are peer-to-peer and fully encrypted end-to-end with no server involvement in
            actual file transfer.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          {sections.map((section, index) => {
            const IconComponent = section.icon
            return (
              <Card
                key={index}
                className="border border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group"
              >
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg bg-${section.color.split("-")[1]}-500/10 border border-${section.color.split("-")[1]}-500/20 group-hover:scale-110 transition-transform`}
                    >
                      <IconComponent className={`h-5 w-5 sm:h-6 sm:w-6 ${section.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg sm:text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                        {section.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{section.content}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card className="mt-8 border-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              Your Privacy is Protected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm sm:text-base text-muted-foreground">
              Nowhile's architecture is designed to protect your privacy fundamentally. We don't need your personal data
              to operate, we don't sell your information, and we don't track your behavior. Your trust is everything to
              us. If you have any privacy concerns or questions about our practices, please contact us immediately.
            </p>
          </CardContent>
        </Card>
      </div>

      <AppFooter />
    </main>
  )
}
