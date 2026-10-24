"use client"

import { useRef, useState, useMemo, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles,
  Eraser,
  RotateCcw,
  Brush,
  Hand,
  AlertCircle,
  Info,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  TOPPINGS,
  TOPPING_CATEGORY_META,
  TOPPING_METHOD_META,
  type ToppingMaterial,
  type ToppingCategory,
  type ToppingApplicationMethod,
} from "@/lib/toppings"
import {
  useKitchen,
  toppingsSummary,
  totalToppingGrams,
  bowlLayers,
  type AppliedTopping,
} from "@/lib/kitchen-store"
import { findScienceNote } from "@/lib/science"

const CATEGORIES: ToppingCategory[] = ["glaze", "frosting", "decoration", "fruit", "nut", "finish"]

export function ToppingsStation() {
  const bowl = useKitchen((s) => s.bowl)
  const mixLevel = useKitchen((s) => s.mixLevel)
  const baking = useKitchen((s) => s.baking)
  const appliedToppings = useKitchen((s) => s.appliedToppings)
  const selectedToppingId = useKitchen((s) => s.selectedToppingId)
  const toppingBrushSize = useKitchen((s) => s.toppingBrushSize)
  const setSelectedTopping = useKitchen((s) => s.setSelectedTopping)
  const setToppingBrushSize = useKitchen((s) => s.setToppingBrushSize)
  const applyTopping = useKitchen((s) => s.applyTopping)
  const removeTopping = useKitchen((s) => s.removeTopping)
  const clearToppings = useKitchen((s) => s.clearToppings)
  const pushLog = useKitchen((s) => s.pushLog)

  const [activeCat, setActiveCat] = useState<ToppingCategory | "all">("all")
  const [query, setQuery] = useState("")

  const canvasRef = useRef<HTMLDivElement>(null)
  const [isApplying, setIsApplying] = useState(false)
  const [strokePath, setStrokePath] = useState<{ x: number; y: number }[]>([])

  const selectedTopping = selectedToppingId
    ? TOPPINGS.find((t) => t.id === selectedToppingId)
    : null

  const filteredToppings = useMemo(() => {
    return TOPPINGS.filter((t) => {
      if (activeCat !== "all" && t.category !== activeCat) return false
      if (query && !t.name.toLowerCase().includes(query.toLowerCase())) return false
      return true
    })
  }, [activeCat, query])

  const summary = toppingsSummary(appliedToppings, toppingBrushSize)
  const totalGrams = totalToppingGrams(appliedToppings, toppingBrushSize)

  // Determine if there's a baked good to decorate
  const layers = bowlLayers(bowl)
  const hasBakedGood = baking.status === "done" || (baking.brownLevel > 0.05 && layers.length > 0)
  const canDecorateRaw = layers.length > 0 // allow topping on raw bakes too — user's call

  // Compute the mixed color of the bake (for the pastry base)
  const bakeColor = useMemo(() => {
    if (layers.length === 0) return { r: 230, g: 200, b: 160 }
    const totalMass = layers.reduce((a, l) => a + l.grams, 0)
    return layers.reduce(
      (acc, l) => {
        const hex = l.ingredient.color
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)
        const w = l.grams / totalMass
        acc.r += r * w
        acc.g += g * w
        acc.b += b * w
        return acc
      },
      { r: 0, g: 0, b: 0 }
    )
  }, [layers])

  // ─── Pointer-event based application (works for touch + mouse) ──────────
  const getCanvasPoint = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 50, y: 50 }
    const rect = canvas.getBoundingClientRect()
    const x = ((clientX - rect.left) / rect.width) * 100
    const y = ((clientY - rect.top) / rect.height) * 100
    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    }
  }, [])

  const startStroke = useCallback(
    (e: React.PointerEvent) => {
      if (!selectedTopping) return
      // Touch-specific: prevent scroll while applying
      if (e.pointerType === "touch") {
        e.preventDefault()
      }
      (e.target as Element).setPointerCapture(e.pointerId)
      setIsApplying(true)
      const p = getCanvasPoint(e.clientX, e.clientY)
      setStrokePath([p])

      // For "place" method, apply immediately and end
      if (selectedTopping.method === "place") {
        applyTopping({
          toppingId: selectedTopping.id,
          x: p.x,
          y: p.y,
          amount: toppingBrushSize,
          rotation: Math.random() * 360,
        })
        setIsApplying(false)
        setStrokePath([])
      }
    },
    [selectedTopping, toppingBrushSize, applyTopping, getCanvasPoint]
  )

  const continueStroke = useCallback(
    (e: React.PointerEvent) => {
      if (!isApplying || !selectedTopping) return
      if (e.pointerType === "touch") {
        e.preventDefault()
      }
      const p = getCanvasPoint(e.clientX, e.clientY)
      setStrokePath((prev) => {
        const last = prev[prev.length - 1]
        // Throttle: only add a point if it moved enough
        if (last && Math.hypot(p.x - last.x, p.y - last.y) < 2) return prev
        return [...prev, p]
      })

      // For scatter/dust methods, apply small topping instances at intervals along the stroke
      const method = selectedTopping.method
      if (method === "scatter" || method === "dust") {
        // Apply probabilistically based on distance
        if (Math.random() < 0.18) {
          applyTopping({
            toppingId: selectedTopping.id,
            x: p.x + (Math.random() - 0.5) * 8,
            y: p.y + (Math.random() - 0.5) * 8,
            amount: 0.3 + Math.random() * 0.4,
            rotation: Math.random() * 360,
          })
        }
      }
    },
    [isApplying, selectedTopping, applyTopping, getCanvasPoint]
  )

  const endStroke = useCallback(
    (e: React.PointerEvent) => {
      if (!selectedTopping) return
      if (e.pointerType === "touch") {
        try {
          (e.target as Element).releasePointerCapture(e.pointerId)
        } catch {}
      }
      // For drizzle/pipe methods, store the full stroke as a path
      if (isApplying && strokePath.length > 1) {
        const method = selectedTopping.method
        if (method === "drizzle" || method === "pipe") {
          // Apply as a single stroke path
          const start = strokePath[0]
          applyTopping({
            toppingId: selectedTopping.id,
            x: start.x,
            y: start.y,
            amount: toppingBrushSize,
            rotation: 0,
            path: strokePath,
          })
        } else if (method === "layer") {
          // Layer = broad even coat, apply once at centroid
          const cx = strokePath.reduce((a, p) => a + p.x, 0) / strokePath.length
          const cy = strokePath.reduce((a, p) => a + p.y, 0) / strokePath.length
          applyTopping({
            toppingId: selectedTopping.id,
            x: cx,
            y: cy,
            amount: toppingBrushSize,
            rotation: 0,
          })
        }
      }
      setIsApplying(false)
      setStrokePath([])
    },
    [isApplying, selectedTopping, strokePath, toppingBrushSize, applyTopping]
  )

  // Prevent the whole page from scrolling on touch when interacting with canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const preventScroll = (e: TouchEvent) => {
      if (isApplying) e.preventDefault()
    }
    canvas.addEventListener("touchmove", preventScroll, { passive: false })
    return () => canvas.removeEventListener("touchmove", preventScroll)
  }, [isApplying])

  // Build visual base for the baked good
  const baseHex = `#${Math.round(bakeColor.r).toString(16).padStart(2, "0")}${Math.round(bakeColor.g).toString(16).padStart(2, "0")}${Math.round(bakeColor.b).toString(16).padStart(2, "0")}`
  const brownLevel = baking.brownLevel
  // Apply browning to the base
  const brownedHex = applyBrowning(baseHex, brownLevel)

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-4 h-full">
      {/* Left: pastry canvas + topping palette */}
      <div className="flex flex-col gap-3 min-h-0">
        {/* ─── Pastry canvas ─── */}
        <div
          ref={canvasRef}
          className="relative flex-1 min-h-[340px] sm:min-h-[420px] rounded-2xl overflow-hidden select-none"
          style={{
            background:
              "radial-gradient(ellipse 90% 70% at 50% 30%, #fff8e8 0%, #fff0d0 30%, #f0dca8 60%, #c89858 90%, #8a6028 100%)",
            boxShadow: "inset 0 0 80px rgba(120, 80, 40, 0.25), inset 0 8px 20px rgba(255,255,255,0.5)",
            touchAction: selectedTopping ? "none" : "auto",
            cursor: selectedTopping ? "crosshair" : "default",
          }}
          onPointerDown={startStroke}
          onPointerMove={continueStroke}
          onPointerUp={endStroke}
          onPointerCancel={endStroke}
          onPointerLeave={endStroke}
        >
          {/* Ambient sunbeam */}
          <div className="absolute inset-0 sunbeam pointer-events-none" />

          {/* HD Serving plate — porcelain with rim and depth */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: "78%",
              height: "78%",
              background:
                "radial-gradient(circle at 30% 25%, rgba(255, 255, 255, 0.98) 0%, rgba(250, 245, 235, 0.95) 25%, rgba(232, 220, 200, 0.88) 55%, rgba(180, 160, 130, 0.7) 90%, rgba(120, 95, 60, 0.5) 100%)",
              boxShadow:
                "0 18px 48px -8px rgba(40, 25, 10, 0.4), 0 8px 18px -4px rgba(80, 50, 20, 0.3), inset 0 -8px 20px rgba(120, 80, 40, 0.25), inset 0 4px 10px rgba(255, 255, 255, 0.7), 0 0 0 2px rgba(220, 200, 170, 0.4)",
            }}
          >
            {/* Plate rim highlight */}
            <div
              className="absolute inset-2 rounded-full pointer-events-none"
              style={{
                boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.9), inset 0 -1px 2px rgba(80, 50, 20, 0.15)",
              }}
            />
            {/* Plate inner well (subtle depression) */}
            <div
              className="absolute inset-[8%] rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at 50% 50%, transparent 70%, rgba(80, 50, 20, 0.08) 100%)",
              }}
            />
            {/* Specular highlight on plate */}
            <div
              className="absolute top-3 left-6 right-1/2 h-2 rounded-full opacity-70 pointer-events-none"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)",
                filter: "blur(1.5px)",
              }}
            />
          </div>

          {/* Baked good (the pastry being decorated) */}
          {canDecorateRaw ? (
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[42%]"
              style={{
                width: `${50 + baking.riseLevel * 8}%`,
                height: `${50 + baking.riseLevel * 8}%`,
                background: `radial-gradient(ellipse at 35% 30%, ${brighten(brownedHex, 0.18)}, ${brownedHex} 60%, ${darken(brownedHex, 0.18)} 100%)`,
                boxShadow:
                  "inset 0 -8px 18px rgba(80,40,15,0.35), inset 0 4px 10px rgba(255,255,255,0.4), 0 8px 20px rgba(80,50,20,0.3)",
              }}
              animate={isApplying ? { scale: [1, 1.005, 1] } : {}}
              transition={{ duration: 0.4, repeat: isApplying ? Infinity : 0 }}
            >
              {/* Surface texture */}
              <div
                className="absolute inset-0 rounded-[42%] opacity-40"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 25% 30%, rgba(0,0,0,0.2) 0.4px, transparent 1.5px), radial-gradient(circle at 65% 60%, rgba(0,0,0,0.18) 0.4px, transparent 1.4px), radial-gradient(circle at 45% 75%, rgba(255,255,255,0.25) 0.3px, transparent 1.2px)",
                  backgroundSize: "16px 16px, 18px 18px, 14px 14px",
                }}
              />
              {/* Crust crackle */}
              {brownLevel > 0.5 && (
                <div
                  className="absolute inset-0 rounded-[42%] opacity-50"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 30% 40%, rgba(0,0,0,0.5) 0.4px, transparent 1.5px), radial-gradient(circle at 70% 30%, rgba(0,0,0,0.35) 0.3px, transparent 1.2px), radial-gradient(circle at 50% 65%, rgba(0,0,0,0.45) 0.5px, transparent 1.4px)",
                    backgroundSize: "20px 20px, 22px 22px, 18px 18px",
                  }}
                />
              )}
            </motion.div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-center px-6">
              <div className="text-muted-foreground">
                <Hand className="w-12 h-12 mx-auto mb-2 opacity-40" />
                <p className="text-sm">
                  Bake something first in the Oven station — then decorate it here.
                </p>
                <p className="text-xs mt-1 italic">
                  Or, you can still practice decoration on an empty plate.
                </p>
              </div>
            </div>
          )}

          {/* Applied toppings — rendered above the pastry */}
          <div className="absolute inset-0 pointer-events-none">
            {appliedToppings.map((applied) => (
              <ToppingInstance
                key={applied.id}
                applied={applied}
                topping={TOPPINGS.find((t) => t.id === applied.toppingId)!}
              />
            ))}
          </div>

          {/* Active stroke preview (for drizzle/pipe) */}
          {isApplying && selectedTopping && strokePath.length > 1 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <polyline
                points={strokePath.map((p) => `${p.x}%,${p.y}%`).join(" ")}
                fill="none"
                stroke={selectedTopping.color}
                strokeWidth={4 + toppingBrushSize * 6}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.7}
              />
            </svg>
          )}

          {/* Top status bar */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
            <Badge variant="secondary" className="backdrop-blur-sm bg-card/85">
              {selectedTopping ? (
                <>
                  {selectedTopping.emoji} {selectedTopping.name}
                  <span className="ml-1 text-[10px] opacity-70">
                    · {TOPPING_METHOD_META[selectedTopping.method].label}
                  </span>
                </>
              ) : (
                <>
                  <Hand className="w-3 h-3 mr-1" /> Pick a topping →
                </>
              )}
            </Badge>
            <Badge variant="secondary" className="backdrop-blur-sm bg-card/85">
              <Sparkles className="w-3 h-3 mr-1" />
              {appliedToppings.length} applied · {totalGrams}g
            </Badge>
          </div>

          {/* Bottom hint when nothing selected */}
          {!selectedTopping && (
            <div className="absolute bottom-3 left-3 right-3 text-center pointer-events-none">
              <Badge variant="outline" className="bg-card/85 backdrop-blur-sm text-xs">
                Select a topping from the palette below ↓
              </Badge>
            </div>
          )}

          {/* Brush size indicator (visible while applying) */}
          {isApplying && (
            <div
              className="absolute pointer-events-none rounded-full border-2 border-primary/60"
              style={{
                left: `calc(${strokePath[strokePath.length - 1]?.x ?? 50}% - ${10 + toppingBrushSize * 14}px)`,
                top: `calc(${strokePath[strokePath.length - 1]?.y ?? 50}% - ${10 + toppingBrushSize * 14}px)`,
                width: `${20 + toppingBrushSize * 28}px`,
                height: `${20 + toppingBrushSize * 28}px`,
              }}
            />
          )}
        </div>

        {/* ─── Topping palette ─── */}
        <div className="rounded-lg border border-border bg-card p-3 space-y-3">
          {/* Search + categories */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search toppings..."
                className="pl-8 h-10"
              />
            </div>
          </div>

          {/* Category chips — touch-friendly (44px height) */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveCat("all")}
              className={`px-3 min-h-[36px] rounded-full text-xs font-medium border transition ${
                activeCat === "all"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border hover:border-primary/50"
              }`}
            >
              All
            </button>
            {CATEGORIES.map((c) => {
              const meta = TOPPING_CATEGORY_META[c]
              const active = activeCat === c
              return (
                <button
                  key={c}
                  onClick={() => setActiveCat(c)}
                  className={`px-3 min-h-[36px] rounded-full text-xs font-medium border transition flex items-center gap-1 ${
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover:border-primary/50"
                  }`}
                >
                  <span>{meta.icon}</span>
                  {meta.label}
                </button>
              )
            })}
          </div>

          {/* Topping buttons — large tap targets for iPad */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-[200px] overflow-y-auto kitchen-scrollbar pr-1">
            {filteredToppings.map((t) => {
              const isSelected = selectedToppingId === t.id
              return (
                <motion.button
                  key={t.id}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setSelectedTopping(isSelected ? null : t.id)}
                  className={`relative flex flex-col items-center justify-center text-center gap-1 p-2 rounded-lg border min-h-[80px] transition ${
                    isSelected
                      ? "border-primary ring-2 ring-primary/30 bg-primary/5"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-lg border border-black/10"
                    style={{
                      background: `radial-gradient(circle at 30% 30%, ${t.highlight ?? t.color}, ${t.color})`,
                    }}
                  >
                    {t.emoji}
                  </div>
                  <div className="text-[10px] font-medium leading-tight line-clamp-2">
                    {t.name}
                  </div>
                  <div className="text-[9px] text-muted-foreground font-mono">
                    {TOPPING_METHOD_META[t.method].label}
                  </div>
                </motion.button>
              )
            })}
            {filteredToppings.length === 0 && (
              <div className="col-span-full text-center py-6 text-sm text-muted-foreground">
                No toppings match your search.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right: tool panel */}
      <div className="border border-border rounded-lg bg-card p-4 flex flex-col gap-3 min-h-0 overflow-y-auto kitchen-scrollbar">
        <div>
          <h3 className="text-sm font-semibold mb-1">Toppings Station</h3>
          <p className="text-xs text-muted-foreground">
            Decorate your bake. Drag (or trace with your finger on iPad) across the pastry to apply.
          </p>
        </div>

        {/* Selected topping detail */}
        <AnimatePresence mode="wait">
          {selectedTopping ? (
            <motion.div
              key={selectedTopping.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="rounded-md border border-border p-3 space-y-2"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xl border border-black/10"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${selectedTopping.highlight ?? selectedTopping.color}, ${selectedTopping.color})`,
                  }}
                >
                  {selectedTopping.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold leading-tight">{selectedTopping.name}</div>
                  <div className="text-[10px] text-muted-foreground capitalize">
                    {selectedTopping.category} · {selectedTopping.method}
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{selectedTopping.notes}</p>

              <div className="rounded-md bg-muted/40 p-2 text-[11px]">
                <div className="font-semibold flex items-center gap-1 mb-0.5">
                  {TOPPING_METHOD_META[selectedTopping.method].icon}
                  {TOPPING_METHOD_META[selectedTopping.method].label}
                </div>
                <div className="text-muted-foreground">
                  {TOPPING_METHOD_META[selectedTopping.method].description}
                </div>
              </div>

              {selectedTopping.requiresBaked === false && (
                <div className="rounded-md bg-amber-50 border border-amber-200 p-2 text-[11px] text-amber-800">
                  <AlertCircle className="w-3 h-3 inline mr-1" />
                  Apply BEFORE baking (e.g., streusel, sugar crust).
                </div>
              )}

              {findScienceNote(selectedTopping.science ?? selectedTopping.id) && (
                <div className="rounded-md border border-accent/40 bg-accent/10 p-2">
                  <div className="text-[10px] font-semibold text-primary flex items-center gap-1">
                    <Info className="w-3 h-3" /> Science
                  </div>
                  <div className="text-[11px] mt-0.5 font-medium">
                    {findScienceNote(selectedTopping.science ?? selectedTopping.id)?.title}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-3">
                    {findScienceNote(selectedTopping.science ?? selectedTopping.id)?.body}
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground"
            >
              <Brush className="w-6 h-6 mx-auto mb-1.5 opacity-40" />
              Pick a topping to start decorating.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Brush size — touch-friendly slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium flex items-center gap-1">
              <Brush className="w-3.5 h-3.5" /> Brush size
            </span>
            <span className="font-mono text-primary">
              {(toppingBrushSize * 100).toFixed(0)}%
            </span>
          </div>
          <Slider
            value={[toppingBrushSize]}
            onValueChange={(v) => setToppingBrushSize(v[0])}
            min={0.3}
            max={1.5}
            step={0.1}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
            <span>Fine</span>
            <span>Medium</span>
            <span>Heavy</span>
          </div>
        </div>

        {/* Action buttons — large for touch */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={() => {
              if (appliedToppings.length === 0) return
              const last = appliedToppings[appliedToppings.length - 1]
              removeTopping(last.id)
              pushLog("Undid last topping application", "action")
            }}
            disabled={appliedToppings.length === 0}
            className="h-11"
          >
            <Eraser className="w-4 h-4 mr-1.5" /> Undo
          </Button>
          <Button
            variant="outline"
            onClick={clearToppings}
            disabled={appliedToppings.length === 0}
            className="h-11"
          >
            <RotateCcw className="w-4 h-4 mr-1.5" /> Clear all
          </Button>
        </div>

        {/* Applied summary */}
        <div className="space-y-1.5">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Applied ({appliedToppings.length})
          </div>
          {summary.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No toppings applied yet.
            </p>
          ) : (
            <div className="space-y-1">
              {summary.map((s) => (
                <div
                  key={s.topping.id}
                  className="flex items-center justify-between rounded-md bg-muted/30 px-2 py-1 text-xs"
                >
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: s.topping.color }}
                    />
                    {s.topping.emoji} {s.topping.name}
                    <span className="text-muted-foreground">×{s.count}</span>
                  </span>
                  <span className="font-mono text-muted-foreground">{s.grams}g</span>
                </div>
              ))}
              <div className="flex justify-between pt-1 border-t border-border/60 text-xs font-mono">
                <span className="text-muted-foreground">Total</span>
                <span>{totalGrams}g</span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto pt-3 border-t border-border text-[11px] text-muted-foreground">
          <p className="flex items-start gap-1.5">
            <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
            <span>
              iPad tip: drag with one finger to apply. The brush follows your fingertip; lift to
              finish the stroke.
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Topping renderer ──────────────────────────────────────────────────────

function ToppingInstance({
  applied,
  topping,
}: {
  applied: AppliedTopping
  topping: ToppingMaterial
}) {
  const size = 12 + applied.amount * 22

  // ─── Drizzle / Pipe: render as a stroked path ───
  if ((topping.method === "drizzle" || topping.method === "pipe") && applied.path && applied.path.length > 1) {
    return (
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
        <motion.polyline
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          points={applied.path.map((p) => `${p.x}%,${p.y}%`).join(" ")}
          fill="none"
          stroke={topping.color}
          strokeWidth={topping.method === "pipe" ? 8 + applied.amount * 12 : 3 + applied.amount * 4}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            filter: `drop-shadow(0 1px 1px rgba(0,0,0,0.25))`,
          }}
        />
        {/* Highlight along the stroke */}
        <polyline
          points={applied.path.map((p) => `${p.x}%,${p.y}%`).join(" ")}
          fill="none"
          stroke={topping.highlight ?? "#ffffff"}
          strokeWidth={topping.method === "pipe" ? 2 : 1}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.55}
          style={{ transform: "translateY(-1px)" }}
        />
      </svg>
    )
  }

  // ─── Dust: scattered small particles ───
  if (topping.method === "dust") {
    const particleCount = Math.max(6, Math.floor(applied.amount * 18))
    return (
      <div
        className="absolute"
        style={{
          left: `${applied.x}%`,
          top: `${applied.y}%`,
          width: `${size}px`,
          height: `${size}px`,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      >
        {Array.from({ length: particleCount }).map((_, i) => {
          const angle = (i / particleCount) * Math.PI * 2
          const dist = (Math.random() * 0.5 + 0.2) * size
          const px = Math.cos(angle) * dist + (Math.random() - 0.5) * size * 0.4
          const py = Math.sin(angle) * dist + (Math.random() - 0.5) * size * 0.4
          const ps = 1 + Math.random() * 2.5
          return (
            <span
              key={i}
              className="absolute rounded-full"
              style={{
                left: `calc(50% + ${px}px)`,
                top: `calc(50% + ${py}px)`,
                width: `${ps}px`,
                height: `${ps}px`,
                background: Math.random() > 0.7 ? topping.highlight ?? topping.color : topping.color,
                opacity: 0.75 + Math.random() * 0.25,
              }}
            />
          )
        })}
      </div>
    )
  }

  // ─── Scatter: discrete pieces (sprinkles, nuts) ───
  if (topping.method === "scatter") {
    return (
      <motion.div
        initial={{ scale: 0.4, opacity: 0, y: -4 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="absolute"
        style={{
          left: `${applied.x}%`,
          top: `${applied.y}%`,
          width: `${size}px`,
          height: `${size}px`,
          transform: `translate(-50%, -50%) rotate(${applied.rotation}deg)`,
          pointerEvents: "none",
        }}
      >
        {/* Multi-piece scatter */}
        {Array.from({ length: 4 + Math.floor(applied.amount * 5) }).map((_, i) => {
          const px = (Math.random() - 0.5) * size
          const py = (Math.random() - 0.5) * size
          const ps = 2 + Math.random() * 4
          // Different shapes per topping type
          const isSprinkle = topping.id.includes("sprinkles")
          const shape: React.CSSProperties = {
            position: "absolute",
            left: `calc(50% + ${px}px)`,
            top: `calc(50% + ${py}px)`,
            background: isSprinkle
              ? SPRINKLE_COLORS[i % SPRINKLE_COLORS.length]
              : Math.random() > 0.6
              ? topping.highlight ?? topping.color
              : topping.color,
          }
          if (isSprinkle) {
            return (
              <span
                key={i}
                style={{
                  ...shape,
                  width: `${ps * 2.5}px`,
                  height: `${ps * 0.8}px`,
                  borderRadius: "2px",
                  transform: `rotate(${Math.random() * 360}deg)`,
                  boxShadow: "0 0.5px 0.5px rgba(0,0,0,0.3)",
                }}
              />
            )
          }
          // Nuts / coconut / sugar — irregular chunks
          return (
            <span
              key={i}
              style={{
                ...shape,
                width: `${ps}px`,
                height: `${ps}px`,
                borderRadius: "40% 60% 50% 50%",
                boxShadow: "0 0.5px 0.5px rgba(0,0,0,0.25)",
              }}
            />
          )
        })}
      </motion.div>
    )
  }

  // ─── Layer: broad even coat (honey wash, lemon glaze brushed) ───
  if (topping.method === "layer") {
    const coatSize = size * 3
    return (
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.85 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="absolute rounded-full"
        style={{
          left: `${applied.x}%`,
          top: `${applied.y}%`,
          width: `${coatSize}px`,
          height: `${coatSize}px`,
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(circle, ${topping.color}f0 0%, ${topping.color}cc 50%, ${topping.color}33 80%, transparent 100%)`,
          pointerEvents: "none",
          mixBlendMode: "multiply",
        }}
      />
    )
  }

  // ─── Place: positioned piece (flowers, berries, cherries) ───
  if (topping.method === "place") {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0, rotate: -10 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.3, ease: "backOut" }}
        className="absolute"
        style={{
          left: `${applied.x}%`,
          top: `${applied.y}%`,
          width: `${size}px`,
          height: `${size}px`,
          transform: `translate(-50%, -50%) rotate(${applied.rotation}deg)`,
          pointerEvents: "none",
        }}
      >
        {/* Render specific fruit/flower shapes by topping id */}
        {topping.id === "fresh-berries" ? (
          <BerryCluster size={size} color={topping.color} highlight={topping.highlight ?? "#ffffff"} />
        ) : topping.id === "edible-flowers" ? (
          <FlowerShape size={size} color={topping.color} highlight={topping.highlight ?? "#ffffff"} />
        ) : topping.id === "sliced-strawberry" ? (
          <StrawberryFan size={size} color={topping.color} highlight={topping.highlight ?? "#ffffff"} />
        ) : (
          <div
            className="w-full h-full rounded-full flex items-center justify-center"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${topping.highlight ?? topping.color}, ${topping.color})`,
              boxShadow: "0 2px 4px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.4)",
            }}
          >
            <span className="text-[10px]">{topping.emoji}</span>
          </div>
        )}
      </motion.div>
    )
  }

  return null
}

// ─── Specialized topping shapes ────────────────────────────────────────────

const SPRINKLE_COLORS = ["#E84A4F", "#5A8ACF", "#F5D040", "#7AC07A", "#B070C8", "#FF8A40"]

function BerryCluster({ size, color, highlight }: { size: number; color: string; highlight: string }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size}>
      {/* Berry 1 (back) */}
      <circle cx="14" cy="14" r="9" fill={color} />
      <circle cx="11" cy="11" r="3" fill={highlight} opacity="0.7" />
      {/* Berry 2 (front) */}
      <circle cx="24" cy="22" r="10" fill={color} />
      <circle cx="21" cy="19" r="3.5" fill={highlight} opacity="0.7" />
      {/* Berry 3 (small) */}
      <circle cx="14" cy="26" r="7" fill={color} />
      <circle cx="12" cy="24" r="2" fill={highlight} opacity="0.7" />
    </svg>
  )
}

function FlowerShape({ size, color, highlight }: { size: number; color: string; highlight: string }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size}>
      {[0, 72, 144, 216, 288].map((angle) => (
        <ellipse
          key={angle}
          cx="20"
          cy="12"
          rx="6"
          ry="9"
          fill={color}
          opacity="0.85"
          transform={`rotate(${angle} 20 20)`}
        />
      ))}
      <circle cx="20" cy="20" r="5" fill={highlight} />
      <circle cx="20" cy="20" r="2.5" fill="#F5D040" />
    </svg>
  )
}

function StrawberryFan({ size, color, highlight }: { size: number; color: string; highlight: string }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size}>
      {/* 3 fanned slices */}
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${8 + i * 8}, 6) rotate(${(i - 1) * 15})`}>
          <ellipse cx="12" cy="14" rx="9" ry="13" fill={color} />
          <ellipse cx="10" cy="11" rx="3" ry="4" fill={highlight} opacity="0.6" />
          {/* Seeds */}
          {[[8, 8], [14, 14], [10, 18]].map(([sx, sy], j) => (
            <ellipse key={j} cx={sx} cy={sy} rx="0.8" ry="1.5" fill="#F5E8A0" />
          ))}
        </g>
      ))}
    </svg>
  )
}

// ─── Color helpers ─────────────────────────────────────────────────────────

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${Math.round(r).toString(16).padStart(2, "0")}${Math.round(g).toString(16).padStart(2, "0")}${Math.round(b).toString(16).padStart(2, "0")}`
}

function applyBrowning(hex: string, brown: number) {
  if (brown < 0.02) return hex
  const { r, g, b } = hexToRgb(hex)
  // Multiply toward dark brown #3a1810
  const tr = 58, tg = 24, tb = 16
  const factor = Math.min(0.95, brown * 1.1)
  return rgbToHex(
    r * (1 - factor) + tr * factor,
    g * (1 - factor) + tg * factor,
    b * (1 - factor) + tb * factor
  )
}

function brighten(hex: string, amount: number) {
  const { r, g, b } = hexToRgb(hex)
  return rgbToHex(
    Math.min(255, r + (255 - r) * amount),
    Math.min(255, g + (255 - g) * amount),
    Math.min(255, b + (255 - b) * amount)
  )
}

function darken(hex: string, amount: number) {
  const { r, g, b } = hexToRgb(hex)
  return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount))
}
