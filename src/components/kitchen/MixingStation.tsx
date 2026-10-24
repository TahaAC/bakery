"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, RotateCcw, Gauge, Sparkles, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { BowlView } from "./BowlView"
import { useKitchen, bowlLayers } from "@/lib/kitchen-store"
import { findScienceNote } from "@/lib/science"

export function MixingStation() {
  const bowl = useKitchen((s) => s.bowl)
  const mixLevel = useKitchen((s) => s.mixLevel)
  const isMixing = useKitchen((s) => s.isMixing)
  const mixSpeed = useKitchen((s) => s.mixSpeed)
  const startMixing = useKitchen((s) => s.startMixing)
  const stopMixing = useKitchen((s) => s.stopMixing)
  const incrementMix = useKitchen((s) => s.incrementMix)
  const clearBowl = useKitchen((s) => s.clearBowl)
  const pushLog = useKitchen((s) => s.pushLog)

  const [speed, setSpeed] = useState(3)
  const lastTickRef = useRef<number>(0)
  const rafRef = useRef<number | null>(null)

  // Mixing loop: increases mixLevel based on speed and bowl wetness
  useEffect(() => {
    if (!isMixing) return
    lastTickRef.current = performance.now()

    const loop = (now: number) => {
      const dt = (now - lastTickRef.current) / 1000
      lastTickRef.current = now

      // Wetter bowls mix faster. Dry powders mix slowly.
      const layers = bowlLayers(bowl)
      const hasWet = layers.some((l) => ["liquid", "viscous", "emulsion"].includes(l.ingredient.state))
      const baseRate = hasWet ? 0.06 : 0.018
      const delta = baseRate * (speed / 5) * dt
      incrementMix(delta)

      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isMixing, speed, bowl, incrementMix])

  const handleStart = () => startMixing(speed)
  const handleStop = () => stopMixing()

  // Science hint based on bowl contents
  const layers = bowlLayers(bowl)
  const hasFlour = layers.some((l) => l.ingredient.id.includes("flour"))
  const hasYeast = layers.some((l) => l.ingredient.id === "yeast")
  const hasBakingSoda = layers.some((l) => l.ingredient.id === "baking-soda")
  const hasButter = layers.some((l) => l.ingredient.id === "butter")
  const hasEgg = layers.some((l) => l.ingredient.id.includes("egg"))

  const scienceHints: { title: string; trigger: string }[] = []
  if (hasFlour && layers.some((l) => ["liquid", "emulsion", "viscous"].includes(l.ingredient.state))) {
    scienceHints.push({ title: "Gluten is developing", trigger: "gluten" })
  }
  if (hasYeast) scienceHints.push({ title: "Yeast is activating", trigger: "yeast" })
  if (hasBakingSoda) scienceHints.push({ title: "Baking soda needs acid", trigger: "baking-soda" })
  if (hasButter) scienceHints.push({ title: "Butter coats the flour", trigger: "butter" })
  if (hasEgg) scienceHints.push({ title: "Eggs are emulsifying", trigger: "egg" })

  const mixPercent = Math.round(mixLevel * 100)
  const mixLabel = mixLevel < 0.15 ? "Streaky" : mixLevel < 0.4 ? "Partially combined" : mixLevel < 0.7 ? "Mostly uniform" : mixLevel < 0.95 ? "Smooth batter" : "Fully homogenized"

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-4 h-full">
      {/* Left: bowl + controls */}
      <div className="flex flex-col items-center justify-start gap-4 min-h-0">
        {/* Stage with sunbeam ambient */}
        <div
          className="relative w-full flex-1 min-h-[360px] rounded-xl border border-border overflow-hidden flex items-center justify-center"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 30%, #fff8e8 0%, #fff0d0 30%, #f0dca8 65%, #c89858 100%)",
            boxShadow: "inset 0 0 60px rgba(120, 80, 40, 0.15), inset 0 8px 16px rgba(255,255,255,0.5)",
          }}
        >
          {/* HD Counter top surface */}
          <div
            className="absolute inset-x-0 bottom-0 h-1/4"
            style={{
              background:
                "linear-gradient(180deg, transparent 0%, rgba(180, 130, 70, 0.25) 50%, rgba(100, 60, 25, 0.55) 100%)",
            }}
          />
          {/* HD Atmospheric vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 50% at 50% 40%, transparent 0%, transparent 60%, rgba(80, 50, 20, 0.25) 100%)",
            }}
          />
          <div className="absolute inset-0 sunbeam" />
          {/* Flour dust particles while mixing */}
          {isMixing && speed > 4 && (
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 14 }).map((_, i) => (
                <span
                  key={i}
                  className="flour-particle"
                  style={{
                    left: `${30 + Math.random() * 40}%`,
                    top: `${40 + Math.random() * 30}%`,
                    width: `${2 + Math.random() * 3}px`,
                    height: `${2 + Math.random() * 3}px`,
                    ["--dx" as string]: `${(Math.random() - 0.5) * 60}px`,
                    ["--dy" as string]: `${-20 - Math.random() * 30}px`,
                    ["--dur" as string]: `${1 + Math.random() * 1.5}s`,
                    animationDelay: `${Math.random() * 1.5}s`,
                  }}
                />
              ))}
            </div>
          )}

          <BowlView bowl={bowl} mixLevel={mixLevel} size={300} showWhisk={isMixing} whisking={isMixing} />

          {/* Mix level overlay */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <Badge variant="secondary" className="backdrop-blur-sm bg-card/80">
              {isMixing ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
                    className="inline-block w-3 h-3 mr-1"
                  >
                    ◌
                  </motion.span>
                  Whisking at speed {speed.toFixed(1)}
                </>
              ) : (
                <>Idle</>
              )}
            </Badge>
            <Badge className="backdrop-blur-sm bg-card/80 text-foreground">
              Mix: {mixPercent}% — {mixLabel}
            </Badge>
          </div>
        </div>

        {/* Control panel */}
        <div className="w-full rounded-lg border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Gauge className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium flex-1">Whisk speed</span>
            <span className="text-xs font-mono text-primary">{speed.toFixed(1)} / 10</span>
          </div>
          <Slider value={[speed]} onValueChange={(v) => setSpeed(v[0])} min={0.5} max={10} step={0.5} />

          <div className="flex gap-2 pt-1">
            <Button
              onClick={isMixing ? handleStop : handleStart}
              disabled={bowl.length === 0}
              className="flex-1"
              variant={isMixing ? "destructive" : "default"}
            >
              {isMixing ? (
                <>
                  <Pause className="w-4 h-4 mr-1.5" /> Stop whisking
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-1.5" /> Start whisking
                </>
              )}
            </Button>
            <Button variant="outline" onClick={clearBowl} disabled={bowl.length === 0}>
              <RotateCcw className="w-4 h-4 mr-1.5" /> Empty bowl
            </Button>
          </div>

          {bowl.length === 0 && (
            <p className="text-xs text-muted-foreground text-center">
              Visit the Pantry first to add ingredients.
            </p>
          )}
        </div>
      </div>

      {/* Right: live state + science hints */}
      <div className="border border-border rounded-lg bg-card p-4 flex flex-col gap-3 min-h-0 overflow-y-auto kitchen-scrollbar">
        <div>
          <h3 className="text-sm font-semibold mb-1">Bowl State</h3>
          <p className="text-xs text-muted-foreground">
            The bowl holds {bowl.reduce((a, b) => a + b.grams, 0)}g across {bowl.length} ingredient{bowl.length === 1 ? "" : "s"}.
          </p>
        </div>

        {/* Mix progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Homogenization</span>
            <span className="font-mono">{mixPercent}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, var(--primary), var(--accent))`,
              }}
              animate={{ width: `${mixPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-xs text-muted-foreground italic">{mixLabel}.</p>
        </div>

        {/* Science hints */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <Sparkles className="w-3 h-3 text-primary" />
            Live Reactions
          </div>
          <AnimatePresence mode="popLayout">
            {scienceHints.length === 0 ? (
              <motion.p
                key="none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-muted-foreground italic"
              >
                Add ingredients to see real-time chemistry notes.
              </motion.p>
            ) : (
              scienceHints.map((h) => {
                const note = findScienceNote(h.trigger)
                if (!note) return null
                return (
                  <motion.div
                    key={h.trigger}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="rounded-md border border-accent/40 bg-accent/10 p-2.5"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                      <Info className="w-3 h-3" /> {note.title}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                      {note.body}
                    </p>
                    {note.formula && (
                      <div className="mt-1.5 font-mono text-[10px] bg-muted/60 px-1.5 py-1 rounded text-foreground/80">
                        {note.formula}
                      </div>
                    )}
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>
        </div>

        <div className="mt-auto pt-3 border-t border-border text-[11px] text-muted-foreground">
          <p>
            Tip: Heavier, denser ingredients sink; lighter powders float. Speed affects both
            homogenization and how much air you whip in.
          </p>
        </div>
      </div>
    </div>
  )
}
