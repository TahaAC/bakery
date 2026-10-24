"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Play, Pause, Power, Gauge, Hand, Wheat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { useKitchen, bowlLayers } from "@/lib/kitchen-store"

export function StandMixerStation() {
  const bowl = useKitchen((s) => s.bowl)
  const mixLevel = useKitchen((s) => s.mixLevel)
  const isMixerOn = useKitchen((s) => s.isMixerOn)
  const mixerSpeed = useKitchen((s) => s.mixerSpeed)
  const kneadLevel = useKitchen((s) => s.kneadLevel)
  const doughFormed = useKitchen((s) => s.doughFormed)
  const setMixerSpeed = useKitchen((s) => s.setMixerSpeed)
  const setMixerOn = useKitchen((s) => s.setMixerOn)
  const incrementKnead = useKitchen((s) => s.incrementKnead)
  const incrementMix = useKitchen((s) => s.incrementMix)
  const pushLog = useKitchen((s) => s.pushLog)

  const lastTickRef = useRef(0)
  const rafRef = useRef<number | null>(null)

  const layers = bowlLayers(bowl)
  const hasFlour = layers.some((l) => l.ingredient.id.includes("flour"))
  const hasWet = layers.some((l) => ["liquid", "emulsion", "viscous"].includes(l.ingredient.state))
  const canFormDough = hasFlour && hasWet

  useEffect(() => {
    if (!isMixerOn) return
    lastTickRef.current = performance.now()

    const loop = (now: number) => {
      const dt = (now - lastTickRef.current) / 1000
      lastTickRef.current = now

      // Knead develops gluten only if flour + wet present
      if (canFormDough) {
        const rate = 0.025 * (mixerSpeed / 5) * dt
        incrementKnead(rate)
        // Also mixes the bowl contents
        incrementMix(0.04 * (mixerSpeed / 5) * dt)
      } else {
        // Just mixes
        incrementMix(0.05 * (mixerSpeed / 5) * dt)
      }

      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isMixerOn, mixerSpeed, canFormDough, incrementKnead, incrementMix])

  const handleToggle = () => {
    if (bowl.length === 0) {
      pushLog("Mixer bowl is empty — nothing to mix", "warning")
      return
    }
    setMixerOn(!isMixerOn)
  }

  const kneadPercent = Math.round(kneadLevel * 100)
  const glutenLabel = kneadLevel < 0.15 ? "Shaggy" : kneadLevel < 0.4 ? "Rough" : kneadLevel < 0.7 ? "Elastic" : kneadLevel < 0.95 ? "Silky" : "Fully developed"

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-4 h-full">
      {/* Left: mixer visualization */}
      <div className="flex flex-col items-center gap-4 min-h-0">
        <div
          className="relative w-full flex-1 min-h-[380px] rounded-xl border border-border overflow-hidden flex items-end justify-center pb-6"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 35%, #3a2818 0%, #1a1410 50%, #0a0804 100%)",
          }}
        >
          {/* Counter top */}
          <div
            className="absolute inset-x-0 bottom-0 h-1/4 opacity-70"
            style={{
              background:
                "linear-gradient(180deg, transparent 0%, rgba(60, 40, 25, 0.7) 50%, rgba(30, 20, 12, 0.95) 100%)",
            }}
          />
          {/* Atmospheric depth */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 50% at 50% 40%, transparent 0%, transparent 60%, rgba(0, 0, 0, 0.5) 100%)",
            }}
          />
          {/* Ambient spot light */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 40% at 50% 30%, rgba(255,220,160,0.18), transparent 70%)",
            }}
          />

          <StandMixerSVG
            running={isMixerOn}
            speed={mixerSpeed}
            doughFormed={doughFormed}
            mixColor={layers.length > 0 ? layers.reduce((acc, l) => {
              const hex = l.ingredient.color
              const r = parseInt(hex.slice(1, 3), 16)
              const g = parseInt(hex.slice(3, 5), 16)
              const b = parseInt(hex.slice(5, 7), 16)
              const w = l.grams / Math.max(1, layers.reduce((a, l) => a + l.grams, 0))
              acc.r += r * w
              acc.g += g * w
              acc.b += b * w
              return acc
            }, { r: 0, g: 0, b: 0 }) : { r: 200, g: 180, b: 140 }}
            doughAmount={Math.min(1, layers.reduce((a, l) => a + l.grams, 0) / 600)}
            kneadLevel={kneadLevel}
          />

          {/* Status badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <Badge variant="secondary" className="backdrop-blur-sm bg-card/90">
              <Power className={`w-3 h-3 mr-1 ${isMixerOn ? "text-primary" : "text-muted-foreground"}`} />
              {isMixerOn ? "Running" : "Standby"}
            </Badge>
            <Badge variant="secondary" className="backdrop-blur-sm bg-card/90">
              <Gauge className="w-3 h-3 mr-1" />
              {mixerSpeed.toFixed(1)} / 10
            </Badge>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full rounded-lg border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Gauge className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium flex-1">Mixer speed</span>
            <span className="text-xs font-mono text-primary">{mixerSpeed.toFixed(1)} / 10</span>
          </div>
          <Slider
            value={[mixerSpeed]}
            onValueChange={(v) => setMixerSpeed(v[0])}
            min={0.5}
            max={10}
            step={0.5}
          />
          <Button onClick={handleToggle} className="w-full" variant={isMixerOn ? "destructive" : "default"}>
            {isMixerOn ? (
              <>
                <Pause className="w-4 h-4 mr-1.5" /> Stop mixer
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-1.5" /> Start mixer
              </>
            )}
          </Button>
          {!canFormDough && bowl.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Without both flour and a wet ingredient, the mixer will only blend — it cannot develop gluten.
            </p>
          )}
          {bowl.length === 0 && (
            <p className="text-xs text-muted-foreground text-center">
              Add ingredients from the Pantry first.
            </p>
          )}
        </div>
      </div>

      {/* Right: gluten development panel */}
      <div className="border border-border rounded-lg bg-card p-4 flex flex-col gap-3 min-h-0 overflow-y-auto kitchen-scrollbar">
        <div>
          <h3 className="text-sm font-semibold mb-1 flex items-center gap-1.5">
            <Wheat className="w-4 h-4 text-primary" /> Gluten Development
          </h3>
          <p className="text-xs text-muted-foreground">
            Agitation aligns glutenin & gliadin strands into an elastic network that traps fermentation gases.
          </p>
        </div>

        {/* Gluten progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Knead progress</span>
            <span className="font-mono">{kneadPercent}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full"
              style={{ background: "linear-gradient(90deg, #c9a779, #b8602b)" }}
              animate={{ width: `${kneadPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-xs text-muted-foreground italic">{glutenLabel} dough.</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-md bg-muted/40 px-2 py-1.5">
            <div className="text-muted-foreground">Dough formed</div>
            <div className={`font-mono ${doughFormed ? "text-primary" : "text-muted-foreground"}`}>
              {doughFormed ? "YES" : "NOT YET"}
            </div>
          </div>
          <div className="rounded-md bg-muted/40 px-2 py-1.5">
            <div className="text-muted-foreground">Bowl mass</div>
            <div className="font-mono">{bowl.reduce((a, b) => a + b.grams, 0)}g</div>
          </div>
        </div>

        {/* Windowpane test indicator */}
        <div className="rounded-md border border-border p-2.5">
          <div className="text-xs font-semibold mb-1">Windowpane Test</div>
          <div className="text-[11px] text-muted-foreground leading-relaxed">
            A small piece of dough stretched thin until light passes through. Passes around 80% knead.
          </div>
          <div className="mt-1.5 text-xs">
            {kneadLevel >= 0.8 ? (
              <span className="text-primary font-semibold">✓ Would pass — dough is ready</span>
            ) : kneadLevel >= 0.5 ? (
              <span className="text-accent-foreground">Partially developed — keep kneading</span>
            ) : (
              <span className="text-muted-foreground">Not yet — dough would tear</span>
            )}
          </div>
        </div>

        <div className="mt-auto pt-3 border-t border-border text-[11px] text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <Hand className="w-3 h-3" />
            Tip: Low speeds (1–3) incorporate; higher speeds (6–10) develop gluten. Over-kneading tears strands.
          </p>
        </div>
      </div>
    </div>
  )
}

function StandMixerSVG({
  running,
  speed,
  doughFormed,
  mixColor,
  doughAmount,
  kneadLevel,
}: {
  running: boolean
  speed: number
  doughFormed: boolean
  mixColor: { r: number; g: number; b: number }
  doughAmount: number
  kneadLevel: number
}) {
  const colorHex = `#${Math.round(mixColor.r).toString(16).padStart(2, "0")}${Math.round(mixColor.g).toString(16).padStart(2, "0")}${Math.round(mixColor.b).toString(16).padStart(2, "0")}`
  const rotationDur = running ? Math.max(0.1, 1.5 - speed * 0.13) : 0

  return (
    <svg viewBox="0 0 320 360" className="h-full max-h-[400px]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="steel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3a3a3a" />
          <stop offset="20%" stopColor="#8a8a8a" />
          <stop offset="40%" stopColor="#cdcdcd" />
          <stop offset="60%" stopColor="#7a7a7a" />
          <stop offset="80%" stopColor="#a5a5a5" />
          <stop offset="100%" stopColor="#4a4a4a" />
        </linearGradient>
        <linearGradient id="bowlInterior" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a0f08" />
          <stop offset="100%" stopColor="#3a2515" />
        </linearGradient>
        <radialGradient id="bowlHighlight" cx="0.35" cy="0.3" r="0.6">
          <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <linearGradient id="doughGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colorHex} />
          <stop offset="100%" stopColor={`${colorHex}cc`} />
        </linearGradient>
      </defs>

      {/* Base / pedestal */}
      <rect x="40" y="290" width="240" height="50" rx="6" fill="url(#steel)" />
      <rect x="40" y="290" width="240" height="6" rx="3" fill="rgba(255,255,255,0.25)" />
      <rect x="60" y="320" width="200" height="20" rx="3" fill="#2a2a2a" />

      {/* Speed control dial on base */}
      <circle cx="240" cy="315" r="14" fill="#1a1a1a" stroke="#5a5a5a" strokeWidth="1" />
      <motion.g
        style={{ transformOrigin: "240px 315px" }}
        animate={running ? { rotate: 360 } : { rotate: speed * 36 }}
        transition={running ? { duration: rotationDur, repeat: Infinity, ease: "linear" } : { duration: 0.3 }}
      >
        <line x1="240" y1="305" x2="240" y2="312" stroke="#e5a23b" strokeWidth="2" />
      </motion.g>

      {/* Vertical column / motor head */}
      <path
        d="M 100 290 L 100 130 Q 100 100 130 100 L 200 100 Q 230 100 230 130 L 230 290 Z"
        fill="url(#steel)"
      />
      {/* Brand badge */}
      <rect x="140" y="160" width="50" height="22" rx="3" fill="#1a1a1a" />
      <text x="165" y="175" textAnchor="middle" fontSize="9" fill="#e5a23b" fontFamily="monospace" fontWeight="bold">MASTER</text>

      {/* Motor head top */}
      <ellipse cx="165" cy="100" rx="65" ry="14" fill="url(#steel)" />
      <ellipse cx="165" cy="98" rx="65" ry="6" fill="rgba(255,255,255,0.2)" />

      {/* Attachment mount */}
      <rect x="155" y="110" width="20" height="30" rx="2" fill="#2a2a2a" />
      <circle cx="165" cy="140" r="6" fill="#5a5a5a" />

      {/* Dough hook / whisk attachment */}
      <motion.g
        style={{ transformOrigin: "165px 140px" }}
        animate={running ? { rotate: 360 } : { rotate: 0 }}
        transition={running ? { duration: rotationDur, repeat: Infinity, ease: "linear" } : { duration: 0.3 }}
      >
        {doughFormed ? (
          // Dough hook
          <path
            d="M 165 140 Q 165 180 175 200 Q 155 215 175 230 Q 155 245 165 260"
            stroke="#c0c0c0"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        ) : (
          // Flat beater
          <path
            d="M 152 145 L 178 145 L 175 230 L 155 230 Z"
            fill="#c0c0c0"
            stroke="#8a8a8a"
            strokeWidth="1"
          />
        )}
      </motion.g>

      {/* Bowl (sits on pedestal) */}
      <path
        d="M 80 250 Q 80 290 165 290 Q 250 290 250 250 L 240 240 Q 240 275 165 275 Q 90 275 90 240 Z"
        fill="url(#steel)"
      />
      {/* Bowl interior */}
      <ellipse cx="165" cy="240" rx="78" ry="16" fill="url(#bowlInterior)" />
      <ellipse cx="165" cy="240" rx="78" ry="16" fill="url(#bowlHighlight)" />

      {/* Dough contents */}
      {doughAmount > 0.05 && (
        <motion.ellipse
          cx="165"
          cy="240"
          rx={75 * (0.5 + doughAmount * 0.5)}
          ry={14 * (0.5 + doughAmount * 0.5)}
          fill="url(#doughGrad)"
          animate={running ? { cy: [240, 238, 240] } : {}}
          transition={running ? { duration: 0.4 / Math.max(0.5, speed / 3), repeat: Infinity } : {}}
          className={running ? "knead-pulse" : ""}
          style={{ transformOrigin: "165px 240px" }}
        />
      )}

      {/* Dough formed indicator */}
      {doughFormed && (
        <motion.ellipse
          cx="165"
          cy="232"
          rx="40"
          ry="14"
          fill={colorHex}
          animate={running ? { ry: [14, 17, 14], cx: [165, 158, 172, 165] } : {}}
          transition={running ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } : {}}
          style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))" }}
        />
      )}

      {/* Bowl rim highlight */}
      <ellipse cx="165" cy="240" rx="78" ry="3" fill="rgba(255,255,255,0.4)" />

      {/* Handle */}
      <rect x="250" y="245" width="22" height="6" rx="3" fill="url(#steel)" />
    </svg>
  )
}
