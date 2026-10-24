"use client"

import { motion, AnimatePresence } from "framer-motion"
import { bowlLayers, useKitchen, type BowlIngredient } from "@/lib/kitchen-store"

interface BowlViewProps {
  bowl: BowlIngredient[]
  mixLevel: number
  /** When > 0, render rising dough visual (oven) */
  rising?: number
  /** When > 0, render browning layer on top (oven) */
  browning?: number
  /** Size in px */
  size?: number
  showWhisk?: boolean
  whisking?: boolean
  className?: string
}

/**
 * Renders the ceramic mixing bowl with layered ingredients,
 * mix-level-driven blending, optional rising/browning overlays.
 */
export function BowlView({
  bowl,
  mixLevel,
  rising = 0,
  browning = 0,
  size = 280,
  showWhisk = false,
  whisking = false,
  className,
}: BowlViewProps) {
  const layers = bowlLayers(bowl)
  const isEmpty = layers.length === 0

  // Mixed color = weighted average of all ingredient colors by grams
  const totalMass = layers.reduce((a, l) => a + l.grams, 0)
  const mixedColor = !isEmpty
    ? layers.reduce((acc, l) => {
        const hex = l.ingredient.color
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)
        const w = l.grams / totalMass
        acc.r += r * w
        acc.g += g * w
        acc.b += b * w
        return acc
      }, { r: 0, g: 0, b: 0 })
    : { r: 255, g: 250, b: 240 }
  const mixedHex = `#${Math.round(mixedColor.r).toString(16).padStart(2, "0")}${Math.round(mixedColor.g).toString(16).padStart(2, "0")}${Math.round(mixedColor.b).toString(16).padStart(2, "0")}`

  const fillBase = isEmpty ? 0 : 0.45
  const fillHeight = isEmpty ? 0 : Math.min(0.85, fillBase + rising * 0.4)

  return (
    <div
      className={`relative ${className ?? ""}`}
      style={{ width: size, height: size * 0.85 }}
      aria-label="Mixing bowl visualization"
    >
      <div
        className="absolute inset-x-0 bottom-0 rounded-[50%] ceramic-bowl"
        style={{ height: size * 0.7, top: size * 0.15 }}
      >
        <div
          className="absolute overflow-hidden rounded-[50%]"
          style={{
            inset: "8% 8% 8% 8%",
            background: isEmpty
              ? "radial-gradient(ellipse at 30% 30%, rgba(60,40,20,0.55), rgba(40,25,10,0.85))"
              : "radial-gradient(ellipse at 30% 30%, rgba(40,25,10,0.35), rgba(20,12,5,0.65))",
          }}
        >
          {!isEmpty && (
            <div
              className="absolute inset-0"
              style={{ opacity: 1 - mixLevel * 0.85 }}
            >
              <div className="absolute inset-0">
                {layers.map((layer, idx) => {
                  const layerHeight = (1 / layers.length) * 100
                  const top = 100 - (idx + 1) * layerHeight
                  return (
                    <motion.div
                      key={layer.ingredient.id}
                      initial={{ opacity: 0, scaleY: 0.3 }}
                      animate={{ opacity: 1, scaleY: 1 }}
                      transition={{ duration: 0.4, delay: idx * 0.06 }}
                      className="absolute inset-x-0"
                      style={{
                        top: `${top}%`,
                        height: `${layerHeight}%`,
                        background: `linear-gradient(180deg, ${layer.ingredient.highlight ?? layer.ingredient.color}, ${layer.ingredient.color})`,
                        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)",
                      }}
                    >
                      {layer.ingredient.state === "powder" && (
                        <div
                          className="absolute inset-0 opacity-60"
                          style={{
                            backgroundImage:
                              "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.5) 0.5px, transparent 1px), radial-gradient(circle at 70% 60%, rgba(0,0,0,0.2) 0.5px, transparent 1px), radial-gradient(circle at 40% 80%, rgba(255,255,255,0.4) 0.5px, transparent 1px)",
                            backgroundSize: "8px 8px, 10px 10px, 6px 6px",
                          }}
                        />
                      )}
                      {layer.ingredient.state === "liquid" && (
                        <div className="absolute inset-0 opacity-50">
                          <div className="absolute top-1 left-3 right-3 h-1 rounded-full bg-white/70 blur-[1px]" />
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}

          {!isEmpty && (
            <motion.div
              className="absolute inset-0"
              initial={false}
              animate={{ opacity: mixLevel }}
              transition={{ duration: 0.3 }}
              style={{
                background: `radial-gradient(ellipse at 30% 25%, ${mixedHex} 0%, ${mixedHex}dd 60%, ${mixedHex}99 100%)`,
              }}
            >
              <div className="absolute top-2 left-4 right-4 h-1.5 rounded-full bg-white/50 blur-[1px]" />
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  background:
                    "radial-gradient(ellipse at 70% 60%, rgba(255,255,255,0.25), transparent 50%)",
                }}
              />
            </motion.div>
          )}

          {rising > 0.05 && !isEmpty && (
            <motion.div
              className="absolute inset-x-0 bottom-0 rounded-t-[50%]"
              initial={false}
              animate={{ height: `${fillHeight * 100}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{
                background:
                  `radial-gradient(ellipse 60% 40% at 35% 25%, ${brightenHex(mixedHex, 0.25)} 0%, ${mixedHex} 50%, ${darkenHex(mixedHex, 0.2)} 100%)`,
                boxShadow:
                  "inset 0 6px 16px rgba(0,0,0,0.3), inset 0 -2px 6px rgba(0,0,0,0.2), 0 -3px 10px rgba(0,0,0,0.2)",
              }}
            >
              {/* HD specular highlight on dough surface */}
              <div
                className="absolute top-2 left-3 right-3 h-2 rounded-full opacity-70"
                style={{
                  background: `linear-gradient(90deg, transparent, ${brightenHex(mixedHex, 0.4)} 50%, transparent)`,
                  filter: "blur(1.5px)",
                }}
              />

              {/* HD Maillard browning — gradient from top (darker crust) to bottom (lighter crumb) */}
              {browning > 0.05 && (
                <div
                  className="absolute inset-0 rounded-t-[50%]"
                  style={{
                    background:
                      `linear-gradient(180deg,
                        rgba(${Math.round(60 - browning * 50)}, ${Math.round(30 - browning * 28)}, ${Math.round(10 - browning * 8)}, ${browning * 0.92}) 0%,
                        rgba(${Math.round(90 - browning * 55)}, ${Math.round(50 - browning * 30)}, ${Math.round(20 - browning * 12)}, ${browning * 0.6}) 40%,
                        transparent 80%)`,
                    mixBlendMode: "multiply",
                  }}
                />
              )}

              {/* HD crust crackle — appears as browning intensifies */}
              {browning > 0.4 && (
                <div
                  className="absolute inset-0 opacity-50"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 22% 35%, rgba(0,0,0,0.5) 0.4px, transparent 1.4px), radial-gradient(circle at 68% 25%, rgba(0,0,0,0.4) 0.5px, transparent 1.6px), radial-gradient(circle at 45% 55%, rgba(0,0,0,0.45) 0.4px, transparent 1.3px), radial-gradient(circle at 80% 45%, rgba(0,0,0,0.35) 0.4px, transparent 1.2px), radial-gradient(circle at 30% 70%, rgba(0,0,0,0.4) 0.3px, transparent 1.0px)",
                    backgroundSize: "14px 14px, 16px 16px, 12px 12px, 18px 18px, 10px 10px",
                  }}
                />
              )}

              {/* HD crust blistering at high browning */}
              {browning > 0.7 && (
                <div
                  className="absolute top-1 left-2 right-2 h-3 opacity-60"
                  style={{
                    background:
                      `radial-gradient(circle at 25% 50%, ${darkenHex(mixedHex, 0.4)} 0.5px, transparent 1.5px),
                       radial-gradient(circle at 55% 30%, ${darkenHex(mixedHex, 0.5)} 0.6px, transparent 1.8px),
                       radial-gradient(circle at 75% 60%, ${darkenHex(mixedHex, 0.4)} 0.5px, transparent 1.4px)`,
                    backgroundSize: "20px 8px, 24px 10px, 18px 7px",
                  }}
                />
              )}

              {/* Glossy sheen on lightly browned crust */}
              {browning > 0.2 && browning < 0.7 && (
                <div
                  className="absolute top-1 left-4 right-4 h-1 rounded-full opacity-50"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(255, 220, 160, 0.7), transparent)",
                    filter: "blur(1px)",
                  }}
                />
              )}
            </motion.div>
          )}
        </div>

        <div className="absolute top-1 left-4 right-4 h-1.5 rounded-full bg-white/70 blur-[1px]" />
      </div>

      {showWhisk && (
        <motion.div
          className="absolute left-1/2 top-0 -translate-x-1/2 z-20"
          animate={whisking ? { rotate: 360 } : { rotate: 0 }}
          transition={whisking ? { duration: 0.4, repeat: Infinity, ease: "linear" } : { duration: 0.3 }}
          style={{ transformOrigin: "center 90%", height: size * 0.7 }}
        >
          <WhiskIcon />
        </motion.div>
      )}
    </div>
  )
}

function WhiskIcon() {
  return (
    <svg width="20" height="100%" viewBox="0 0 20 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="0" width="4" height="80" rx="2" fill="#5a3a1a" />
      <rect x="8" y="0" width="2" height="80" rx="1" fill="#7a5a3a" />
      <g stroke="#c0c0c0" strokeWidth="1.5" fill="none">
        <path d="M 10 80 Q 4 130 10 180 Q 16 130 10 80" />
        <path d="M 10 80 Q 0 135 10 185 Q 20 135 10 80" />
        <path d="M 10 80 Q 8 140 10 190 Q 12 140 10 80" />
      </g>
      <circle cx="10" cy="82" r="3" fill="#8a8a8a" />
    </svg>
  )
}

export function BowlContentsList() {
  const bowl = useKitchen((s) => s.bowl)
  const removeFromBowl = useKitchen((s) => s.removeFromBowl)
  const layers = bowlLayers(bowl)
  const totalMass = layers.reduce((a, l) => a + l.grams, 0)

  if (layers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">
        Bowl is empty. Visit the pantry to add ingredients.
      </p>
    )
  }

  return (
    <div className="space-y-1.5">
      {layers.map((l) => (
        <div
          key={l.ingredient.id}
          className="flex items-center justify-between rounded-md bg-card border border-border/60 px-2 py-1.5"
        >
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full border border-black/20"
              style={{ background: l.ingredient.color }}
            />
            <span className="text-sm">{l.ingredient.emoji}</span>
            <span className="text-sm">{l.ingredient.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">{l.grams}g</span>
            <button
              onClick={() => removeFromBowl(l.ingredient.id)}
              className="text-xs text-destructive hover:underline"
              aria-label={`Remove ${l.ingredient.name}`}
            >
              ×
            </button>
          </div>
        </div>
      ))}
      <div className="flex justify-between pt-1 border-t border-border/60 text-xs font-mono text-muted-foreground">
        <span>Total</span>
        <span>{totalMass}g</span>
      </div>
    </div>
  )
}

// ─── HD color helpers ─────────────────────────────────────────────────────

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${Math.round(r).toString(16).padStart(2, "0")}${Math.round(g).toString(16).padStart(2, "0")}${Math.round(b).toString(16).padStart(2, "0")}`
}

function brightenHex(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex)
  return rgbToHex(
    Math.min(255, r + (255 - r) * amount),
    Math.min(255, g + (255 - g) * amount),
    Math.min(255, b + (255 - b) * amount)
  )
}

function darkenHex(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex)
  return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount))
}
