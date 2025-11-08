"use client"

import { useState, useEffect } from "react"
import { Globe, Clock, Shield, Lock, Users, Heart, Github, Mail, Activity, Zap, Server } from "lucide-react"
import Link from "next/link"

export function AppFooter() {
  const [currentTime, setCurrentTime] = useState("")
  const [ipAddress, setIpAddress] = useState("Private Network")

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleString())
    }

    updateTime()
    const timeInterval = setInterval(updateTime, 1000)

    return () => clearInterval(timeInterval)
  }, [])

  useEffect(() => {
    const getIPAddress = async () => {
      try {
        const services = ["https://api.ipify.org?format=json", "https://ipapi.co/json/", "https://httpbin.org/ip"]

        for (const service of services) {
          try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 3000)

            const response = await fetch(service, {
              signal: controller.signal,
              headers: {
                Accept: "application/json",
              },
            })

            clearTimeout(timeoutId)

            if (response.ok) {
              const data = await response.json()
              const ip = data.ip || data.origin || "Private Network"
              setIpAddress(ip)
              return
            }
          } catch (serviceError) {
            continue
          }
        }

        setIpAddress("Local Network")
      } catch (error) {
        setIpAddress("Local Network")
      }
    }

    if (typeof window !== "undefined") {
      getIPAddress()
    }
  }, [])

  return (
    <footer className="py-4 px-6 mt-auto border-t border-slate-800 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-emerald-500/15 rounded-lg border border-emerald-500/20">
                <Activity className="h-4 w-4 text-emerald-400" />
              </div>
              <h3 className="text-sm font-semibold text-white">Status</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg border border-slate-700/50 bg-slate-900/50 hover:bg-slate-800/70 transition-all duration-200">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-slate-400" />
                  <span className="text-slate-300">Time:</span>
                </div>
                <span className="font-mono text-xs px-2 py-1 rounded bg-slate-800 text-emerald-300 border border-slate-600/50">
                  {currentTime}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg border border-slate-700/50 bg-slate-900/50 hover:bg-slate-800/70 transition-all duration-200">
                <div className="flex items-center gap-1">
                  <Globe className="h-3 w-3 text-slate-400" />
                  <span className="text-slate-300">IP:</span>
                </div>
                <span className="font-mono text-xs px-2 py-1 rounded bg-slate-800 text-blue-300 border border-slate-600/50">
                  {ipAddress}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-blue-500/15 rounded-lg border border-blue-500/20">
                <Shield className="h-4 w-4 text-blue-400" />
              </div>
              <h3 className="text-sm font-semibold text-gray-100">Security</h3>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-900/50 transition-all duration-200">
                <div className="p-1 bg-emerald-500/15 rounded">
                  <Lock className="h-3 w-3 text-emerald-400" />
                </div>
                <span className="text-gray-100">End-to-end encryption</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-900/50 transition-all duration-200">
                <div className="p-1 bg-blue-500/15 rounded">
                  <Users className="h-3 w-3 text-blue-400" />
                </div>
                <span className="text-gray-100">Direct P2P connections</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-900/50 transition-all duration-200">
                <div className="p-1 bg-amber-500/15 rounded">
                  <Server className="h-3 w-3 text-amber-400" />
                </div>
                <span className="text-gray-100">No server storage</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-rose-500/15 rounded-lg border border-rose-500/20">
                <Heart className="h-4 w-4 text-rose-400" />
              </div>
              <h3 className="text-sm font-semibold text-white">About</h3>
            </div>
            <p className="text-xs leading-relaxed text-slate-300 mb-2">
              nowhile is a secure, privacy-first file sharing platform built with modern WebRTC technology.
            </p>
            <div className="flex items-center gap-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-300 hover:text-blue-200 transition-all duration-200 p-1.5 rounded hover:bg-blue-900/30 border border-blue-500/30 hover:border-blue-400/50"
              >
                <Github className="h-3 w-3" />
                <span className="text-xs">Source</span>
              </a>
              <a
                href="mailto:support@nowhile.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-emerald-300 hover:text-emerald-200 transition-all duration-200 p-1.5 rounded hover:bg-emerald-900/30 border border-emerald-500/30 hover:border-emerald-400/50"
              >
                <Mail className="h-3 w-3" />
                <span className="text-xs">Support</span>
              </a>
            </div>
          </div>

          <div className="space-y-2"></div>
        </div>

        <div className="border-t border-slate-700/50 pt-3 md:hidden">
          <div className="text-center space-y-2">
            <div className="text-xs text-slate-400">© 2025 nowhile.com. All rights reserved.</div>
            <div className="text-xs text-slate-500">Secure file sharing without compromise</div>
            <div className="flex items-center justify-center gap-1 text-xs text-slate-400">
              <Zap className="h-3 w-3 text-emerald-400" />
              <span>Powered by nowhile</span>
            </div>
            <div className="flex items-center justify-center gap-1 text-xs text-slate-400">
              <span>Made with</span>
              <Heart className="h-3 w-3 text-rose-400" />
              <span>
                by <span className="text-cyan-300 font-semibold">Ansh</span>
              </span>
            </div>
            <div className="flex items-center justify-center gap-4 text-xs mt-3 pt-3 border-t border-slate-700/50">
              <Link
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-blue-200 transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-blue-200 transition-colors"
              >
                Privacy
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700/50 pt-3 hidden md:block">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-2 text-xs mb-2">
            <div className="flex flex-col sm:flex-row items-center gap-2 text-slate-400">
              <span>© {new Date().getFullYear()} nowhile.com. All rights reserved.</span>
              <span className="text-slate-500 flex items-center gap-1">
                <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                Secure file sharing without compromise
              </span>
            </div>
            <div className="flex items-center gap-1 text-slate-400 px-2 py-1 rounded bg-slate-900/30 border border-slate-700/30">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <Zap className="h-3 w-3 text-emerald-400" />
              <span className="text-xs">Powered by nowhile</span>
            </div>
          </div>

          <div className="text-center py-2 border-t border-slate-700/50">
            <div className="flex items-center justify-center gap-1 text-slate-400 mb-1 text-xs">
              <span>Made with</span>
              <Heart className="h-3 w-3 text-rose-400 animate-pulse" />
              <span>
                by <span className="text-cyan-300 font-semibold">Ansh</span>
              </span>
            </div>
            <div className="flex items-center justify-center gap-4 text-slate-500 text-xs mb-3">
              <Link
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-300 transition-colors"
              >
                Terms of Service
              </Link>
              <span className="text-slate-600">•</span>
              <Link
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-300 transition-colors"
              >
                Privacy Policy
              </Link>
            </div>
            <p className="text-xs text-slate-500 max-w-2xl mx-auto">
              This service is provided "as-is" without warranties of any kind. Users are solely responsible for all file
              transfers, content shared, and compliance with applicable laws. Use discretion when sharing sensitive
              information.
              <br />
              <b>fil</b> - file without "e" means file sharing without any end,errors & exception :)
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
