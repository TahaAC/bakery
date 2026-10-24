"use client"

import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Droplets, Sparkles, SprayCan, Brush, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useKitchen, type CleanState } from "@/lib/kitchen-store"

const STATE_LABEL: Record<CleanState, string> = {
  dirty: "Dirty",
  soapy: "Soapy",
  rinsing: "Rinsing",
  clean: "Clean",
}

const STATE_COLOR: Record<CleanState, string> = {
  dirty: "#8b3a18",
  soapy: "#d4904f",
  rinsing: "#7FBED6",
  clean: "#5a8a3a",
}

export function SinkStation() {
  const utensils = useKitchen((s) => s.utensils)
  const waterOn = useKitchen((s) => s.waterOn)
  const soapApplied = useKitchen((s) => s.soapApplied)
  const scrubLevel = useKitchen((s) => s.scrubLevel)
  const toggleWater = useKitchen((s) => s.toggleWater)
  const applySoap = useKitchen((s) => s.applySoap)
  const scrub = useKitchen((s) => s.scrub)
  const resetUtensils = useKitchen((s) => s.resetUtensils)
  const pushLog = useKitchen((s) => s.pushLog)

  const rafRef = useRef<number | null>(null)
  const lastTick = useRef(0)

  // Auto-scrub loop while water + soap active and pointer is "held" via state
  useEffect(() => {
    if (!waterOn || !soapApplied) return
    lastTick.current = performance.now()
    const loop = (now: number) => {
      const dt = (now - lastTick.current) / 1000
      lastTick.current = now
      scrub(0.6 * dt) // ~1.7s per utensil
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [waterOn, soapApplied, scrub])

  const dirtyCount = utensils.filter((u) => u.state !== "clean").length
  const activeUtensil = utensils.find((u) => u.state !== "clean")

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-4 h-full">
      {/* Left: sink visualization */}
      <div className="flex flex-col items-center gap-4 min-h-0">
        <div className="relative w-full flex-1 min-h-[400px] rounded-xl border border-border bg-gradient-to-b from-[#3a4a55] to-[#1a2530] overflow-hidden flex items-end justify-center pb-6">
          {/* Ambient overhead light */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 50% 40% at 50% 10%, rgba(255,240,200,0.25), transparent 70%)",
            }}
          />

          <SinkSVG
            waterOn={waterOn}
            soapApplied={soapApplied}
            scrubLevel={scrubLevel}
            utensils={utensils}
          />

          {/* Top status */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <Badge variant="secondary" className="backdrop-blur-sm bg-card/90">
              <Droplets className={`w-3 h-3 mr-1 ${waterOn ? "text-primary" : "text-muted-foreground"}`} />
              Water {waterOn ? "On" : "Off"}
            </Badge>
            <Badge variant="secondary" className="backdrop-blur-sm bg-card/90">
              {dirtyCount === 0 ? (
                <span className="text-green-700">All clean ✓</span>
              ) : (
                <>{dirtyCount} item{dirtyCount === 1 ? "" : "s"} to wash</>
              )}
            </Badge>
          </div>
        </div>

        {/* Control panel */}
        <div className="w-full rounded-lg border border-border bg-card p-4 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={toggleWater}
              variant={waterOn ? "default" : "outline"}
              className="flex flex-col items-center gap-1 h-auto py-3"
            >
              <Droplets className="w-5 h-5" />
              <span className="text-xs">{waterOn ? "Water On" : "Water Off"}</span>
            </Button>
            <Button
              onClick={applySoap}
              disabled={!waterOn || soapApplied}
              variant={soapApplied ? "secondary" : "outline"}
              className="flex flex-col items-center gap-1 h-auto py-3"
            >
              <SprayCan className="w-5 h-5" />
              <span className="text-xs">{soapApplied ? "Soaped" : "Apply Soap"}</span>
            </Button>
            <Button
              onClick={resetUtensils}
              variant="outline"
              className="flex flex-col items-center gap-1 h-auto py-3"
            >
              <Brush className="w-5 h-5" />
              <span className="text-xs">Reset</span>
            </Button>
          </div>

          {waterOn && soapApplied && activeUtensil && (
            <div className="rounded-md bg-accent/10 border border-accent/40 p-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">Scrubbing: {activeUtensil.name}</span>
                <span className="font-mono text-primary">{Math.round(scrubLevel * 100)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted mt-1.5 overflow-hidden">
                <motion.div
                  className="h-full"
                  style={{ background: "linear-gradient(90deg, var(--primary), var(--accent))" }}
                  animate={{ width: `${scrubLevel * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5">
                Active wash in progress — suds lifting soil. Next item loads automatically.
              </p>
            </div>
          )}

          {dirtyCount === 0 && (
            <div className="rounded-md bg-green-50 border border-green-200 p-2.5 text-center">
              <CheckCircle2 className="w-4 h-4 mx-auto text-green-600" />
              <p className="text-xs text-green-700 mt-1 font-medium">
                All utensils clean. Sanitization complete.
              </p>
            </div>
          )}

          {!waterOn && (
            <p className="text-xs text-muted-foreground text-center">
              Turn on the water to begin washing.
            </p>
          )}
          {waterOn && !soapApplied && (
            <p className="text-xs text-muted-foreground text-center">
              Apply soap to start scrubbing.
            </p>
          )}
        </div>
      </div>

      {/* Right: utensil inventory */}
      <div className="border border-border rounded-lg bg-card p-4 flex flex-col gap-3 min-h-0 overflow-y-auto kitchen-scrollbar">
        <div>
          <h3 className="text-sm font-semibold mb-1">Utensil Tray</h3>
          <p className="text-xs text-muted-foreground">
            Each bake soils your tools. Wash between steps to keep the kitchen sanitary.
          </p>
        </div>

        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {utensils.map((u) => (
              <motion.div
                key={u.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-center gap-3 rounded-md border border-border/60 bg-card px-3 py-2"
              >
                <div className="w-10 h-10 rounded-md bg-muted/40 flex items-center justify-center text-xl">
                  {u.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{u.name}</div>
                  <div className="text-[11px] text-muted-foreground">{STATE_LABEL[u.state]}</div>
                </div>
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: STATE_COLOR[u.state] }}
                  title={STATE_LABEL[u.state]}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Soap suds visualization when active */}
        {waterOn && soapApplied && (
          <div className="rounded-md bg-muted/40 p-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold mb-1">
              <Sparkles className="w-3 h-3 text-primary" /> Active Suds
            </div>
            <div className="relative h-12 overflow-hidden rounded bg-gradient-to-b from-white/30 to-transparent">
              {Array.from({ length: 18 }).map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute rounded-full bg-white/60"
                  style={{
                    left: `${(i * 17) % 90 + 5}%`,
                    bottom: `${(i * 7) % 30}%`,
                    width: 4 + (i % 4) * 2,
                    height: 4 + (i % 4) * 2,
                  }}
                  animate={{
                    y: [0, -6, 0],
                    opacity: [0.4, 0.8, 0.4],
                  }}
                  transition={{
                    duration: 1 + (i % 3) * 0.4,
                    repeat: Infinity,
                    delay: i * 0.08,
                  }}
                />
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">
              Surfactant molecules breaking down fats and starches.
            </p>
          </div>
        )}

        {/* Educational note */}
        <div className="mt-auto pt-3 border-t border-border">
          <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
            <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
            <p>
              Cross-contamination is real. Always wash between raw flour, eggs, and ready-to-eat components.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function SinkSVG({
  waterOn,
  soapApplied,
  scrubLevel,
  utensils,
}: {
  waterOn: boolean
  soapApplied: boolean
  scrubLevel: number
  utensils: { id: string; name: string; emoji: string; state: CleanState }[]
}) {
  return (
    <svg viewBox="0 0 480 320" className="w-full max-w-[480px] h-auto" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sinkBasin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9aa5ad" />
          <stop offset="50%" stopColor="#c0c8cd" />
          <stop offset="100%" stopColor="#7a8389" />
        </linearGradient>
        <linearGradient id="counterTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a2a1a" />
          <stop offset="100%" stopColor="#1a120c" />
        </linearGradient>
        <radialGradient id="waterDrop" cx="0.5" cy="0.4" r="0.6">
          <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
          <stop offset="100%" stopColor="rgba(120,180,200,0.7)" />
        </radialGradient>
      </defs>

      {/* Counter top */}
      <rect x="0" y="40" width="480" height="280" fill="url(#counterTop)" />
      {/* Counter highlight */}
      <rect x="0" y="40" width="480" height="3" fill="rgba(255,255,255,0.15)" />

      {/* Faucet */}
      <rect x="220" y="20" width="40" height="40" rx="3" fill="url(#sinkBasin)" />
      <path d="M 240 60 Q 240 80 260 80 L 280 80" stroke="url(#sinkBasin)" strokeWidth="8" fill="none" strokeLinecap="round" />
      {/* Faucet handle */}
      <circle cx="240" cy="30" r="8" fill="url(#sinkBasin)" />
      <rect x="237" y="22" width="6" height="6" fill="#5a4a3a" />

      {/* Water stream */}
      {waterOn && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <rect x="276" y="80" width="8" height="100" fill="url(#waterDrop)" opacity="0.85" />
          {/* Droplets */}
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.circle
              key={i}
              cx={280}
              cy={90}
              r={2}
              fill="rgba(255,255,255,0.9)"
              animate={{ cy: [90, 180], opacity: [0.9, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
            />
          ))}
        </motion.g>
      )}

      {/* Sink basin */}
      <ellipse cx="240" cy="200" rx="180" ry="50" fill="#1a120c" />
      <ellipse cx="240" cy="195" rx="180" ry="50" fill="url(#sinkBasin)" />
      {/* Basin rim shadow */}
      <ellipse cx="240" cy="195" rx="180" ry="50" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="2" />
      {/* Basin interior */}
      <ellipse cx="240" cy="200" rx="165" ry="42" fill="#1a1a1a" />

      {/* Water level in basin when water on */}
      {waterOn && (
        <motion.ellipse
          cx="240"
          cy="200"
          rx="160"
          ry="38"
          fill="rgba(120,180,200,0.6)"
          initial={{ opacity: 0.4, ry: 30 }}
          animate={{ opacity: 0.8, ry: 38 }}
          transition={{ duration: 1 }}
        >
          {/* Ripples */}
        </motion.ellipse>
      )}

      {/* Water ripples */}
      {waterOn && (
        <>
          {[0, 1, 2].map((i) => (
            <motion.ellipse
              key={i}
              cx="280"
              cy="200"
              rx="20"
              ry="6"
              fill="none"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="1"
              animate={{ rx: [20, 60], ry: [6, 18], opacity: [0.7, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.6 }}
            />
          ))}
        </>
      )}

      {/* Soap suds overlay */}
      {soapApplied && (
        <g>
          {Array.from({ length: 16 }).map((_, i) => (
            <motion.circle
              key={i}
              cx={120 + (i * 23) % 220}
              cy={195 + (i % 3) * 6}
              r={4 + (i % 3) * 2}
              fill="rgba(255,255,255,0.7)"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="0.5"
              animate={{ cy: [195 + (i % 3) * 6, 190 + (i % 3) * 6, 195 + (i % 3) * 6], opacity: [0.6, 0.9, 0.6] }}
              transition={{ duration: 1 + (i % 3) * 0.3, repeat: Infinity, delay: i * 0.1 }}
            />
          ))}
        </g>
      )}

      {/* Utensils in basin (only dirty/soapy ones sit in the sink) */}
      {utensils
        .filter((u) => u.state !== "clean")
        .slice(0, 4)
        .map((u, i) => (
          <g key={u.id} transform={`translate(${80 + i * 80}, 180)`}>
            <text textAnchor="middle" fontSize="36" y="20">
              {u.emoji}
            </text>
            {/* Scrubbing indicator */}
            {soapApplied && waterOn && i === 0 && (
              <motion.g
                animate={{ rotate: [0, 30, -30, 0] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                style={{ transformOrigin: "0px 10px" }}
              >
                <rect x="-6" y="-2" width="12" height="14" rx="2" fill="#e5a23b" />
                <text textAnchor="middle" fontSize="10" y="9" fill="#2a1f17">🧽</text>
              </motion.g>
            )}
          </g>
        ))}
    </svg>
  )
}
