"use client"

import React from "react"

const MOBILE_BREAKPOINT = 768

export function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false

  return (
    window.innerWidth < MOBILE_BREAKPOINT ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    "ontouchstart" in window
  )
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(isMobileDevice())

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return !!isMobile
}
