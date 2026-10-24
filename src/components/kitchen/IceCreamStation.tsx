"use client"

import { useEffect, useRef, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Snowflake,
  Power,
  RotateCcw,
  Sparkles,
  IceCream as IceCreamIcon,
  Plus,
  X,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { useKitchen } from "@/lib/kitchen-store"
import { INGREDIENTS, CATEGORY_META, type Ingredient } from "@/lib/ingredients"
import { findScienceNote } from "@/lib/science"

// ─── Ice cream flavors ───────────────────────────────────────────────────

interface IceCreamFlavor {
  id: string
  name: string
  emoji: string
  color: string
  highlight: string
  description: string
  /** Required base ingredient (auto-added when flavor is selected) */
  baseIngredientId: string
}

const ICE_CREAM_FLAVORS: IceCreamFlavor[] = [
  {
    id: "vanilla",
    name: "Vanilla",
    emoji: "🤍",
    color: "#FFF5E1",
    highlight: "#F5E8C8",
    description: "Classic creamy vanilla bean",
    baseIngredientId: "vanilla",
  },
  {
    id: "chocolate",
    name: "Chocolate",
    emoji: "🍫",
    color: "#5D3A1A",
    highlight: "#3D2410",
    description: "Rich Dutch cocoa chocolate",
    baseIngredientId: "cocoa",
  },
  {
    id: "strawberry",
    name: "Strawberry",
    emoji: "🍓",
    color: "#F4A0A0",
    highlight: "#D87878",
    description: "Fresh strawberry swirl",
    baseIngredientId: "berries",
  },
  {
    id: "matcha",
    name: "Matcha",
    emoji: "🍵",
    color: "#A8C870",
    highlight: "#789840",
    description: "Japanese green tea",
    baseIngredientId: "vanilla", // uses vanilla as base, color is matcha
  },
  {
    id: "mango",
    name: "Mango",
    emoji: "🥭",
    color: "#FFC857",
    highlight: "#E8A830",
    description: "Tropical mango sorbet",
    baseIngredientId: "lemon-juice", // citrus base
  },
]

// ─── Mix-in ingredients (kids can add to customize) ─────────────────────

const MIX_IN_INGREDIENTS = INGREDIENTS.filter((i) =>
  ["sugar-granulated", "milk-whole", "water", "vanilla", "cocoa", "berries", "lemon-juice", "choc-chips", "nuts"].includes(i.id)
)

export function IceCreamStation() {
  const iceCreamBowl = useKitchen((s) => s.iceCreamBowl)
  const iceCreamFlavor = useKitchen((s) => s.iceCreamFlavor)
  const iceCreamChurnLevel = useKitchen((s) => s.iceCreamChurnLevel)
  const iceCreamChurning = useKitchen((s) => s.iceCreamChurning)
  const iceCreamFreezeLevel = useKitchen((s) => s.iceCreamFreezeLevel)
  const iceCreamStatus = useKitchen((s) => s.iceCreamStatus)
  const iceCreamScoops = useKitchen((s) => s.iceCreamScoops)
  const addToIceCreamBowl = useKitchen((s) => s.addToIceCreamBowl)
  const removeFromIceCreamBowl = useKitchen((s) => s.removeFromIceCreamBowl)
  const clearIceCreamBowl = useKitchen((s) => s.clearIceCreamBowl)
  const setIceCreamFlavor = useKitchen((s) => s.setIceCreamFlavor)
  const setIceCreamChurning = useKitchen((s) => s.setIceCreamChurning)
  const incrementIceCreamChurn = useKitchen((s) => s.incrementIceCreamChurn)
  const startIceCreamFreeze = useKitchen((s) => s.startIceCreamFreeze)
  const tickIceCreamFreeze = useKitchen((s) => s.tickIceCreamFreeze)
  const serveIceCreamScoop = useKitchen((s) => s.serveIceCreamScoop)
  const resetIceCream = useKitchen((s) => s.resetIceCream)
  const pushLog = useKitchen((s) => s.pushLog)

  const [showMixIns, setShowMixIns] = useState(false)

  const selectedFlavor = ICE_CREAM_FLAVORS.find((f) => f.id === iceCreamFlavor) ?? ICE_CREAM_FLAVORS[0]
  const totalMass = iceCreamBowl.reduce((a, b) => a + b.grams, 0)

  // ─── Churning loop ───
  const churnRafRef = useRef<number | null>(null)
  const lastChurnTick = useRef(0)
  useEffect(() => {
    if (!iceCreamChurning) return
    lastChurnTick.current = performance.now()
    const loop = (now: number) => {
      const dt = (now - lastChurnTick.current) / 1000
      lastChurnTick.current = now
      // Churn completes in ~20 seconds
      const rate = 0.05 * dt
      incrementIceCreamChurn(rate)
      churnRafRef.current = requestAnimationFrame(loop)
    }
    churnRafRef.current = requestAnimationFrame(loop)
    return () => {
      if (churnRafRef.current) cancelAnimationFrame(churnRafRef.current)
    }
  }, [iceCreamChurning, incrementIceCreamChurn])

  // ─── Auto-start freeze when churn completes ───
  useEffect(() => {
    if (iceCreamChurnLevel >= 1 && iceCreamStatus === "freezing" && iceCreamFreezeLevel === 0) {
      pushLog("Churn complete! Starting freeze cycle...", "action")
    }
  }, [iceCreamChurnLevel, iceCreamStatus, iceCreamFreezeLevel, pushLog])

  // ─── Freezing loop ───
  const freezeRafRef = useRef<number | null>(null)
  const lastFreezeTick = useRef(0)
  useEffect(() => {
    if (iceCreamStatus !== "freezing") return
    lastFreezeTick.current = performance.now()
    const loop = (now: number) => {
      const dt = (now - lastFreezeTick.current) / 1000
      lastFreezeTick.current = now
      tickIceCreamFreeze(dt)
      freezeRafRef.current = requestAnimationFrame(loop)
    }
    freezeRafRef.current = requestAnimationFrame(loop)
    return () => {
      if (freezeRafRef.current) cancelAnimationFrame(freezeRafRef.current)
    }
  }, [iceCreamStatus, tickIceCreamFreeze])

  const handleSelectFlavor = (flavor: IceCreamFlavor) => {
    setIceCreamFlavor(flavor.id)
    // Auto-add the base ingredient if not already present
    if (!iceCreamBowl.some((b) => b.ingredientId === flavor.baseIngredientId)) {
      addToIceCreamBowl(flavor.baseIngredientId)
    }
    // Always ensure cream + sugar base
    if (!iceCreamBowl.some((b) => b.ingredientId === "milk-whole")) {
      addToIceCreamBowl("milk-whole", 200)
    }
    if (!iceCreamBowl.some((b) => b.ingredientId === "sugar-granulated")) {
      addToIceCreamBowl("sugar-granulated", 80)
    }
  }

  const handleStartChurn = () => {
    if (iceCreamBowl.length === 0) {
      pushLog("Add ingredients first!", "warning")
      return
    }
    setIceCreamChurning(true)
  }

  const handleStartFreeze = () => {
    if (iceCreamChurnLevel < 1) {
      pushLog("Finish churning first!", "warning")
      return
    }
    startIceCreamFreeze()
  }

  const handleServe = () => {
    if (iceCreamStatus !== "ready") {
      pushLog("Ice cream isn't frozen yet!", "warning")
      return
    }
    serveIceCreamScoop()
  }

  const statusLabel = {
    empty: "Empty — pick a flavor to start",
    mixing: "Ingredients added — ready to churn",
    churning: "Churning... watch the cream thicken",
    freezing: "Freezing... almost there!",
    ready: "Ready to serve! 🍨",
  }[iceCreamStatus]

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-4 h-full">
      {/* Left: ice cream maker visualization */}
      <div className="flex flex-col gap-4 min-h-0">
        {/* The ice cream machine stage */}
        <div
          className="relative flex-1 min-h-[380px] rounded-2xl overflow-hidden flex items-center justify-center"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 30%, #e0f0ff 0%, #b8d8f0 40%, #6a8aa8 90%, #2a4060 100%)",
            boxShadow: "inset 0 0 80px rgba(40, 80, 120, 0.3)",
          }}
        >
          {/* Cold atmosphere particles (snowflakes) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 14 }).map((_, i) => (
              <motion.span
                key={i}
                className="absolute text-white/40"
                style={{
                  left: `${(i * 7) % 90 + 5}%`,
                  top: `${(i * 11) % 80 + 5}%`,
                  fontSize: 10 + (i % 3) * 4,
                }}
                animate={{
                  y: [0, 20, 0],
                  opacity: [0.2, 0.6, 0.2],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 4 + (i % 3),
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              >
                ❄
              </motion.span>
            ))}
          </div>

          {/* Frost vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 60% 40% at 50% 50%, transparent 0%, transparent 50%, rgba(255,255,255,0.2) 100%)",
            }}
          />

          {/* The ice cream machine */}
          <IceCreamMachine
            flavor={selectedFlavor}
            churnLevel={iceCreamChurnLevel}
            freezeLevel={iceCreamFreezeLevel}
            status={iceCreamStatus}
            churning={iceCreamChurning}
            hasIngredients={iceCreamBowl.length > 0}
            scoops={iceCreamScoops}
          />

          {/* Top status bar */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
            <Badge variant="secondary" className="backdrop-blur-sm bg-white/85 text-foreground">
              <Snowflake className="w-3 h-3 mr-1 text-blue-500" />
              {selectedFlavor.emoji} {selectedFlavor.name}
            </Badge>
            <Badge
              variant="secondary"
              className="backdrop-blur-sm bg-white/85 text-foreground"
            >
              {iceCreamStatus === "churning" && `${Math.round(iceCreamChurnLevel * 100)}% churned`}
              {iceCreamStatus === "freezing" && `${Math.round(iceCreamFreezeLevel * 100)}% frozen`}
              {iceCreamStatus === "ready" && "✓ Ready"}
              {(iceCreamStatus === "empty" || iceCreamStatus === "mixing") && `${totalMass}g`}
            </Badge>
          </div>

          {/* Bottom status text */}
          <div className="absolute bottom-3 left-3 right-3 text-center pointer-events-none">
            <Badge variant="outline" className="bg-white/85 backdrop-blur-sm text-xs">
              {statusLabel}
            </Badge>
          </div>
        </div>

        {/* Action controls */}
        <div className="rounded-lg border border-border bg-card p-3 flex flex-wrap gap-2">
          {iceCreamStatus === "empty" || iceCreamStatus === "mixing" ? (
            <Button
              onClick={handleStartChurn}
              disabled={iceCreamBowl.length === 0}
              className="flex-1 h-12"
              size="lg"
            >
              <Power className="w-4 h-4 mr-1.5" />
              Start Churning
            </Button>
          ) : iceCreamStatus === "churning" ? (
            <Button
              onClick={() => setIceCreamChurning(false)}
              variant="destructive"
              className="flex-1 h-12"
              size="lg"
            >
              <Power className="w-4 h-4 mr-1.5" />
              Stop Churning
            </Button>
          ) : iceCreamStatus === "freezing" ? (
            <Button disabled className="flex-1 h-12" size="lg">
              <Snowflake className="w-4 h-4 mr-1.5 animate-pulse" />
              Freezing... {Math.round(iceCreamFreezeLevel * 100)}%
            </Button>
          ) : (
            <Button
              onClick={handleServe}
              className="flex-1 h-12"
              size="lg"
              style={{
                background: "linear-gradient(135deg, #fcd34d, #b8602b)",
              }}
            >
              <IceCreamIcon className="w-4 h-4 mr-1.5" />
              Serve a Scoop ({iceCreamScoops} served)
            </Button>
          )}
          <Button
            onClick={resetIceCream}
            variant="outline"
            className="h-12"
            size="lg"
          >
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Reset
          </Button>
        </div>
      </div>

      {/* Right: flavor selector + mix-ins */}
      <div className="border border-border rounded-lg bg-card p-4 flex flex-col gap-3 min-h-0 overflow-y-auto kitchen-scrollbar">
        <div>
          <h3 className="text-sm font-semibold mb-1 flex items-center gap-1.5">
            <IceCreamIcon className="w-4 h-4 text-primary" /> Pick a Flavor
          </h3>
          <p className="text-xs text-muted-foreground">
            Choose a flavor base. We'll auto-add cream + sugar.
          </p>
        </div>

        {/* Flavor grid */}
        <div className="grid grid-cols-1 gap-1.5">
          {ICE_CREAM_FLAVORS.map((flavor) => {
            const isSelected = iceCreamFlavor === flavor.id
            return (
              <button
                key={flavor.id}
                onClick={() => handleSelectFlavor(flavor)}
                className={`flex items-center gap-3 p-2.5 rounded-lg border-2 text-left transition active:scale-98 ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 border border-black/10"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${flavor.highlight}, ${flavor.color})`,
                  }}
                >
                  {flavor.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold leading-tight">{flavor.name}</div>
                  <div className="text-[11px] text-muted-foreground leading-tight">
                    {flavor.description}
                  </div>
                </div>
                {isSelected && (
                  <Sparkles className="w-4 h-4 text-primary shrink-0" />
                )}
              </button>
            )
          })}
        </div>

        {/* Mix-ins toggle */}
        <button
          onClick={() => setShowMixIns(!showMixIns)}
          className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline"
        >
          <Plus className="w-3 h-3" />
          {showMixIns ? "Hide mix-ins" : "Add extra mix-ins"}
        </button>

        {/* Mix-in ingredients */}
        <AnimatePresence>
          {showMixIns && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-3 gap-1.5">
                {MIX_IN_INGREDIENTS.map((ing) => (
                  <button
                    key={ing.id}
                    onClick={() => addToIceCreamBowl(ing.id)}
                    className="flex flex-col items-center text-center gap-0.5 p-2 rounded-lg border border-border hover:border-primary/40 transition active:scale-95"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm border border-black/10"
                      style={{
                        background: `radial-gradient(circle at 30% 30%, ${ing.highlight ?? ing.color}, ${ing.color})`,
                      }}
                    >
                      {ing.emoji}
                    </div>
                    <div className="text-[10px] font-medium leading-tight line-clamp-1">
                      {ing.name.split(" ")[0]}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current ice cream bowl contents */}
        <div className="space-y-1.5">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            In the Churner ({totalMass}g)
          </div>
          {iceCreamBowl.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              Empty — pick a flavor above to start.
            </p>
          ) : (
            <div className="space-y-1">
              {iceCreamBowl.map((b) => {
                const ing = INGREDIENTS.find((i) => i.id === b.ingredientId)
                if (!ing) return null
                return (
                  <div
                    key={b.ingredientId}
                    className="flex items-center justify-between rounded-md bg-muted/30 px-2 py-1 text-xs"
                  >
                    <span className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: ing.color }}
                      />
                      {ing.emoji} {ing.name}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="font-mono text-muted-foreground">{b.grams}g</span>
                      <button
                        onClick={() => removeFromIceCreamBowl(b.ingredientId)}
                        className="text-destructive hover:underline"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* How ice cream works (kid-friendly science) */}
        <div className="rounded-md border border-blue-200 bg-blue-50 p-2.5">
          <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wide flex items-center gap-1 mb-1">
            <Info className="w-3 h-3" /> How Ice Cream Works
          </div>
          <p className="text-[11px] text-blue-900 leading-relaxed">
            Churning freezes the cream while mixing in air bubbles. The movement stops
            ice crystals from growing too big — that's what makes ice cream smooth
            instead of icy!
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Ice Cream Machine SVG ──────────────────────────────────────────────

function IceCreamMachine({
  flavor,
  churnLevel,
  freezeLevel,
  status,
  churning,
  hasIngredients,
  scoops,
}: {
  flavor: IceCreamFlavor
  churnLevel: number
  freezeLevel: number
  status: string
  churning: boolean
  hasIngredients: boolean
  scoops: number
}) {
  // Color shifts from liquid (light) to frozen (deeper) as freeze progresses
  const liquidColor = flavor.color
  const frozenColor = flavor.highlight
  const currentColor = status === "ready"
    ? flavor.color
    : status === "freezing"
    ? blendColors(liquidColor, frozenColor, freezeLevel)
    : liquidColor

  return (
    <div className="relative" style={{ width: 280, height: 360 }}>
      <svg viewBox="0 0 280 360" width="280" height="360" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="machine-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e0e8f0" />
            <stop offset="50%" stopColor="#b8c8d8" />
            <stop offset="100%" stopColor="#7088a0" />
          </linearGradient>
          <linearGradient id="machine-lid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d0d8e0" />
            <stop offset="100%" stopColor="#8090a0" />
          </linearGradient>
          <radialGradient id="icecream-surface" cx="0.5" cy="0.3" r="0.6">
            <stop offset="0%" stopColor={brightenColor(currentColor, 0.3)} />
            <stop offset="100%" stopColor={currentColor} />
          </radialGradient>
          <filter id="cold-glow">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* Cold mist at base */}
        {status !== "empty" && (
          <ellipse
            cx="140" cy="340" rx="100" ry="12"
            fill="rgba(255,255,255,0.4)"
            filter="url(#cold-glow)"
          />
        )}

        {/* Machine base (stand) */}
        <rect x="60" y="280" width="160" height="60" rx="8" fill="url(#machine-body)" />
        <rect x="60" y="280" width="160" height="6" rx="3" fill="rgba(255,255,255,0.4)" />
        {/* Base display */}
        <rect x="100" y="300" width="80" height="24" rx="4" fill="#0a0e14" />
        <text
          x="140" y="316"
          textAnchor="middle"
          fontSize="10"
          fill={status === "ready" ? "#34d399" : status === "freezing" ? "#60a5fa" : "#fbbf24"}
          fontFamily="monospace"
          fontWeight="bold"
        >
          {status === "ready" ? "READY" : status === "freezing" ? `${Math.round(freezeLevel * 100)}%` : status === "churning" ? `${Math.round(churnLevel * 100)}%` : status === "mixing" ? "MIX" : "OFF"}
        </text>

        {/* Machine body (cylinder) */}
        <rect x="80" y="80" width="120" height="200" rx="12" fill="url(#machine-body)" />
        {/* Body highlight */}
        <rect x="86" y="86" width="6" height="188" rx="3" fill="rgba(255,255,255,0.5)" />

        {/* Viewing window (where you see the ice cream) */}
        <rect
          x="95" y="110" width="90" height="140" rx="8"
          fill="#0a0e14"
          stroke="#5a6878"
          strokeWidth="2"
        />
        {/* Window inner shadow */}
        <rect x="97" y="112" width="86" height="136" rx="6" fill="#1a2030" />

        {/* Ice cream inside (visible through window) */}
        {hasIngredients && (
          <g>
            {/* Liquid/cream fill — rises as it churns */}
            <motion.rect
              x="99" y={250 - 130 * Math.max(churnLevel, 0.3)}
              width="82"
              height={130 * Math.max(churnLevel, 0.3)}
              rx="4"
              fill="url(#icecream-surface)"
              initial={false}
              animate={{
                y: [250 - 130 * Math.max(churnLevel, 0.3), 250 - 130 * Math.max(churnLevel, 0.3) - 1, 250 - 130 * Math.max(churnLevel, 0.3)],
              }}
              transition={{
                duration: 2,
                repeat: churning ? Infinity : 0,
                ease: "easeInOut",
              }}
            />
            {/* Surface ripple while churning */}
            {churning && (
              <motion.g
                animate={{ x: [0, 2, -2, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <ellipse
                  cx="140"
                  cy={250 - 130 * Math.max(churnLevel, 0.3) + 4}
                  rx="38" ry="3"
                  fill={brightenColor(currentColor, 0.4)}
                  opacity="0.6"
                />
              </motion.g>
            )}
            {/* Frozen texture pattern when ready */}
            {status === "ready" && (
              <g opacity="0.4">
                <circle cx="120" cy="160" r="2" fill="#fff" />
                <circle cx="155" cy="175" r="1.5" fill="#fff" />
                <circle cx="135" cy="200" r="2" fill="#fff" />
                <circle cx="165" cy="210" r="1.5" fill="#fff" />
                <circle cx="110" cy="220" r="1.5" fill="#fff" />
              </g>
            )}
          </g>
        )}

        {/* Empty state text */}
        {!hasIngredients && (
          <text
            x="140" y="185"
            textAnchor="middle"
            fontSize="9"
            fill="#5a6878"
            fontStyle="italic"
          >
            pick a flavor →
          </text>
        )}

        {/* Window reflection */}
        <rect x="100" y="115" width="20" height="130" rx="4" fill="rgba(255,255,255,0.15)" />

        {/* Machine lid (top) */}
        <rect x="70" y="60" width="140" height="30" rx="6" fill="url(#machine-lid)" />
        <rect x="70" y="60" width="140" height="4" rx="2" fill="rgba(255,255,255,0.6)" />
        {/* Lid knob */}
        <circle cx="140" cy="75" r="8" fill="#5a6878" stroke="#3a4858" strokeWidth="1" />
        <motion.circle
          cx="140" cy="75" r="3"
          fill="#fbbf24"
          animate={churning ? { opacity: [1, 0.3, 1] } : {}}
          transition={{ duration: 0.5, repeat: churning ? Infinity : 0 }}
        />

        {/* Motor housing (top dome) */}
        <ellipse cx="140" cy="60" rx="50" ry="14" fill="url(#machine-lid)" />
        <ellipse cx="140" cy="58" rx="50" ry="4" fill="rgba(255,255,255,0.4)" />

        {/* Brand badge */}
        <rect x="115" y="265" width="50" height="12" rx="2" fill="#0a0e14" />
        <text
          x="140" y="273"
          textAnchor="middle"
          fontSize="7"
          fill="#fbbf24"
          fontFamily="monospace"
          fontWeight="bold"
        >
          HIRA FROST
        </text>

        {/* Paddle indicator (spins while churning) */}
        {churning && (
          <motion.g
            style={{ transformOrigin: "140px 180px" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
            opacity="0.5"
          >
            <line x1="140" y1="160" x2="140" y2="200" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
            <line x1="125" y1="180" x2="155" y2="180" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
          </motion.g>
        )}
      </svg>

      {/* Served scoops (floating to the right when served) */}
      {scoops > 0 && (
        <div className="absolute -right-4 top-12 flex flex-col gap-1">
          <AnimatePresence>
            {Array.from({ length: Math.min(scoops, 5) }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, x: -20, opacity: 0 }}
                animate={{ scale: 1, x: 0, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-lg"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${flavor.highlight}, ${flavor.color})`,
                  border: "2px solid rgba(255,255,255,0.6)",
                }}
              >
                🍨
              </motion.div>
            ))}
          </AnimatePresence>
          {scoops > 5 && (
            <div className="text-[10px] text-center font-bold text-white bg-black/40 rounded-full px-1.5 py-0.5">
              +{scoops - 5}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Color helpers ──────────────────────────────────────────────────────

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${Math.round(r).toString(16).padStart(2, "0")}${Math.round(g).toString(16).padStart(2, "0")}${Math.round(b).toString(16).padStart(2, "0")}`
}

function brightenColor(hex: string, amount: number) {
  const { r, g, b } = hexToRgb(hex)
  return rgbToHex(
    Math.min(255, r + (255 - r) * amount),
    Math.min(255, g + (255 - g) * amount),
    Math.min(255, b + (255 - b) * amount)
  )
}

function blendColors(hex1: string, hex2: string, t: number) {
  const c1 = hexToRgb(hex1)
  const c2 = hexToRgb(hex2)
  return rgbToHex(
    c1.r * (1 - t) + c2.r * t,
    c1.g * (1 - t) + c2.g * t,
    c1.b * (1 - t) + c2.b * t
  )
}
