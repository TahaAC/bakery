"use client"

import { useMemo, useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Star,
  Users,
  Sparkles,
  Camera,
  RotateCcw,
  Clock,
  ChefHat,
  Award,
  MessageCircle,
  Share2,
  Heart,
  PartyPopper,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  useKitchen,
  bowlLayers,
  toppingsSummary,
  totalToppingGrams,
  type AppliedTopping,
} from "@/lib/kitchen-store"
import { TOPPINGS } from "@/lib/toppings"
import { formatTimeHM } from "@/hooks/use-mounted"
import { CakeView } from "./CakeView"

const SLICE_OPTIONS = [0, 4, 6, 8, 10, 12]

export function ShowcaseStation() {
  const bowl = useKitchen((s) => s.bowl)
  const mixLevel = useKitchen((s) => s.mixLevel)
  const baking = useKitchen((s) => s.baking)
  const appliedToppings = useKitchen((s) => s.appliedToppings)
  const toppingBrushSize = useKitchen((s) => s.toppingBrushSize)
  const recipeName = useKitchen((s) => s.recipeName)
  const sliceCount = useKitchen((s) => s.sliceCount)
  const servedToCustomer = useKitchen((s) => s.servedToCustomer)
  const servedAt = useKitchen((s) => s.servedAt)
  const customerRating = useKitchen((s) => s.customerRating)
  const customerReview = useKitchen((s) => s.customerReview)
  const setSliceCount = useKitchen((s) => s.setSliceCount)
  const serveToCustomer = useKitchen((s) => s.serveToCustomer)
  const rateByCustomer = useKitchen((s) => s.rateByCustomer)
  const resetShowcase = useKitchen((s) => s.resetShowcase)
  const setActiveStation = useKitchen((s) => s.setActiveStation)
  const pushLog = useKitchen((s) => s.pushLog)

  const [showCelebration, setShowCelebration] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const celebrationTimer = useRef<number | null>(null)

  // Pre-compute confetti particles ONCE per celebration so they don't
  // regenerate (and visually "bubble") on every render during the animation.
  const [confettiPieces, setConfettiPieces] = useState<
    { left: number; duration: number; delay: number; direction: number; color: string }[]
  >([])
  const lastCelebrationKey = useRef<number>(0)

  // Determine cake readiness
  const layers = bowlLayers(bowl)
  const hasBakedGood = layers.length > 0 && (baking.status === "done" || baking.brownLevel > 0.05)
  const hasToppings = appliedToppings.length > 0
  const isReady = hasBakedGood

  // Compute cake color from bowl ingredients + browning
  const cakeColor = useMemo(() => {
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

  const cakeHex = `#${Math.round(cakeColor.r).toString(16).padStart(2, "0")}${Math.round(cakeColor.g).toString(16).padStart(2, "0")}${Math.round(cakeColor.b).toString(16).padStart(2, "0")}`
  const brownedHex = applyBrowning(cakeHex, baking.brownLevel)

  const toppingList = toppingsSummary(appliedToppings, toppingBrushSize)
  const toppingTotalGrams = totalToppingGrams(appliedToppings, toppingBrushSize)
  const totalMass = bowl.reduce((a, b) => a + b.grams, 0) + toppingTotalGrams

  // Trigger celebration when cake is served.
  // Confetti pieces are pre-computed ONCE here (using servedAt as a stable
  // dependency key) so they don't regenerate on every render during the
  // animation, which would cause visible flicker ("bubbling").
  useEffect(() => {
    if (servedToCustomer && servedAt && servedAt !== lastCelebrationKey.current) {
      lastCelebrationKey.current = servedAt
      // Generate 40 confetti pieces with stable random properties
      const pieces = Array.from({ length: 40 }).map(() => ({
        left: Math.random() * 100,
        duration: 2 + Math.random() * 1.5,
        delay: Math.random() * 0.6,
        direction: Math.random() > 0.5 ? 1 : -1,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      }))
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConfettiPieces(pieces)
      setShowCelebration(true)
      if (celebrationTimer.current) window.clearTimeout(celebrationTimer.current)
      celebrationTimer.current = window.setTimeout(() => setShowCelebration(false), 3500)
    }
    return () => {
      if (celebrationTimer.current) window.clearTimeout(celebrationTimer.current)
    }
  }, [servedToCustomer, servedAt])

  const handleServe = () => {
    if (!isReady) return
    serveToCustomer()
  }

  const handleShare = () => {
    pushLog("Customer shared a photo of the bake on social media", "action")
    setLikeCount((c) => c + Math.floor(Math.random() * 12) + 3)
  }

  const handleLike = () => {
    setLikeCount((c) => c + 1)
    pushLog("Customer liked the bake", "action")
  }

  // Empty state
  if (!isReady) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center gap-4 p-6">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-24 h-24 rounded-full metal-copper flex items-center justify-center text-5xl shadow-xl"
        >
          🎂
        </motion.div>
        <div>
          <h2 className="text-xl font-bold mb-1">Showcase Empty</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Bake and decorate a cake first, then it will be displayed here for the customer to see.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap justify-center">
          {!hasBakedGood && (
            <Button onClick={() => setActiveStation("oven")} variant="default">
              <ChefHat className="w-4 h-4 mr-1.5" /> Go to Oven
            </Button>
          )}
          {hasBakedGood && !hasToppings && (
            <Button onClick={() => setActiveStation("toppings")} variant="default">
              <Sparkles className="w-4 h-4 mr-1.5" /> Add Toppings
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Served time formatted nicely (only set after user action, so no hydration risk)
  const servedTimeText = servedAt ? formatTimeHM(servedAt) : null

  return (
    <div className="grid lg:grid-cols-[1fr_340px] gap-4 h-full relative">
      {/* ─── Left: Customer Display Case ─── */}
      <div className="flex flex-col gap-3 min-h-0 relative">
        {/* The HD display case — bakery window with dramatic spotlight */}
        <div
          className="relative flex-1 min-h-[420px] rounded-2xl overflow-hidden"
          style={{
            background:
              "radial-gradient(ellipse 90% 70% at 50% 25%, #fff5d8 0%, #f0dca8 25%, #c89858 60%, #6a4520 90%, #2a1808 100%)",
            boxShadow:
              "inset 0 0 80px rgba(120, 80, 40, 0.25), inset 0 8px 20px rgba(255,255,255,0.5), inset 0 -12px 30px rgba(40, 20, 5, 0.6)",
          }}
        >
          {/* HD Bakery window back wall texture (subtle tile) */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent 0px, transparent 60px, rgba(120, 80, 40, 0.15) 60px, rgba(120, 80, 40, 0.15) 61px), repeating-linear-gradient(90deg, transparent 0px, transparent 60px, rgba(120, 80, 40, 0.15) 60px, rgba(120, 80, 40, 0.15) 61px)",
            }}
          />

          {/* HD Display case glass overlay — multi-layer reflections */}
          <div className="absolute inset-0 pointer-events-none glass-pane" />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(115deg, transparent 25%, rgba(255,255,255,0.20) 38%, rgba(255,255,255,0.40) 45%, rgba(255,255,255,0.15) 52%, transparent 65%)",
              mixBlendMode: "screen",
            }}
          />
          {/* Vertical streak reflection */}
          <div
            className="absolute inset-0 pointer-events-none opacity-50"
            style={{
              background:
                "linear-gradient(90deg, transparent 18%, rgba(255,255,255,0.10) 20%, transparent 22%, transparent 75%, rgba(255,255,255,0.08) 77%, transparent 79%)",
            }}
          />

          {/* HD Volumetric spotlight from above — bakery display beam */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 40% 50% at 50% 5%, rgba(255, 245, 200, 0.7) 0%, rgba(255, 235, 170, 0.3) 30%, transparent 70%)",
              mixBlendMode: "screen",
            }}
          />
          {/* Light shaft cone */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(255, 245, 200, 0.25) 0%, transparent 60%)",
              clipPath: "polygon(40% 0%, 60% 0%, 80% 100%, 20% 100%)",
              mixBlendMode: "screen",
            }}
          />

          {/* HD Floating dust motes in the spotlight (more, with depth) */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 18 }).map((_, i) => (
              <motion.span
                key={i}
                className="absolute rounded-full"
                style={{
                  left: `${15 + (i * 5) % 70}%`,
                  top: `${10 + (i * 11) % 40}%`,
                  width: 1 + (i % 3),
                  height: 1 + (i % 3),
                  background: i % 4 === 0 ? "rgba(255, 220, 150, 0.7)" : "rgba(255, 245, 200, 0.5)",
                }}
                animate={{
                  y: [0, -25, 0],
                  x: [(i % 2 === 0 ? -8 : 8), 0, (i % 2 === 0 ? -8 : 8)],
                  opacity: [0.2, 0.8, 0.2],
                }}
                transition={{
                  duration: 5 + (i % 4),
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </div>

          {/* HD Glass pedestal — cylindrical with reflections */}
          <div className="absolute left-1/2 bottom-[12%] -translate-x-1/2 w-[55%] h-5">
            {/* Top plate */}
            <div
              className="absolute inset-x-0 top-0 h-2 rounded-full"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(220, 230, 245, 0.7) 60%, rgba(180, 195, 215, 0.5) 100%)",
                boxShadow:
                  "inset 0 1px 1px rgba(255,255,255,0.9), 0 2px 4px rgba(0,0,0,0.3)",
              }}
            />
            {/* Reflection on plate */}
            <div
              className="absolute top-0.5 left-2 right-2 h-0.5 rounded-full"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)",
              }}
            />
            {/* Stem */}
            <div
              className="absolute top-2 bottom-0 left-1/2 -translate-x-1/2 w-[15%] rounded-b"
              style={{
                background:
                  "linear-gradient(180deg, rgba(220, 230, 245, 0.6) 0%, rgba(160, 175, 195, 0.4) 100%)",
              }}
            />
            {/* Soft contact shadow */}
            <div
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[90%] h-4 rounded-full"
              style={{
                background: "rgba(0,0,0,0.35)",
                filter: "blur(8px)",
              }}
            />
          </div>

          {/* Bakery floor (counter top edge) */}
          <div
            className="absolute inset-x-0 bottom-0 h-[8%]"
            style={{
              background:
                "linear-gradient(180deg, transparent 0%, rgba(80, 50, 20, 0.4) 30%, rgba(40, 25, 10, 0.7) 100%)",
            }}
          />

          {/* Subtle film grain */}
          <div className="absolute inset-0 film-grain" />

          {/* The Cake itself — realistic HD cake render */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <CakeView
              size={Math.min(420, 360)}
              showPlate
              sliceCount={sliceCount}
              steam={baking.status === "done" && baking.brownLevel > 0.3}
            />
          </div>

          {/* Customer "Like" button floating on cake (only when served) */}
          {servedToCustomer && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              onClick={handleLike}
              className="absolute top-4 right-4 z-30 flex items-center gap-2 px-3 py-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg border border-pink-200 active:scale-95 transition"
              aria-label="Like this cake"
            >
              <motion.div
                animate={likeCount > 0 ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Heart className={`w-5 h-5 ${likeCount > 0 ? "fill-pink-500 text-pink-500" : "text-pink-400"}`} />
              </motion.div>
              {likeCount > 0 && (
                <span className="text-xs font-semibold text-pink-700">{likeCount}</span>
              )}
            </motion.button>
          )}

          {/* Celebration confetti when served (pre-computed, no flicker) */}
          <AnimatePresence>
            {showCelebration && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {confettiPieces.map((piece, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-3"
                    style={{
                      left: `${piece.left}%`,
                      top: "-20px",
                      background: piece.color,
                      borderRadius: "2px",
                    }}
                    initial={{ y: -20, rotate: 0, opacity: 1 }}
                    animate={{
                      y: ["-20px", "110%"],
                      rotate: [0, 360 * piece.direction * 3],
                      opacity: [1, 1, 0.6],
                    }}
                    transition={{
                      duration: piece.duration,
                      delay: piece.delay,
                      ease: "easeIn",
                    }}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* "Served" banner */}
          <AnimatePresence>
            {servedToCustomer && (
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                className="absolute top-3 left-1/2 -translate-x-1/2 z-20"
              >
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500 text-white shadow-lg">
                  <PartyPopper className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold">Served to Customer</span>
                  {servedTimeText && (
                    <span className="text-[10px] opacity-80 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {servedTimeText}
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom info ribbon */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
            <Badge variant="secondary" className="backdrop-blur-sm bg-white/85 text-foreground">
              <ChefHat className="w-3 h-3 mr-1 text-primary" />
              {baking.donenessLabel}
            </Badge>
            <Badge variant="secondary" className="backdrop-blur-sm bg-white/85 text-foreground">
              <Sparkles className="w-3 h-3 mr-1 text-primary" />
              {toppingList.length} topping{toppingList.length === 1 ? "" : "s"}
            </Badge>
            <Badge variant="secondary" className="backdrop-blur-sm bg-white/85 text-foreground">
              <Users className="w-3 h-3 mr-1 text-primary" />
              {totalMass}g
            </Badge>
          </div>
        </div>

        {/* Slice / Serve controls — large touch targets */}
        <div className="rounded-lg border border-border bg-card p-3 space-y-3">
          {/* Slice selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">Slice the cake</span>
              <span className="text-muted-foreground">
                {sliceCount === 0 ? "Whole cake" : `${sliceCount} slices`}
              </span>
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {SLICE_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => setSliceCount(n)}
                  className={`min-h-[44px] rounded-md border text-sm font-medium transition active:scale-95 ${
                    sliceCount === n
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover:border-primary/50"
                  }`}
                  aria-label={n === 0 ? "Keep whole" : `Cut into ${n} slices`}
                >
                  {n === 0 ? "Whole" : n}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons — touch-friendly (min-h 48px) */}
          <div className="flex gap-2">
            {!servedToCustomer ? (
              <Button
                onClick={handleServe}
                className="flex-1 h-12 text-base"
                size="lg"
              >
                <Users className="w-5 h-5 mr-2" />
                Serve to Customer
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="flex-1 h-12"
                  size="lg"
                >
                  <Share2 className="w-4 h-4 mr-1.5" />
                  Share Photo
                </Button>
                <Button
                  onClick={resetShowcase}
                  variant="outline"
                  className="flex-1 h-12"
                  size="lg"
                >
                  <RotateCcw className="w-4 h-4 mr-1.5" />
                  New Customer
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ─── Right: Customer Card + Review ─── */}
      <div className="border border-border rounded-lg bg-card p-4 flex flex-col gap-3 min-h-0 overflow-y-auto kitchen-scrollbar">
        <div>
          <h3 className="text-sm font-semibold mb-1 flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-primary" /> Customer Display Card
          </h3>
          <p className="text-xs text-muted-foreground">
            What the customer sees when they walk up to the bakery counter.
          </p>
        </div>

        {/* The menu card */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border-2 border-primary/40 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-md"
        >
          <div className="text-center pb-2 border-b border-dashed border-primary/30">
            <div className="text-[9px] uppercase tracking-widest text-primary font-semibold">
              Today's Special
            </div>
            <div className="text-lg font-bold leading-tight mt-0.5">{recipeName}</div>
            <div className="text-[10px] text-muted-foreground italic mt-0.5">
              HIRA Bakery · Signature Bake
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5 my-3 text-center">
            <div className="rounded bg-white/60 p-1.5">
              <div className="text-[8px] uppercase text-muted-foreground">Weight</div>
              <div className="font-mono text-sm">{totalMass}g</div>
            </div>
            <div className="rounded bg-white/60 p-1.5">
              <div className="text-[8px] uppercase text-muted-foreground">Bake</div>
              <div className="font-mono text-sm">{baking.donenessLabel}</div>
            </div>
            <div className="rounded bg-white/60 p-1.5">
              <div className="text-[8px] uppercase text-muted-foreground">Decor</div>
              <div className="font-mono text-sm">{appliedToppings.length}</div>
            </div>
          </div>

          {/* Ingredients description (customer-facing menu description) */}
          <div className="text-[11px] text-muted-foreground leading-relaxed mb-2">
            <span className="font-semibold text-foreground">Made with:</span>{" "}
            {layers.map((l) => l.ingredient.name.toLowerCase()).join(", ")}
            {toppingList.length > 0 && (
              <>; topped with {toppingList.map((t) => t.topping.name.toLowerCase()).join(", ")}</>
            )}.
          </div>

          {/* Allergen notice */}
          <div className="text-[9px] text-muted-foreground italic border-t border-dashed border-primary/20 pt-1.5">
            Contains: {describeAllergens(layers)}
          </div>
        </motion.div>

        {/* Customer rating */}
        <AnimatePresence mode="wait">
          {servedToCustomer ? (
            <motion.div
              key="rated"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="rounded-lg border border-amber-200 bg-amber-50 p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-amber-700" />
                  Customer Review
                </div>
                {customerRating >= 4 && (
                  <Badge className="bg-amber-500 text-white text-[9px]">
                    <Award className="w-2.5 h-2.5 mr-0.5" />
                    Recommended
                  </Badge>
                )}
              </div>
              <div className="flex gap-0.5 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => rateByCustomer(star)}
                    className="p-0.5 active:scale-90 transition"
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= customerRating
                          ? "fill-amber-500 text-amber-500"
                          : "text-amber-300"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs font-mono text-amber-700">
                  {customerRating.toFixed(1)} / 5
                </span>
              </div>
              <p className="text-xs italic text-amber-900 leading-relaxed">
                &ldquo;{customerReview}&rdquo;
              </p>
              <div className="mt-2 text-[10px] text-amber-700/70 flex items-center gap-1">
                <Users className="w-2.5 h-2.5" />
                Tap stars to update the customer's rating
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="unrated"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-lg border border-dashed border-border p-4 text-center"
            >
              <Star className="w-6 h-6 mx-auto mb-1.5 text-amber-300" />
              <p className="text-xs text-muted-foreground">
                Serve the cake to receive a customer rating &amp; review.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats summary */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-md bg-muted/40 p-2">
            <div className="text-[10px] uppercase text-muted-foreground">Total bake mass</div>
            <div className="font-mono text-base">{totalMass}g</div>
          </div>
          <div className="rounded-md bg-muted/40 p-2">
            <div className="text-[10px] uppercase text-muted-foreground">Decoration</div>
            <div className="font-mono text-base">{appliedToppings.length} pcs</div>
          </div>
        </div>

        {/* Helpful nudge when not ready */}
        {!servedToCustomer && (
          <div className="rounded-md border border-primary/30 bg-primary/5 p-2.5 text-[11px] text-primary">
            <p className="font-semibold mb-0.5">Ready to serve?</p>
            <p className="text-muted-foreground">
              Slice the cake (optional), then tap "Serve to Customer" to receive their honest review.
            </p>
          </div>
        )}

        <div className="mt-auto pt-3 border-t border-border text-[11px] text-muted-foreground">
          <p>
            <Sparkles className="w-3 h-3 inline mr-1" />
            Customer reviews are generated based on bake doneness, rise, and decoration. A perfectly
            golden, well-risen, moderately decorated bake earns 5 stars.
          </p>
        </div>
      </div>
    </div>
  )
}


// ─── Allergen description ────────────────────────────────────────────────

function describeAllergens(layers: { ingredient: { id: string; category: string } }[]): string {
  const has = (id: string) => layers.some((l) => l.ingredient.id.includes(id))
  const allergens: string[] = []
  if (has("flour")) allergens.push("gluten/wheat")
  if (has("egg")) allergens.push("egg")
  if (has("milk") || has("butter") || has("cream")) allergens.push("dairy")
  if (has("nuts")) allergens.push("tree nuts")
  return allergens.length > 0 ? allergens.join(", ") : "no major allergens declared"
}

// ─── Color helpers ───────────────────────────────────────────────────────

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

const CONFETTI_COLORS = [
  "#E84A4F", "#F5D040", "#5A8ACF", "#7AC07A",
  "#B070C8", "#FF8A40", "#E58AB8", "#7FBED6",
]

