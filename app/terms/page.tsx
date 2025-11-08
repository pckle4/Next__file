"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  FileText,
  Shield,
  AlertTriangle,
  CheckCircle,
  Users,
  Lock,
  Zap,
  Scale,
  Activity,
  Database,
  Code,
  TerminalSquare,
  BookOpen,
} from "lucide-react"
import { NavigationMenu } from "@/components/navigation-menu"
import { AppFooter } from "@/components/app-footer"

export default function TermsPage() {
  const sections = [
    {
      title: "Acceptance of Terms",
      icon: FileText,
      color: "text-blue-500",
      content:
        "By accessing and using Nowhile ('Service'), you agree to be bound by these Terms of Service ('Terms'). If you do not agree to abide by the above, please do not use this service. Nowhile reserves the right to modify these terms at any time. Your continued use of the Service following the posting of revised Terms means that you accept and agree to the changes.",
    },
    {
      title: "Service Description",
      icon: Zap,
      color: "text-yellow-500",
      content:
        "Nowhile is a peer-to-peer file transfer application that enables direct file sharing between users via WebRTC technology. The Service operates with zero-knowledge architecture, meaning files are transferred directly between peers without server storage. Users maintain complete control over their data, and Nowhile does not access, store, or monitor file contents. The Service is provided on an 'as-is' basis without guarantees of uptime, availability, or performance.",
    },
    {
      title: "User Responsibilities",
      icon: Users,
      color: "text-purple-500",
      content:
        "Users are solely responsible for all file transfers conducted through Nowhile. You agree to: (1) Not use the Service for illegal activities or file sharing that violates intellectual property rights, (2) Not transmit malware, viruses, or harmful content, (3) Not attempt to reverse-engineer or attack the Service infrastructure, (4) Not use the Service in violation of applicable laws and regulations, (5) Respect other users' privacy and security. Violations may result in immediate termination of access.",
    },
    {
      title: "Intellectual Property",
      icon: Scale,
      color: "text-amber-500",
      content:
        "Nowhile respects intellectual property rights. Users are responsible for ensuring they have the right to transfer any files through the Service. You agree not to use Nowhile to distribute copyrighted material, trade secrets, confidential information, or any content protected by intellectual property laws without authorization. Nowhile is not liable for file contents transmitted by users. Users indemnify Nowhile against any claims arising from their use of the Service.",
    },
    {
      title: "Data Storage and Privacy",
      icon: Database,
      color: "text-green-500",
      content:
        "As a zero-knowledge service, Nowhile does not store file contents on servers. Session data (peer ID, transfer history metadata) is stored locally in your browser using IndexedDB and localStorage with automatic 30-day expiration. No personal information is collected unless voluntarily provided. Transfer logs are maintained locally on your device only. We do not share, sell, or disclose user data to third parties. Your session data is isolated per origin and browser context.",
    },
    {
      title: "Limitation of Liability",
      icon: AlertTriangle,
      color: "text-red-500",
      content:
        "Nowhile is provided 'as-is' without warranties of any kind, express or implied. We do not warrant that the Service will be uninterrupted, error-free, secure, or meet your specific requirements. To the maximum extent permitted by law, Nowhile shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use or inability to use the Service, even if advised of the possibility of such damages. Your exclusive remedy is to stop using the Service.",
    },
    {
      title: "WebRTC and Third-Party Services",
      icon: Activity,
      color: "text-cyan-500",
      content:
        "Nowhile uses WebRTC technology with STUN/TURN servers for peer connection establishment. While these servers facilitate connection setup, they do not have access to file transfer data due to WebRTC's end-to-end encryption (DTLS 1.2). Users should be aware that STUN/TURN services may log connection metadata. Nowhile is not responsible for third-party server reliability or privacy policies. Connection failures or quality issues related to third-party infrastructure are beyond Nowhile's control.",
    },
    {
      title: "Session Persistence and Cookies",
      icon: Lock,
      color: "text-indigo-500",
      content:
        "Nowhile uses browser storage (localStorage and sessionStorage) to maintain your session across page refreshes. This storage includes your peer ID, session metadata, and transfer history. No tracking cookies are used. You can clear this data by clearing your browser cache/storage. Disabling JavaScript or browser storage will prevent the Service from functioning properly. Session data is automatically cleared based on configured TTL (Time To Live) values, typically 30 days for persistent data and session duration for temporary data.",
    },
    {
      title: "Prohibited Uses",
      icon: Shield,
      color: "text-orange-500",
      content:
        "You agree not to: (1) Use Nowhile to transmit malware, ransomware, or any malicious software, (2) Attempt to gain unauthorized access to the Service or other users' devices, (3) Conduct denial-of-service (DoS) attacks or overwhelming the Service with requests, (4) Reverse-engineer, decompile, or attempt to discover source code through debugging, (5) Use the Service for spam, harassment, or phishing, (6) Circumvent security measures or encryption, (7) Use the Service for activities that violate criminal laws. Prohibited use violations result in immediate account/session termination.",
    },
    {
      title: "Termination",
      icon: Code,
      color: "text-red-600",
      content:
        "Nowhile reserves the right to terminate your access to the Service immediately and without notice if you violate these Terms or engage in prohibited activities. Upon termination, your local session data will be cleared. You may also terminate your use by clearing your browser storage and not accessing Nowhile. Termination does not affect your responsibility for any violations of these Terms committed before termination.",
    },
    {
      title: "Changes to Terms",
      icon: TerminalSquare,
      color: "text-blue-600",
      content:
        "Nowhile may modify these Terms at any time by posting updates to this page. Your continued use of the Service after modifications indicates your acceptance of the updated Terms. We recommend reviewing these Terms periodically to stay informed of any changes. Material changes will be announced prominently, but users are responsible for checking for updates regularly.",
    },
    {
      title: "Governing Law",
      icon: BookOpen,
      color: "text-purple-600",
      content:
        "These Terms are governed by and construed in accordance with applicable laws and regulations. Any disputes arising from these Terms or the Service shall be resolved through binding arbitration rather than court proceedings, except where prohibited by law. By using Nowhile, you agree to submit to the exclusive jurisdiction of arbitration for dispute resolution. Users retain the right to contact relevant data protection authorities regarding privacy concerns.",
    },
  ]

  return (
    <main className="min-h-screen bg-background">
      <NavigationMenu />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-blue-500/15 rounded-lg border border-blue-500/30">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">Terms of Service</h1>
          </div>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl">
            Last updated: {new Date().toLocaleDateString()}. Please read these terms carefully before using Nowhile.
          </p>
        </div>

        <Alert className="mb-8 bg-amber-500/10 border-amber-500/30 rounded-xl">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-900 dark:text-amber-200">Important Notice</AlertTitle>
          <AlertDescription className="text-amber-800 dark:text-amber-300">
            This is an educational project demonstrating peer-to-peer file transfer technology. Users are solely
            responsible for compliance with applicable laws and regulations. Nowhile is provided as-is without
            warranties. Use discretion when sharing sensitive information.
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
              <CheckCircle className="h-5 w-5 text-green-500" />
              Agreement Acknowledgment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm sm:text-base text-muted-foreground">
              By using Nowhile, you acknowledge that you have read, understood, and agree to be bound by these Terms of
              Service. If you do not agree with any part of these terms, please discontinue use of the Service
              immediately. Continued use constitutes your acceptance of these terms in their entirety.
            </p>
          </CardContent>
        </Card>
      </div>

      <AppFooter />
    </main>
  )
}
