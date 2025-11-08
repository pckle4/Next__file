import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import ClientLayout from "./client-layout"
import "./globals.css"
import { Suspense } from "react"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Nowhile - Lightning Fast P2P File Transfer",
  description:
    "Secure, direct peer-to-peer file sharing with end-to-end encryption. No servers, no limits, just instant transfers.",
  generator: "v0.app",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <Suspense fallback={null}>
        <ClientLayout className={`font-sans ${inter.variable} ${jetbrainsMono.variable}`}>
          {children}
          <Analytics />
        </ClientLayout>
      </Suspense>
    </html>
  )
}
