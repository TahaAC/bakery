"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useMemo } from "react"
import { bowlLayers, useKitchen, type AppliedTopping } from "@/lib/kitchen-store"
import { TOPPINGS } from "@/lib/toppings"

interface CakeViewProps {
  /** Size of the cake render in px (diameter of the plate) */
  size?: number
  /** Whether to show on a serving plate (Showcase) vs. in oven (no plate) */
  showPlate?: boolean
  /** Slice count (0 = whole) */
  sliceCount?: number
  /** Whether steam should rise (just-out-of-oven effect) */
  steam?: boolean
  className?: string
}

/**
 * Realistic cake renderer.
 *
 * Shows a proper cake (not batter-in-bowl) once baking has progressed.
 * Features:
 *  - 3D-ish domed top with realistic crust gradient
 *  - Maillard browning overlay (golden → dark)
 *  - Crust crackle pattern at high browning
 *  - Side walls showing cake body
 *  - When sliced: visible internal crumb texture (lighter, porous)
 *  - Specular highlight from overhead light
 *  - Soft contact shadow on plate
 *  - Escaping steam particles (optional)
 *  - Applied toppings rendered on the dome top
 *
 * The cake color is derived from the bowl ingredients (mixed weighted avg).
 */
export function CakeView({
  size = 320,
  showPlate = true,
  sliceCount = 0,
  steam = false,
  className,
}: CakeViewProps) {
  const bowl = useKitchen((s) => s.bowl)
  const baking = useKitchen((s) => s.baking)
  const appliedToppings = useKitchen((s) => s.appliedToppings)
  const mixLevel = useKitchen((s) => s.mixLevel)

  // Stable steam particle params (computed once via useMemo — no bubbling)
  const steamParticles = useMemo(
    () =>
      Array.from({ length: 8 }).map((_, i) => ({
        left: 25 + (i * 7) % 50,
        size: 14 + (i % 3) * 6,
        drift: (i - 4) * 3,
        dur: 2.4 + (i % 3) * 0.5,
        delay: i * 0.4,
      })),
    []
  )

  // Compute the cake's base color from bowl ingredients
  const layers = bowlLayers(bowl)
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

  const baseHex = rgbToHex(cakeColor.r, cakeColor.g, cakeColor.b)
  // Apply Maillard browning based on bake level
  const brown = baking.brownLevel
  const crustHex = applyBrowning(baseHex, Math.min(brown, 0.95))
  // Inside crumb is lighter than the crust (less browning inside)
  const crumbHex = applyBrowning(baseHex, Math.min(brown * 0.3, 0.3))
  // Highlight (lighter shade for specular)
  const highlightHex = brightenHex(crustHex, 0.3)
  // Shadow (darker shade for depth)
  const shadowHex = darkenHex(crustHex, 0.35)

  // Cake dimensions
  const plateSize = size
  const cakeDiameter = size * 0.72
  const cakeHeight = size * 0.32 * (1 + baking.riseLevel * 0.25)

  // Filter toppings that should render on the cake (exclude those with paths spanning outside)
  const cakeToppings = appliedToppings

  return (
    <div
      className={`relative ${className ?? ""}`}
      style={{ width: plateSize, height: plateSize * 0.85 }}
      aria-label="Finished baked cake"
    >
      {/* ─── Serving plate (HD porcelain) ─── */}
      {showPlate && (
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-full"
          style={{
            bottom: "8%",
            width: "90%",
            height: "16%",
            background:
              "radial-gradient(ellipse at 30% 25%, rgba(255,255,255,0.98) 0%, rgba(248,242,232,0.95) 30%, rgba(220,205,178,0.85) 65%, rgba(160,135,100,0.7) 95%)",
            boxShadow:
              "0 16px 40px -6px rgba(40, 25, 10, 0.4), 0 8px 16px -4px rgba(80, 50, 20, 0.3), inset 0 -3px 8px rgba(120, 80, 40, 0.25), inset 0 2px 4px rgba(255, 255, 255, 0.7)",
          }}
        >
          {/* Plate rim highlight */}
          <div
            className="absolute inset-2 rounded-full"
            style={{
              boxShadow: "inset 0 1px 1px rgba(255,255,255,0.9)",
            }}
          />
          {/* Specular on plate */}
          <div
            className="absolute top-1 left-4 right-1/2 h-1 rounded-full opacity-70"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)",
              filter: "blur(1px)",
            }}
          />
        </div>
      )}

      {/* ─── Soft contact shadow under cake ─── */}
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-full"
        style={{
          bottom: showPlate ? "12%" : "8%",
          width: "78%",
          height: "6%",
          background: "rgba(40, 25, 10, 0.35)",
          filter: "blur(6px)",
        }}
      />

      {/* ─── THE CAKE ─── */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: showPlate ? "16%" : "10%",
          width: cakeDiameter,
          height: cakeHeight,
        }}
      >
        <motion.div
          initial={false}
          animate={{ scale: baking.status === "baking" ? [1, 1.008, 1] : 1 }}
          transition={{ duration: 4, repeat: baking.status === "baking" ? Infinity : 0 }}
          className="relative w-full h-full"
        >
          {/* ─── Cake body (side walls) ─── */}
          <div
            className="absolute inset-x-0 bottom-0 rounded-b-[40%]"
            style={{
              top: "20%",
              background: `linear-gradient(180deg,
                ${crustHex} 0%,
                ${darkenHex(crustHex, 0.1)} 30%,
                ${shadowHex} 100%)`,
              boxShadow: `inset 0 -8px 16px ${darkenHex(crustHex, 0.4)}, inset 0 2px 4px ${highlightHex}`,
            }}
          >
            {/* Side texture: subtle vertical streaks for baked surface */}
            <div
              className="absolute inset-0 opacity-40 rounded-b-[40%]"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(90deg,
                    transparent 0px, transparent 4px,
                    rgba(0,0,0,0.06) 4px, rgba(0,0,0,0.06) 5px),
                  repeating-linear-gradient(90deg,
                    transparent 0px, transparent 12px,
                    rgba(255,255,255,0.05) 12px, rgba(255,255,255,0.05) 13px)
                `,
              }}
            />
            {/* Side highlight (left edge catches the light) */}
            <div
              className="absolute left-0 top-2 bottom-2 w-1.5 rounded-full opacity-50"
              style={{ background: `linear-gradient(180deg, ${highlightHex}, transparent)` }}
            />
          </div>

          {/* ─── Cake dome (top) ─── */}
          <div
            className="absolute inset-x-0 top-0 rounded-t-[50%]"
            style={{
              height: "55%",
              background: `
                radial-gradient(ellipse 70% 90% at 35% 20%,
                  ${highlightHex} 0%,
                  ${brightenHex(crustHex, 0.1)} 25%,
                  ${crustHex} 55%,
                  ${darkenHex(crustHex, 0.15)} 100%)`,
              boxShadow: `inset 0 4px 12px ${highlightHex}66, inset 0 -6px 14px ${shadowHex}66`,
            }}
          >
            {/* Crust crackle pattern (appears as browning intensifies) */}
            {brown > 0.3 && (
              <div
                className="absolute inset-0 rounded-t-[50%] opacity-60"
                style={{
                  backgroundImage: `
                    radial-gradient(ellipse 30% 12% at 20% 30%, rgba(0,0,0,0.25) 0.4px, transparent 1.5px),
                    radial-gradient(ellipse 25% 10% at 55% 20%, rgba(0,0,0,0.2) 0.4px, transparent 1.3px),
                    radial-gradient(ellipse 35% 14% at 75% 35%, rgba(0,0,0,0.22) 0.4px, transparent 1.4px),
                    radial-gradient(ellipse 20% 8% at 40% 50%, rgba(0,0,0,0.18) 0.3px, transparent 1.2px),
                    radial-gradient(ellipse 28% 10% at 65% 55%, rgba(0,0,0,0.2) 0.3px, transparent 1.3px)
                  `,
                }}
              />
            )}

            {/* Top crack (a single line that appears at high browning — like real bread splits) */}
            {brown > 0.5 && (
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 100 50"
                preserveAspectRatio="none"
              >
                <path
                  d="M 15 28 Q 30 22 45 26 Q 60 30 75 24 Q 85 20 90 26"
                  stroke="rgba(0,0,0,0.35)"
                  strokeWidth="0.6"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M 25 32 Q 40 28 55 32"
                  stroke="rgba(0,0,0,0.2)"
                  strokeWidth="0.4"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            )}

            {/* Glossy sheen on the dome (light reflection) */}
            {brown > 0.15 && brown < 0.85 && (
              <div
                className="absolute top-2 left-1/4 right-1/4 h-3 rounded-full opacity-50 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255, 220, 160, 0.7), transparent)",
                  filter: "blur(2px)",
                }}
              />
            )}

            {/* Dark blistering at high browning */}
            {brown > 0.75 && (
              <div
                className="absolute inset-0 rounded-t-[50%] opacity-70"
                style={{
                  background: `
                    radial-gradient(circle at 25% 35%, ${darkenHex(crustHex, 0.5)} 1px, transparent 2.5px),
                    radial-gradient(circle at 60% 25%, ${darkenHex(crustHex, 0.55)} 1.2px, transparent 3px),
                    radial-gradient(circle at 75% 50%, ${darkenHex(crustHex, 0.45)} 0.8px, transparent 2px),
                    radial-gradient(circle at 35% 60%, ${darkenHex(crustHex, 0.5)} 1px, transparent 2.5px)
                  `,
                  backgroundSize: "30px 30px, 36px 36px, 26px 26px, 32px 32px",
                  mixBlendMode: "multiply",
                }}
              />
            )}
          </div>

          {/* ─── Slice cut lines (when sliced) ─── */}
          {sliceCount > 0 && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {Array.from({ length: sliceCount }).map((_, i) => {
                const angle = (i / sliceCount) * 360
                return (
                  <line
                    key={i}
                    x1="50"
                    y1="50"
                    x2="50"
                    y2="0"
                    stroke="rgba(60, 35, 15, 0.55)"
                    strokeWidth="0.8"
                    transform={`rotate(${angle} 50 50)`}
                  />
                )
              })}
            </svg>
          )}

          {/* ─── Internal crumb visible when sliced ─── */}
          {sliceCount > 0 && (
            <div
              className="absolute inset-x-[15%] top-[10%] bottom-[10%] rounded-t-[40%] opacity-90 pointer-events-none"
              style={{
                background: `
                  radial-gradient(ellipse 80% 90% at 50% 40%,
                    ${brightenHex(crumbHex, 0.15)} 0%,
                    ${crumbHex} 60%,
                    ${darkenHex(crumbHex, 0.1)} 100%)`,
                clipPath: "polygon(0% 100%, 50% 0%, 100% 100%)",
              }}
            >
              {/* Crumb texture: irregular holes */}
              <div
                className="absolute inset-0 opacity-70"
                style={{
                  backgroundImage: `
                    radial-gradient(circle at 25% 60%, rgba(0,0,0,0.25) 1.2px, transparent 2.5px),
                    radial-gradient(circle at 55% 40%, rgba(0,0,0,0.22) 1px, transparent 2.2px),
                    radial-gradient(circle at 75% 70%, rgba(0,0,0,0.2) 1.4px, transparent 2.8px),
                    radial-gradient(circle at 35% 30%, rgba(0,0,0,0.18) 1px, transparent 2px),
                    radial-gradient(circle at 65% 55%, rgba(0,0,0,0.22) 1.2px, transparent 2.4px),
                    radial-gradient(circle at 45% 75%, rgba(0,0,0,0.2) 1px, transparent 2.2px)
                  `,
                  backgroundSize: "18px 18px, 22px 22px, 16px 16px, 20px 20px, 24px 24px, 19px 19px",
                }}
              />
              {/* Highlight on crumb edge */}
              <div
                className="absolute inset-x-0 top-0 h-2 opacity-60"
                style={{
                  background: `linear-gradient(180deg, ${brightenHex(crumbHex, 0.3)}, transparent)`,
                }}
              />
            </div>
          )}

          {/* ─── Applied toppings rendered on the cake dome ─── */}
          <div className="absolute inset-0 pointer-events-none">
            {cakeToppings.map((applied) => (
              <CakeTopping
                key={applied.id}
                applied={applied}
                topping={TOPPINGS.find((t) => t.id === applied.toppingId)!}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* ─── Steam particles rising from the cake ─── */}
      {steam && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {steamParticles.map((p, i) => (
            <span
              key={i}
              className="steam-particle"
              style={{
                left: `${p.left}%`,
                bottom: "50%",
                width: `${p.size}px`,
                height: `${p.size}px`,
                ["--drift" as string]: `${p.drift}px`,
                ["--dur" as string]: `${p.dur}s`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Topping renderer on the cake (uses pre-computed particles) ────────

function CakeTopping({
  applied,
  topping,
}: {
  applied: AppliedTopping
  topping: (typeof TOPPINGS)[number] | undefined
}) {
  if (!topping) return null
  const size = 10 + applied.amount * 16

  // Drizzle / pipe — render as stroked path
  if ((topping.method === "drizzle" || topping.method === "pipe") && applied.path && applied.path.length > 1) {
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points={applied.path.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke={topping.color}
          strokeWidth={topping.method === "pipe" ? 5 + applied.amount * 7 : 2 + applied.amount * 2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.95}
          vectorEffect="non-scaling-stroke"
        />
        <polyline
          points={applied.path.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke={topping.highlight ?? "#ffffff"}
          strokeWidth={topping.method === "pipe" ? 1.5 : 0.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.5}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    )
  }

  // Dust / scatter / place / layer — positioned
  return (
    <div
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
      {topping.method === "dust" ? (
        (applied.particles ?? []).map((p, i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `calc(50% + ${p.x}px)`,
              top: `calc(50% + ${p.y}px)`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: p.useHighlight ? topping.highlight ?? topping.color : topping.color,
              opacity: p.opacity,
            }}
          />
        ))
      ) : topping.method === "scatter" ? (
        (applied.particles ?? []).map((p, i) => {
          const isSprinkle = topping.id.includes("sprinkles")
          const colors = ["#E84A4F", "#F5D040", "#5A8ACF", "#7AC07A", "#B070C8", "#FF8A40"]
          return (
            <span
              key={i}
              className="absolute"
              style={{
                left: `calc(50% + ${p.x}px)`,
                top: `calc(50% + ${p.y}px)`,
                width: isSprinkle ? `${p.size * 2.2}px` : `${p.size}px`,
                height: isSprinkle ? `${p.size * 0.7}px` : `${p.size}px`,
                background: isSprinkle
                  ? colors[i % colors.length]
                  : p.useHighlight
                  ? topping.highlight ?? topping.color
                  : topping.color,
                borderRadius: isSprinkle ? "2px" : "40% 60% 50% 50%",
                transform: isSprinkle ? `rotate(${p.rotation}deg)` : undefined,
              }}
            />
          )
        })
      ) : topping.method === "layer" ? (
        <div
          className="rounded-full"
          style={{
            width: `${size * 3}px`,
            height: `${size * 3}px`,
            background: `radial-gradient(circle, ${topping.color}f0 0%, ${topping.color}33 80%, transparent 100%)`,
            mixBlendMode: "multiply",
          }}
        />
      ) : topping.method === "place" ? (
        <div
          className="w-full h-full rounded-full flex items-center justify-center"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${topping.highlight ?? topping.color}, ${topping.color})`,
            boxShadow: "0 2px 4px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.4)",
          }}
        >
          <span className="text-[10px]">{topping.emoji}</span>
        </div>
      ) : null}
    </div>
  )
}

// ─── Color helpers ─────────────────────────────────────────────────────

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
  // Lerp toward a warm brown (#6b3a18)
  const tr = 107, tg = 58, tb = 24
  const factor = Math.min(0.92, brown)
  return rgbToHex(
    r * (1 - factor) + tr * factor,
    g * (1 - factor) + tg * factor,
    b * (1 - factor) + tb * factor
  )
}

function brightenHex(hex: string, amount: number) {
  const { r, g, b } = hexToRgb(hex)
  return rgbToHex(
    Math.min(255, r + (255 - r) * amount),
    Math.min(255, g + (255 - g) * amount),
    Math.min(255, b + (255 - b) * amount)
  )
}

function darkenHex(hex: string, amount: number) {
  const { r, g, b } = hexToRgb(hex)
  return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount))
}
