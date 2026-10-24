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
        <div className="relative w-full flex-1 min-h-[420px] rounded-xl border border-border overflow-hidden flex items-center justify-center bg-gradient-to-b from-[#2a1f17] to-[#1a120c]">
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
  const interiorBg = ovenOn
    ? ovenMode === "broil"
      ? "radial-gradient(ellipse at 50% 0%, rgba(255,140,40,0.85), rgba(80,20,10,0.95) 70%)"
      : ovenMode === "proof"
      ? "radial-gradient(ellipse at 50% 50%, rgba(180,140,90,0.4), rgba(40,30,20,0.9))"
      : `radial-gradient(ellipse at 50% 30%, rgba(255,${Math.max(40, 200 - ovenTempC * 0.6)},40,0.7), rgba(60,20,10,0.95) 80%)`
    : "radial-gradient(ellipse at 50% 30%, rgba(60,40,25,0.8), rgba(20,12,5,0.95))"

  return (
    <div className="relative w-full max-w-[480px] aspect-[5/4]">
      {/* Oven body */}
      <div className="absolute inset-0 rounded-2xl metal-steel shadow-2xl" />

      {/* Control panel strip (top) */}
      <div className="absolute top-3 left-4 right-4 h-12 rounded-lg bg-black/70 backdrop-blur-sm flex items-center justify-between px-3 gap-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${ovenOn ? "bg-primary animate-pulse" : "bg-muted-foreground/40"}`} />
          <span className="text-[10px] font-mono text-amber-300/90">MASTER_BAKER_VR</span>
        </div>
        {/* Digital readout */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[8px] text-amber-300/60 leading-none">TEMP</div>
            <div className="font-mono text-amber-300 text-sm leading-none">{ovenTempC}°C</div>
          </div>
          <div className="text-right">
            <div className="text-[8px] text-amber-300/60 leading-none">MODE</div>
            <div className="font-mono text-amber-300 text-sm leading-none uppercase">{ovenMode}</div>
          </div>
        </div>
        {/* Rotary encoder */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-zinc-600 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        </div>
      </div>

      {/* Oven door / window */}
      <div
        className="absolute"
        style={{
          top: "24%",
          left: "8%",
          right: "8%",
          bottom: "10%",
          borderRadius: 12,
          overflow: "hidden",
          background: interiorBg,
          boxShadow:
            "inset 0 0 30px rgba(0,0,0,0.7), inset 0 0 80px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.4)",
        }}
      >
        {/* Heat-haze overlay */}
        {ovenOn && ovenMode !== "proof" && (
          <div className="absolute inset-0 heat-haze opacity-40" />
        )}

        {/* Oven light cone */}
        {ovenLight && (
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 50% at 50% 10%, rgba(255,240,180,0.25), transparent 70%)",
            }}
          />
        )}

        {/* Heating elements (top + bottom) */}
        {ovenOn && ovenMode !== "proof" && (
          <>
            <div
              className="absolute top-2 left-4 right-4 h-1 rounded-full element-glow"
              style={{
                background: ovenMode === "broil"
                  ? "linear-gradient(90deg, #ff4400, #ffaa00, #ff4400)"
                  : "linear-gradient(90deg, #aa3300, #ff6600, #aa3300)",
              }}
            />
            <div
              className="absolute bottom-2 left-4 right-4 h-1 rounded-full"
              style={{
                background: "linear-gradient(90deg, #882200, #cc4400, #882200)",
                filter: "drop-shadow(0 0 6px #ff5500)",
              }}
            />
          </>
        )}

        {/* Bake contents: pan + bowl/dough */}
        {hasBakeable && (
          <div className="absolute inset-0 flex items-end justify-center pb-[18%]">
            <div className="relative">
              {/* Pan */}
              <div
                className="w-44 h-3 rounded-sm"
                style={{
                  background: "linear-gradient(180deg, #5a4a3a, #2a1f17)",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
                }}
              />
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

              {/* Steam particles when baking */}
              {ovenOn && riseLevel > 0.3 && (
                <div className="absolute inset-0 pointer-events-none">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <span
                      key={i}
                      className="steam-particle"
                      style={{
                        left: `${30 + i * 12}%`,
                        bottom: "60%",
                        width: `${8 + Math.random() * 8}px`,
                        height: `${8 + Math.random() * 8}px`,
                        ["--drift" as string]: `${(Math.random() - 0.5) * 20}px`,
                        ["--dur" as string]: `${2 + Math.random() * 1.5}s`,
                        animationDelay: `${i * 0.4}s`,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Yeast activity bubbles during proofing */}
              {isProofing && (
                <div className="absolute inset-0 pointer-events-none">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <motion.span
                      key={i}
                      className="absolute rounded-full bg-white/40"
                      style={{
                        left: `${20 + Math.random() * 60}%`,
                        bottom: "40%",
                        width: 2,
                        height: 2,
                      }}
                      animate={{ y: [0, -40], opacity: [0, 1, 0] }}
                      transition={{
                        duration: 2 + Math.random(),
                        repeat: Infinity,
                        delay: i * 0.3,
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

        {/* Glass reflection */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.12) 45%, transparent 60%)",
          }}
        />
        {/* Condensation */}
        {ovenOn && ovenTempC < 110 && ovenTempC > 60 && (
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 40%, rgba(255,255,255,0.6) 1px, transparent 2px), radial-gradient(circle at 60% 70%, rgba(255,255,255,0.4) 1px, transparent 2px), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.5) 1px, transparent 2px)",
              backgroundSize: "30px 30px, 40px 40px, 25px 25px",
            }}
          />
        )}
      </div>

      {/* Door handle */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-[6%] w-3/4 h-2 rounded-full bg-gradient-to-r from-zinc-600 via-zinc-400 to-zinc-600 shadow-md" />

      {/* Brand badge */}
      <div className="absolute bottom-2 left-4 text-[8px] font-mono text-zinc-500/80">
        Z.AI CULINARY · MODEL VR-300
      </div>
    </div>
  )
}
