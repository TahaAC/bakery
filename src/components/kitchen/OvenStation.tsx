"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Power,
  Lightbulb,
  Timer,
  Thermometer,
  Fan,
  Flame,
  Snowflake,
  Play,
  Square,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { BowlView } from "./BowlView"
import { useKitchen, bowlLayers, type OvenMode } from "@/lib/kitchen-store"

const MODES: { id: OvenMode; label: string; icon: typeof Fan; minTemp: number; maxTemp: number; defaultTemp: number }[] = [
  { id: "bake", label: "Bake", icon: Flame, minTemp: 50, maxTemp: 300, defaultTemp: 180 },
  { id: "fan", label: "Fan", icon: Fan, minTemp: 50, maxTemp: 275, defaultTemp: 175 },
  { id: "broil", label: "Broil", icon: Flame, minTemp: 150, maxTemp: 300, defaultTemp: 230 },
  { id: "proof", label: "Proof", icon: Snowflake, minTemp: 30, maxTemp: 60, defaultTemp: 38 },
]

export function OvenStation() {
  const bowl = useKitchen((s) => s.bowl)
  const ovenTempC = useKitchen((s) => s.ovenTempC)
  const ovenMode = useKitchen((s) => s.ovenMode)
  const ovenOn = useKitchen((s) => s.ovenOn)
  const ovenLight = useKitchen((s) => s.ovenLight)
  const ovenTimerSec = useKitchen((s) => s.ovenTimerSec)
  const baking = useKitchen((s) => s.baking)
  const setOvenTemp = useKitchen((s) => s.setOvenTemp)
  const setOvenMode = useKitchen((s) => s.setOvenMode)
  const setOvenOn = useKitchen((s) => s.setOvenOn)
  const toggleOvenLight = useKitchen((s) => s.toggleOvenLight)
  const setOvenTimer = useKitchen((s) => s.setOvenTimer)
  const tickOven = useKitchen((s) => s.tickOven)
  const pushLog = useKitchen((s) => s.pushLog)

  const [timerMin, setTimerMin] = useState(25)
  const rafRef = useRef<number | null>(null)
  const lastTick = useRef(0)

  // Tick oven every 100ms (simulated real-time)
  useEffect(() => {
    if (!ovenOn || baking.status === "done") return
    lastTick.current = performance.now()
    const loop = (now: number) => {
      const dt = (now - lastTick.current) / 1000
      lastTick.current = now
      // 1x speed: 1 real second = 1 simulated second
      tickOven(dt)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [ovenOn, baking.status, tickOven])

  const layers = bowlLayers(bowl)
  const hasBakeable = bowl.length > 0
  const isProofing = ovenMode === "proof"

  const startBake = () => {
    if (!hasBakeable) {
      pushLog("Bowl is empty — nothing to bake", "warning")
      return
    }
    setOvenOn(true)
    setOvenTimer(Math.round(timerMin * 60))
    pushLog("Started bake cycle", "thermal")
    // After preheat, baking.status will transition; we then mark "baking"
    setTimeout(() => {
      useKitchen.setState((s) => ({
        baking: { ...s.baking, status: "baking", progress: 0 },
      }))
    }, 600)
  }

  const stopBake = () => {
    setOvenOn(false)
    pushLog("Stopped bake cycle", "thermal")
  }

  const resetBake = () => {
    useKitchen.setState((s) => ({
      baking: {
        status: "idle",
        progress: 0,
        riseLevel: 0,
        brownLevel: 0,
        donenessLabel: "Raw",
      },
      ovenTimerSec: 0,
      ovenOn: false,
    }))
    pushLog("Oven reset", "thermal")
  }

  const tempC = ovenTempC
  const tempF = Math.round(tempC * 9 / 5 + 32)
  const timerLabel = formatTimer(ovenTimerSec)
  const progressPercent = Math.round(baking.progress * 100)
  const risePercent = Math.round(baking.riseLevel * 100)
  const brownPercent = Math.round(baking.brownLevel * 100)

  const donenessColor =
    baking.brownLevel < 0.3 ? "#e5b95a" :
    baking.brownLevel < 0.6 ? "#b8602b" :
    baking.brownLevel < 0.85 ? "#8b3a18" :
    "#3a1810"

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-4 h-full">
      {/* Left: oven visualization */}
      <div className="flex flex-col items-center gap-4 min-h-0">
        <div
          className="relative w-full flex-1 min-h-[420px] rounded-xl border border-border overflow-hidden flex items-center justify-center"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 30%, #3a2818 0%, #2a1f17 40%, #1a120c 80%, #0a0604 100%)",
          }}
        >
          {/* Counter top surface (subtle wood) */}
          <div
            className="absolute inset-x-0 bottom-0 h-1/3 opacity-60"
            style={{
              background:
                "linear-gradient(180deg, transparent 0%, rgba(74, 40, 24, 0.6) 40%, rgba(40, 22, 12, 0.9) 100%)",
            }}
          />
          {/* HD Atmospheric depth haze */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 50% at 50% 40%, transparent 0%, transparent 50%, rgba(0, 0, 0, 0.4) 100%)",
            }}
          />
          {/* Ambient particles in light */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.span
                key={i}
                className="absolute rounded-full bg-amber-200/30"
                style={{
                  left: `${15 + i * 14}%`,
                  top: `${20 + (i % 3) * 8}%`,
                  width: 1.5 + (i % 2),
                  height: 1.5 + (i % 2),
                }}
                animate={{ y: [0, -30, 0], opacity: [0.2, 0.7, 0.2] }}
                transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }}
              />
            ))}
          </div>
          <OvenSVG
            ovenOn={ovenOn}
            ovenLight={ovenLight}
            ovenMode={ovenMode}
            ovenTempC={ovenTempC}
            hasBakeable={hasBakeable}
            riseLevel={baking.riseLevel}
            brownLevel={baking.brownLevel}
            bowl={bowl}
            mixLevel={useKitchen.getState().mixLevel}
            isProofing={isProofing && ovenOn}
          />

          {/* Top status badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
            <Badge variant="secondary" className="backdrop-blur-sm bg-card/90">
              <Thermometer className="w-3 h-3 mr-1 text-primary" />
              {tempC}°C / {tempF}°F
            </Badge>
            <Badge variant="secondary" className="backdrop-blur-sm bg-card/90">
              <Timer className="w-3 h-3 mr-1" />
              {timerLabel}
            </Badge>
            <Badge
              variant="secondary"
              className="backdrop-blur-sm bg-card/90"
              style={{ color: donenessColor }}
            >
              {baking.donenessLabel}
            </Badge>
          </div>

          {/* Bottom mode badge */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <Badge variant="outline" className="bg-card/80 backdrop-blur-sm">
              Mode: {ovenMode.toUpperCase()}
            </Badge>
            {baking.status === "baking" && (
              <Badge className="bg-primary/90">
                Baking {progressPercent}%
              </Badge>
            )}
            {baking.status === "done" && (
              <Badge style={{ background: donenessColor, color: "white" }}>
                Bake Complete
              </Badge>
            )}
            {baking.status === "preheating" && (
              <Badge variant="secondary" className="bg-card/80 backdrop-blur-sm">
                Preheating…
              </Badge>
            )}
            {baking.status === "ready" && (
              <Badge variant="secondary" className="bg-accent text-accent-foreground">
                Ready
              </Badge>
            )}
          </div>
        </div>

        {/* Bottom action bar */}
        <div className="w-full rounded-lg border border-border bg-card p-3 flex items-center gap-2 flex-wrap">
          <Button
            onClick={baking.status === "baking" ? stopBake : startBake}
            disabled={!hasBakeable && baking.status !== "baking"}
            variant={baking.status === "baking" ? "destructive" : "default"}
          >
            {baking.status === "baking" ? (
              <>
                <Square className="w-4 h-4 mr-1.5" /> Stop bake
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-1.5" /> Start bake
              </>
            )}
          </Button>
          <Button variant="outline" onClick={resetBake}>
            Reset
          </Button>
          <Button
            variant={ovenLight ? "secondary" : "outline"}
            onClick={toggleOvenLight}
            size="icon"
            aria-label="Toggle oven light"
          >
            <Lightbulb className={`w-4 h-4 ${ovenLight ? "text-primary" : ""}`} />
          </Button>
          <Button
            variant={ovenOn ? "secondary" : "outline"}
            onClick={() => setOvenOn(!ovenOn)}
            size="icon"
            aria-label="Toggle oven power"
          >
            <Power className={`w-4 h-4 ${ovenOn ? "text-primary" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Right: controls */}
      <div className="border border-border rounded-lg bg-card p-4 flex flex-col gap-3 min-h-0 overflow-y-auto kitchen-scrollbar">
        <div>
          <h3 className="text-sm font-semibold mb-1">Smart Convection Oven</h3>
          <p className="text-xs text-muted-foreground">
            Brushed stainless steel. Dual-pane glass with heat-haze distortion. Set temperature, mode, and timer.
          </p>
        </div>

        {/* Mode selector */}
        <div className="space-y-1.5">
          <span className="text-xs font-medium">Mode</span>
          <div className="grid grid-cols-2 gap-1.5">
            {MODES.map((m) => {
              const Icon = m.icon
              const active = ovenMode === m.id
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setOvenMode(m.id)
                    setOvenTemp(m.defaultTemp)
                  }}
                  className={`flex items-center gap-1.5 px-2 py-2 rounded-md border text-xs font-medium transition ${
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover:border-primary/50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {m.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Temperature */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">Temperature</span>
            <span className="font-mono text-primary">{tempC}°C · {tempF}°F</span>
          </div>
          <Slider
            value={[tempC]}
            onValueChange={(v) => setOvenTemp(v[0])}
            min={30}
            max={300}
            step={5}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
            <span>30°C</span>
            <span>165°C</span>
            <span>300°C</span>
          </div>
        </div>

        {/* Timer */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">Bake timer</span>
            <span className="font-mono text-primary">{timerMin} min</span>
          </div>
          <Slider
            value={[timerMin]}
            onValueChange={(v) => setTimerMin(v[0])}
            min={1}
            max={120}
            step={1}
          />
        </div>

        {/* Live readout */}
        <div className="grid grid-cols-3 gap-1.5 text-center">
          <div className="rounded-md bg-muted/40 px-2 py-1.5">
            <div className="text-[10px] text-muted-foreground">Progress</div>
            <div className="text-xs font-mono">{progressPercent}%</div>
          </div>
          <div className="rounded-md bg-muted/40 px-2 py-1.5">
            <div className="text-[10px] text-muted-foreground">Rise</div>
            <div className="text-xs font-mono">{risePercent}%</div>
          </div>
          <div className="rounded-md bg-muted/40 px-2 py-1.5">
            <div className="text-[10px] text-muted-foreground">Browning</div>
            <div className="text-xs font-mono" style={{ color: donenessColor }}>{brownPercent}%</div>
          </div>
        </div>

        {/* Browning progress bar */}
        <div className="space-y-1">
          <div className="text-[10px] text-muted-foreground">Maillard intensity</div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full"
              style={{
                background: `linear-gradient(90deg, #e5b95a, #b8602b, #3a1810)`,
              }}
              animate={{ width: `${brownPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Warnings */}
        <AnimatePresence>
          {ovenTempC > 240 && ovenOn && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-md border border-destructive/40 bg-destructive/10 p-2.5"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-destructive">
                <AlertTriangle className="w-3 h-3" /> High temperature
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Above 240°C, sugar caramelizes aggressively — exterior browns far faster than interior cooks.
              </p>
            </motion.div>
          )}
          {baking.brownLevel > 0.85 && baking.status === "baking" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-md border border-destructive/40 bg-destructive/10 p-2.5"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-destructive">
                <AlertTriangle className="w-3 h-3" /> Approaching burnt
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Maillard reaction has passed its peak. Stop the bake to avoid carbonization.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-auto pt-3 border-t border-border text-[11px] text-muted-foreground">
          <p>
            Oven uses radiant + convective + conductive heat. Heavier bakes (more mass) need longer times — the simulation accounts for bowl mass.
          </p>
        </div>
      </div>
    </div>
  )
}

function formatTimer(sec: number): string {
  if (sec <= 0) return "0:00"
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, "0")}`
}

function OvenSVG({
  ovenOn,
  ovenLight,
  ovenMode,
  ovenTempC,
  hasBakeable,
  riseLevel,
  brownLevel,
  bowl,
  mixLevel,
  isProofing,
}: {
  ovenOn: boolean
  ovenLight: boolean
  ovenMode: OvenMode
  ovenTempC: number
  hasBakeable: boolean
  riseLevel: number
  brownLevel: number
  bowl: { ingredientId: string; grams: number }[]
  mixLevel: number
  isProofing: boolean
}) {
  // HD interior lighting — temperature-dependent color temperature
  const interiorBg = ovenOn
    ? ovenMode === "broil"
      ? `radial-gradient(ellipse 80% 60% at 50% 0%,
          rgba(255, 180, 80, 0.95) 0%,
          rgba(255, 120, 40, 0.85) 25%,
          rgba(180, 50, 15, 0.85) 55%,
          rgba(60, 20, 10, 0.95) 90%)`
      : ovenMode === "proof"
      ? `radial-gradient(ellipse at 50% 50%,
          rgba(220, 180, 130, 0.55) 0%,
          rgba(120, 90, 60, 0.7) 50%,
          rgba(40, 30, 20, 0.9) 100%)`
      : `radial-gradient(ellipse 70% 55% at 50% 25%,
          rgba(255, ${Math.max(60, 210 - ovenTempC * 0.55)}, 50, 0.85) 0%,
          rgba(200, 70, 25, 0.7) 35%,
          rgba(80, 25, 12, 0.9) 75%,
          rgba(20, 12, 5, 0.98) 100%)`
    : `radial-gradient(ellipse at 50% 30%,
        rgba(80, 60, 40, 0.65) 0%,
        rgba(35, 25, 15, 0.85) 50%,
        rgba(15, 10, 5, 0.98) 100%)`

  // Heating element color based on temperature
  const elementColor = ovenMode === "broil"
    ? "linear-gradient(90deg, #ff3300 0%, #ffaa00 15%, #ffff60 30%, #ffaa00 50%, #ffff60 70%, #ffaa00 85%, #ff3300 100%)"
    : `linear-gradient(90deg,
        #aa2200 0%,
        #ff6600 10%,
        #ffaa30 25%,
        #ffcc66 50%,
        #ffaa30 75%,
        #ff6600 90%,
        #aa2200 100%)`

  return (
    <div className="relative w-full max-w-[520px] aspect-[5/4]">
      {/* Ambient floor shadow under oven */}
      <div
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[88%] h-6 rounded-full"
        style={{
          background: "radial-gradient(ellipse, rgba(0,0,0,0.45), transparent 70%)",
          filter: "blur(8px)",
        }}
      />

      {/* Oven body — HD brushed stainless steel with depth */}
      <div
        className="absolute inset-0 rounded-2xl metal-steel"
        style={{
          boxShadow:
            "0 30px 60px -12px rgba(0,0,0,0.5), 0 18px 32px -8px rgba(80,50,20,0.35), inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -3px 6px rgba(0,0,0,0.3)",
        }}
      />

      {/* Top vent strip (decorative detail) */}
      <div
        className="absolute top-1.5 left-1/2 -translate-x-1/2 w-[30%] h-1 rounded-full"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.4) 20%, rgba(0,0,0,0.4) 80%, transparent)",
        }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <span
            key={i}
            className="absolute top-0 w-0.5 h-full bg-black/60"
            style={{ left: `${10 + i * 11}%` }}
          />
        ))}
      </div>

      {/* Control panel strip (top) — HD with depth */}
      <div
        className="absolute top-5 left-5 right-5 h-14 rounded-lg flex items-center justify-between px-4 gap-3"
        style={{
          background:
            "linear-gradient(180deg, #0a0c10 0%, #1a1e24 50%, #06080a 100%)",
          boxShadow:
            "inset 0 2px 4px rgba(0,0,0,0.8), inset 0 -1px 2px rgba(80,90,110,0.2), 0 2px 4px rgba(0,0,0,0.5)",
          border: "1px solid rgba(80,90,110,0.3)",
        }}
      >
        <div className="flex items-center gap-2.5">
          {/* Power LED with realistic glow */}
          <div className="relative">
            <div
              className={`w-2 h-2 rounded-full ${ovenOn ? "bg-emerald-400" : "bg-zinc-700"}`}
              style={ovenOn ? {
                boxShadow: "0 0 6px #34d399, 0 0 12px rgba(52, 211, 153, 0.6), inset 0 0 2px rgba(255,255,255,0.8)"
              } : {}}
            />
            {ovenOn && (
              <motion.div
                className="absolute inset-0 rounded-full bg-emerald-400"
                animate={{ opacity: [0.4, 0, 0.4], scale: [1, 1.8, 1] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              />
            )}
          </div>
          <span className="text-[10px] font-mono text-amber-300/90 tracking-wider">HIRA_BAKERY</span>
        </div>

        {/* Digital readout — HD VFD style */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[7px] text-amber-300/50 leading-none tracking-widest uppercase">Temp</div>
            <div
              className="font-mono text-amber-300 text-base leading-none mt-0.5"
              style={{
                textShadow: "0 0 4px rgba(251, 191, 36, 0.8), 0 0 8px rgba(251, 191, 36, 0.4)",
              }}
            >
              {ovenTempC}°C
            </div>
          </div>
          <div className="w-px h-6 bg-amber-300/20" />
          <div className="text-right">
            <div className="text-[7px] text-amber-300/50 leading-none tracking-widest uppercase">Mode</div>
            <div
              className="font-mono text-amber-300 text-base leading-none mt-0.5 uppercase"
              style={{
                textShadow: "0 0 4px rgba(251, 191, 36, 0.8), 0 0 8px rgba(251, 191, 36, 0.4)",
              }}
            >
              {ovenMode}
            </div>
          </div>
        </div>

        {/* Rotary encoder — HD machined aluminum */}
        <div className="relative">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, #d0d4d8 0%, #8a8e94 30%, #4a4e54 60%, #1a1e24 100%)",
              boxShadow:
                "inset 0 1px 2px rgba(255,255,255,0.6), inset 0 -2px 4px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.6)",
              border: "1px solid rgba(0,0,0,0.5)",
            }}
          >
            {/* Knurling texture */}
            {Array.from({ length: 24 }).map((_, i) => (
              <span
                key={i}
                className="absolute w-px h-1 bg-black/30"
                style={{
                  left: "50%",
                  top: "1px",
                  transformOrigin: "50% 18px",
                  transform: `rotate(${i * 15}deg)`,
                }}
              />
            ))}
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: "radial-gradient(circle at 30% 30%, #ffeaa0, #d97706 60%, #92400e)",
                boxShadow: "0 0 4px rgba(251, 191, 36, 0.8), inset 0 0 1px rgba(255,255,255,0.6)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Oven door / window — HD with multi-layer glass effect */}
      <div
        className="absolute"
        style={{
          top: "26%",
          left: "7%",
          right: "7%",
          bottom: "11%",
          borderRadius: 14,
          overflow: "hidden",
          background: interiorBg,
          boxShadow:
            "inset 0 0 40px rgba(0,0,0,0.85), inset 0 0 100px rgba(0,0,0,0.6), 0 6px 16px rgba(0,0,0,0.5), 0 0 0 4px rgba(20, 25, 35, 0.6), 0 0 0 5px rgba(80, 90, 110, 0.2)",
        }}
      >
        {/* Back wall of oven interior (depth) */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(40, 30, 20, 0.4) 0%, transparent 30%, transparent 70%, rgba(0, 0, 0, 0.6) 100%)",
          }}
        />

        {/* Heat-haze overlay */}
        {ovenOn && ovenMode !== "proof" && (
          <div className="absolute inset-0 heat-haze opacity-50" />
        )}

        {/* Oven light cone — HD volumetric */}
        {ovenLight && (
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 50% 5%, rgba(255, 240, 180, 0.45) 0%, rgba(255, 220, 150, 0.2) 30%, transparent 70%)",
              mixBlendMode: "screen",
            }}
          />
        )}

        {/* HD Heating elements (top + bottom) with realistic glow */}
        {ovenOn && ovenMode !== "proof" && (
          <>
            {/* Top broil element — U-shaped */}
            <svg className="absolute top-1.5 left-3 right-3 h-3" viewBox="0 0 200 12" preserveAspectRatio="none">
              <defs>
                <filter id="elementGlowFilter" x="-50%" y="-200%" width="200%" height="500%">
                  <feGaussianBlur stdDeviation="2.5" />
                </filter>
              </defs>
              {/* Glow halo */}
              <path
                d="M 8 6 L 192 6"
                stroke={ovenMode === "broil" ? "#ffcc40" : "#ff7700"}
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
                filter="url(#elementGlowFilter)"
                opacity="0.85"
              />
              {/* Core element */}
              <path
                d="M 8 6 L 192 6"
                stroke={ovenMode === "broil" ? "#ffffe0" : "#ffaa30"}
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
              {/* Highlights along element */}
              {Array.from({ length: 12 }).map((_, i) => (
                <circle
                  key={i}
                  cx={16 + i * 16}
                  cy={6}
                  r={0.8}
                  fill="#ffffff"
                  opacity={0.8}
                />
              ))}
            </svg>
            {/* Bottom bake element — hidden behind pan but glowing */}
            <div
              className="absolute bottom-1.5 left-4 right-4 h-1 rounded-full element-glow"
              style={{
                background: "linear-gradient(90deg, #882200 0%, #cc4400 20%, #ff6600 50%, #cc4400 80%, #882200 100%)",
              }}
            />
          </>
        )}

        {/* Bake contents: pan + bowl/dough */}
        {hasBakeable && (
          <div className="absolute inset-0 flex items-end justify-center pb-[18%]">
            <div className="relative">
              {/* HD Pan with reflective top */}
              <div
                className="w-44 h-3 rounded-sm relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(180deg, #4a3a2a 0%, #2a1f17 30%, #1a120c 70%, #0a0604 100%)",
                  boxShadow:
                    "0 4px 8px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.5), inset 0 1px 1px rgba(180,140,90,0.4)",
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-200/40 to-transparent" />
              </div>

              {/* Bowl contents rendered with BowlView (smaller, with rising/browning overlays) */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                <BowlView
                  bowl={bowl}
                  mixLevel={mixLevel}
                  rising={riseLevel}
                  browning={brownLevel}
                  size={140}
                />
              </div>

              {/* HD Steam particles when baking */}
              {ovenOn && riseLevel > 0.3 && (
                <div className="absolute inset-0 pointer-events-none">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <span
                      key={i}
                      className="steam-particle"
                      style={{
                        left: `${25 + i * 10}%`,
                        bottom: "60%",
                        width: `${10 + (i % 3) * 4}px`,
                        height: `${10 + (i % 3) * 4}px`,
                        ["--drift" as string]: `${(i - 4) * 4}px`,
                        ["--dur" as string]: `${2.2 + (i % 3) * 0.6}s`,
                        animationDelay: `${i * 0.35}s`,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* HD Yeast activity bubbles during proofing */}
              {isProofing && (
                <div className="absolute inset-0 pointer-events-none">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <motion.span
                      key={i}
                      className="absolute rounded-full bg-white/50"
                      style={{
                        left: `${20 + (i * 7) % 60}%`,
                        bottom: "40%",
                        width: 2 + (i % 2),
                        height: 2 + (i % 2),
                      }}
                      animate={{ y: [0, -50], opacity: [0, 1, 0] }}
                      transition={{
                        duration: 2 + (i % 3) * 0.5,
                        repeat: Infinity,
                        delay: i * 0.25,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty oven */}
        {!hasBakeable && (
          <div className="absolute inset-0 flex items-center justify-center text-amber-200/40 text-xs italic">
            Empty oven — add a bowl with ingredients to bake
          </div>
        )}

        {/* HD Glass reflection — multi-layer */}
        <div className="absolute inset-0 pointer-events-none glass-pane" />

        {/* Strong diagonal streak reflection */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.18) 44%, rgba(255,255,255,0.32) 47%, rgba(255,255,255,0.10) 50%, transparent 58%)",
            mixBlendMode: "screen",
          }}
        />

        {/* Condensation droplets (HD) */}
        {ovenOn && ovenTempC < 110 && ovenTempC > 60 && (
          <div
            className="absolute inset-0 pointer-events-none opacity-50"
            style={{
              backgroundImage:
                "radial-gradient(circle at 12% 24%, rgba(255,255,255,0.85) 1px, transparent 2px), radial-gradient(circle at 28% 56%, rgba(255,255,255,0.65) 1.2px, transparent 2.5px), radial-gradient(circle at 52% 32%, rgba(255,255,255,0.75) 1px, transparent 2px), radial-gradient(circle at 76% 64%, rgba(255,255,255,0.55) 1.4px, transparent 2.8px), radial-gradient(circle at 88% 28%, rgba(255,255,255,0.7) 1px, transparent 2px), radial-gradient(circle at 42% 78%, rgba(255,255,255,0.5) 1.3px, transparent 2.5px)",
              backgroundSize: "60px 60px, 80px 80px, 50px 50px, 70px 70px, 55px 55px, 65px 65px",
            }}
          />
        )}

        {/* Subtle film grain inside oven */}
        <div className="absolute inset-0 film-grain" />
      </div>

      {/* HD Door handle — brushed aluminum bar */}
      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-[5.5%] w-[78%] h-2.5 rounded-full"
        style={{
          background:
            "linear-gradient(180deg, #d4d8dc 0%, #8a8e94 35%, #5a5e64 60%, #2a2e34 100%)",
          boxShadow:
            "inset 0 1px 1px rgba(255,255,255,0.6), inset 0 -1px 2px rgba(0,0,0,0.4), 0 3px 6px rgba(0,0,0,0.5)",
        }}
      >
        <div
          className="absolute inset-x-2 top-0.5 h-0.5 rounded-full"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)" }}
        />
      </div>

      {/* Brand badge — HD etched metal */}
      <div
        className="absolute bottom-2.5 left-5 text-[8px] font-mono tracking-widest"
        style={{
          color: "rgba(80, 90, 110, 0.8)",
          textShadow: "0 1px 0 rgba(255,255,255,0.4), 0 -1px 0 rgba(0,0,0,0.5)",
        }}
      >
        HIRA CULINARY · MODEL VR-300
      </div>

      {/* Model badge on right */}
      <div
        className="absolute bottom-2.5 right-5 text-[8px] font-mono tracking-widest"
        style={{
          color: "rgba(80, 90, 110, 0.8)",
          textShadow: "0 1px 0 rgba(255,255,255,0.4), 0 -1px 0 rgba(0,0,0,0.5)",
        }}
      >
        CONVECTION · 300°C MAX
      </div>

      {/* Edge highlights (top-left light wrap) */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 4%, transparent 96%, rgba(0,0,0,0.2) 100%)",
          mixBlendMode: "screen",
        }}
      />
    </div>
  )
}
