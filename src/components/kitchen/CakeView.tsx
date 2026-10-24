"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useMemo } from "react"
import { bowlLayers, useKitchen, type AppliedTopping, type BakeShape } from "@/lib/kitchen-store"
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
  const bakeShape = useKitchen((s) => s.bakeShape)

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
          {/* ─── Shape-specific cake body ─── */}
          <ShapeCakeBody
            shape={bakeShape}
            crustHex={crustHex}
            highlightHex={highlightHex}
            shadowHex={shadowHex}
            crumbHex={crumbHex}
            brown={brown}
            sliceCount={sliceCount}
            riseLevel={baking.riseLevel}
          />

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

// ─── Shape-specific cake body ────────────────────────────────────────────
//
// Renders the cake body + dome based on the selected BakeShape.
// Classic shapes (round, square, bundt, loaf, cupcake) use CSS divs.
// Cartoon shapes (star, heart, bear, dino, rocket) use SVG paths for
// kid-friendly fun silhouettes.

interface ShapeCakeBodyProps {
  shape: BakeShape
  crustHex: string
  highlightHex: string
  shadowHex: string
  crumbHex: string
  brown: number
  sliceCount: number
  riseLevel: number
}

function ShapeCakeBody({
  shape,
  crustHex,
  highlightHex,
  shadowHex,
  crumbHex,
  brown,
  sliceCount,
  riseLevel,
}: ShapeCakeBodyProps) {
  // ─── Cartoon shapes — SVG-based ───
  if (["star", "heart", "bear", "dino", "rocket"].includes(shape)) {
    return (
      <CartoonShapeCake
        shape={shape as "star" | "heart" | "bear" | "dino" | "rocket"}
        crustHex={crustHex}
        highlightHex={highlightHex}
        shadowHex={shadowHex}
        brown={brown}
      />
    )
  }

  // ─── Cupcake shape — special multi-cupcake render ───
  if (shape === "cupcake") {
    return (
      <CupcakeShape
        crustHex={crustHex}
        highlightHex={highlightHex}
        shadowHex={shadowHex}
        brown={brown}
      />
    )
  }

  // ─── Classic shapes — div-based with varying border-radius ───
  // Determine border radius + clip path based on shape
  const shapeProps = {
    round: { borderRadius: "50%", clipPath: "none" },
    square: { borderRadius: "8%", clipPath: "none" },
    bundt: { borderRadius: "50%", clipPath: "none" }, // bundt gets a hole via inner div
    loaf: { borderRadius: "12% 12% 8% 8%", clipPath: "none" },
  }

  const sp = shapeProps[shape as keyof typeof shapeProps] ?? shapeProps.round

  return (
    <>
      {/* ─── Cake body (side walls) ─── */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          top: "20%",
          borderRadius: sp.borderRadius,
          background: `linear-gradient(180deg,
            ${crustHex} 0%,
            ${darkenHex(crustHex, 0.1)} 30%,
            ${shadowHex} 100%)`,
          boxShadow: `inset 0 -8px 16px ${darkenHex(crustHex, 0.4)}, inset 0 2px 4px ${highlightHex}`,
        }}
      >
        {/* Side texture: subtle vertical streaks for baked surface */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            borderRadius: sp.borderRadius,
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

        {/* Bundt hole (inner cutout) */}
        {shape === "bundt" && (
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: "30%",
              height: "60%",
              background: "radial-gradient(ellipse, rgba(40,25,10,0.6), rgba(20,12,5,0.8))",
              boxShadow: "inset 0 4px 8px rgba(0,0,0,0.5)",
            }}
          />
        )}
      </div>

      {/* ─── Cake dome (top) ─── */}
      <div
        className="absolute inset-x-0 top-0"
        style={{
          height: shape === "loaf" ? "40%" : "55%",
          borderRadius: shape === "round" || shape === "bundt" ? "50% 50% 0 0" : sp.borderRadius,
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
            className="absolute inset-0 opacity-60"
            style={{
              borderRadius: shape === "round" || shape === "bundt" ? "50% 50% 0 0" : sp.borderRadius,
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
      </div>

      {/* ─── Slice cut lines (when sliced, only for round/square) ─── */}
      {sliceCount > 0 && (shape === "round" || shape === "square") && (
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
    </>
  )
}

// ─── Cupcake shape (3 cupcakes in a row) ─────────────────────────────────

function CupcakeShape({
  crustHex,
  highlightHex,
  shadowHex,
  brown,
}: {
  crustHex: string
  highlightHex: string
  shadowHex: string
  brown: number
}) {
  return (
    <div className="absolute inset-0 flex items-end justify-around gap-2 px-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="relative w-1/4 h-full flex flex-col items-center">
          {/* Frosting swirl (top) */}
          <div
            className="w-full rounded-t-full"
            style={{
              height: "55%",
              background: `radial-gradient(ellipse 70% 90% at 35% 20%, ${highlightHex}, ${crustHex} 55%, ${shadowHex})`,
              clipPath: "polygon(15% 100%, 50% 0%, 85% 100%, 70% 90%, 50% 85%, 30% 90%)",
            }}
          >
            {brown > 0.3 && (
              <div
                className="absolute inset-0 opacity-50"
                style={{
                  clipPath: "polygon(15% 100%, 50% 0%, 85% 100%, 70% 90%, 50% 85%, 30% 90%)",
                  backgroundImage: "radial-gradient(circle at 50% 40%, rgba(0,0,0,0.2) 1px, transparent 2px)",
                  backgroundSize: "12px 12px",
                }}
              />
            )}
          </div>
          {/* Cupcake liner (bottom) */}
          <div
            className="w-full rounded-b-md"
            style={{
              height: "45%",
              background: `linear-gradient(180deg, ${darkenHex(crustHex, 0.15)}, ${shadowHex})`,
              backgroundImage: `repeating-linear-gradient(90deg, ${shadowHex} 0px, ${shadowHex} 2px, ${darkenHex(crustHex, 0.1)} 2px, ${darkenHex(crustHex, 0.1)} 6px)`,
            }}
          />
        </div>
      ))}
    </div>
  )
}

// ─── Cartoon shape cakes (SVG-based, kid-friendly) ───────────────────────

function CartoonShapeCake({
  shape,
  crustHex,
  highlightHex,
  shadowHex,
  brown,
}: {
  shape: "star" | "heart" | "bear" | "dino" | "rocket"
  crustHex: string
  highlightHex: string
  shadowHex: string
  brown: number
}) {
  // SVG path for each cartoon shape (viewBox 0 0 100 100)
  const paths: Record<typeof shape, string> = {
    star: "M 50 5 L 61 38 L 95 38 L 67 58 L 78 92 L 50 72 L 22 92 L 33 58 L 5 38 L 39 38 Z",
    heart: "M 50 88 C 50 88 10 60 10 35 C 10 18 22 8 35 8 C 42 8 48 12 50 18 C 52 12 58 8 65 8 C 78 8 90 18 90 35 C 90 60 50 88 50 88 Z",
    bear: "M 50 90 C 25 90 10 75 10 55 C 10 35 25 20 50 20 C 75 20 90 35 90 55 C 90 75 75 90 50 90 Z M 22 28 C 18 28 14 24 14 20 C 14 16 18 12 22 12 C 26 12 30 16 30 20 C 30 24 26 28 22 28 Z M 78 28 C 74 28 70 24 70 20 C 70 16 74 12 78 12 C 82 12 86 16 86 20 C 86 24 82 28 78 28 Z",
    dino: "M 20 85 L 20 50 C 20 35 30 25 45 25 L 55 25 C 70 25 80 35 80 50 L 80 85 L 70 85 L 70 75 L 60 75 L 60 85 L 50 85 L 50 75 L 40 75 L 40 85 L 30 85 L 30 75 L 20 75 Z M 35 40 L 35 50 L 45 50 L 45 40 Z M 55 40 L 55 50 L 65 50 L 65 40 Z",
    rocket: "M 50 8 C 65 8 75 25 75 50 L 75 75 L 65 75 L 65 88 L 55 88 L 55 80 L 45 80 L 45 88 L 35 88 L 35 75 L 25 75 L 25 50 C 25 25 35 8 50 8 Z M 42 40 L 42 55 L 58 55 L 58 40 Z",
  }

  // Crackle overlay for browning
  const crackleFill = brown > 0.5 ? darkenHex(crustHex, 0.3) : "transparent"

  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id={`cartoon-grad-${shape}`} cx="0.4" cy="0.25" r="0.7">
          <stop offset="0%" stopColor={highlightHex} />
          <stop offset="50%" stopColor={crustHex} />
          <stop offset="100%" stopColor={shadowHex} />
        </radialGradient>
        <filter id={`cartoon-shadow-${shape}`}>
          <feGaussianBlur stdDeviation="0.8" />
        </filter>
      </defs>

      {/* Drop shadow */}
      <path
        d={paths[shape]}
        fill="rgba(0,0,0,0.25)"
        transform="translate(1.5, 2)"
        filter={`url(#cartoon-shadow-${shape})`}
      />

      {/* Main body */}
      <path
        d={paths[shape]}
        fill={`url(#cartoon-grad-${shape})`}
        stroke={darkenHex(crustHex, 0.3)}
        strokeWidth="0.8"
      />

      {/* Crackle texture at high browning */}
      {brown > 0.4 && (
        <path
          d={paths[shape]}
          fill="none"
          stroke={crackleFill}
          strokeWidth="0.3"
          strokeDasharray="2 3"
          opacity="0.5"
        />
      )}

      {/* Shape-specific details */}
      {shape === "bear" && (
        <>
          {/* Eyes */}
          <circle cx="38" cy="50" r="3" fill="#1a0f08" />
          <circle cx="62" cy="50" r="3" fill="#1a0f08" />
          <circle cx="39" cy="49" r="1" fill="#fff" />
          <circle cx="63" cy="49" r="1" fill="#fff" />
          {/* Nose */}
          <ellipse cx="50" cy="60" rx="3" ry="2.5" fill="#1a0f08" />
          {/* Mouth */}
          <path d="M 45 66 Q 50 70 55 66" stroke="#1a0f08" strokeWidth="1" fill="none" strokeLinecap="round" />
          {/* Cheeks */}
          <circle cx="30" cy="62" r="3" fill="#f5a8a8" opacity="0.6" />
          <circle cx="70" cy="62" r="3" fill="#f5a8a8" opacity="0.6" />
        </>
      )}

      {shape === "dino" && (
        <>
          {/* Eye */}
          <circle cx="40" cy="45" r="2.5" fill="#1a0f08" />
          <circle cx="41" cy="44" r="0.8" fill="#fff" />
          {/* Back spikes */}
          <path d="M 25 30 L 30 22 L 35 30 Z" fill={shadowHex} />
          <path d="M 40 25 L 45 18 L 50 25 Z" fill={shadowHex} />
          <path d="M 55 25 L 60 18 L 65 25 Z" fill={shadowHex} />
          {/* Smile */}
          <path d="M 35 55 Q 45 60 55 55" stroke="#1a0f08" strokeWidth="1" fill="none" strokeLinecap="round" />
        </>
      )}

      {shape === "rocket" && (
        <>
          {/* Window */}
          <circle cx="50" cy="45" r="6" fill="#a0d8f0" stroke={shadowHex} strokeWidth="1" />
          <circle cx="50" cy="45" r="4" fill="#7fc8e8" />
          <ellipse cx="48" cy="43" rx="1.5" ry="1" fill="#fff" opacity="0.6" />
          {/* Fins */}
          <path d="M 25 65 L 18 80 L 25 75 Z" fill={shadowHex} />
          <path d="M 75 65 L 82 80 L 75 75 Z" fill={shadowHex} />
        </>
      )}

      {shape === "star" && (
        <>
          {/* Sparkle */}
          <circle cx="50" cy="35" r="2" fill="#fff" opacity="0.6" />
          <circle cx="35" cy="50" r="1.5" fill="#fff" opacity="0.5" />
          <circle cx="65" cy="55" r="1.5" fill="#fff" opacity="0.5" />
        </>
      )}

      {shape === "heart" && (
        <>
          {/* Highlight */}
          <ellipse cx="35" cy="30" rx="6" ry="4" fill="#fff" opacity="0.4" transform="rotate(-30 35 30)" />
        </>
      )}

      {/* Glossy sheen for all cartoon shapes */}
      {brown > 0.15 && brown < 0.85 && (
        <ellipse
          cx="38"
          cy="28"
          rx="8"
          ry="3"
          fill="#fff"
          opacity="0.3"
          transform="rotate(-25 38 28)"
        />
      )}
    </svg>
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
