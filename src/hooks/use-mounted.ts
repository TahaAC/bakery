"use client"

import { useEffect, useState } from "react"

/**
 * Returns `true` only after the component has mounted on the client.
 *
 * Use this to gate rendering of any value that differs between server and
 * client — `Date.now()`, `Math.random()`, `toLocaleString()` with the
 * runtime default locale, browser-only APIs, etc. — so the SSR HTML matches
 * the first client render and React doesn't throw a hydration mismatch.
 *
 * Pattern:
 *   const mounted = useMounted()
 *   return <span>{mounted ? formatTime(date) : ""}</span>
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])
  return mounted
}

/**
 * Format a timestamp as HH:MM:SS (24-hour), using a fixed locale so the
 * output is identical on Node.js and the browser.
 *
 * Note: this function is still non-deterministic across server/client if
 * the input `time` differs (e.g. `Date.now()` at module init). Pair it
 * with `useMounted()` for values that may differ.
 */
export function formatTimeHMS(time: number): string {
  // Use en-GB for 24-hour HH:MM:SS formatting — stable across runtimes
  return new Date(time).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
}

/**
 * Format a timestamp as HH:MM (24-hour), using a fixed locale.
 */
export function formatTimeHM(time: number): string {
  return new Date(time).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

/**
 * Format a date as "Oct 24, 2026" using a fixed locale.
 */
export function formatDateShort(date: number | Date): string {
  const d = typeof date === "number" ? new Date(date) : date
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}
