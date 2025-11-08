"use client"
import { useIsMobile as useMobileUtility } from "@/lib/mobile-utils"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const isMobile = useMobileUtility()

  return !!isMobile
}
