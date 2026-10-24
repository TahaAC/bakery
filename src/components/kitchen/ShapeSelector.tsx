"use client"

import { motion } from "framer-motion"
import { useKitchen, type BakeShape } from "@/lib/kitchen-store"

interface ShapeOption {
  id: BakeShape
  label: string
  emoji: string
  category: "classic" | "cartoon"
}

const SHAPE_OPTIONS: ShapeOption[] = [
  // Classic
  { id: "round", label: "Round", emoji: "⭕", category: "classic" },
  { id: "square", label: "Square", emoji: "⬜", category: "classic" },
  { id: "cupcake", label: "Cupcakes", emoji: "🧁", category: "classic" },
  { id: "bundt", label: "Bundt", emoji: "🍩", category: "classic" },
  { id: "loaf", label: "Loaf", emoji: "🍞", category: "classic" },
  // Cartoon (kids)
  { id: "star", label: "Star", emoji: "⭐", category: "cartoon" },
  { id: "heart", label: "Heart", emoji: "💗", category: "cartoon" },
  { id: "bear", label: "Bear", emoji: "🐻", category: "cartoon" },
  { id: "dino", label: "Dino", emoji: "🦕", category: "cartoon" },
  { id: "rocket", label: "Rocket", emoji: "🚀", category: "cartoon" },
]

interface ShapeSelectorProps {
  /** Compact mode for inline use */
  compact?: boolean
}

export function ShapeSelector({ compact = false }: ShapeSelectorProps) {
  const bakeShape = useKitchen((s) => s.bakeShape)
  const setBakeShape = useKitchen((s) => s.setBakeShape)

  const classicShapes = SHAPE_OPTIONS.filter((s) => s.category === "classic")
  const cartoonShapes = SHAPE_OPTIONS.filter((s) => s.category === "cartoon")

  return (
    <div className={compact ? "" : "space-y-3"}>
      {!compact && (
        <div>
          <h3 className="text-sm font-semibold mb-1">Cake Shape</h3>
          <p className="text-xs text-muted-foreground">
            Pick a pan shape — or a fun cartoon shape for kids!
          </p>
        </div>
      )}

      {/* Classic shapes */}
      <div className={compact ? "" : "space-y-1.5"}>
        {!compact && (
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Classic Pans
          </div>
        )}
        <div className={`grid ${compact ? "grid-cols-5 gap-1" : "grid-cols-5 gap-1.5"}`}>
          {classicShapes.map((shape) => (
            <ShapeButton
              key={shape.id}
              shape={shape}
              selected={bakeShape === shape.id}
              compact={compact}
              onClick={() => setBakeShape(shape.id)}
            />
          ))}
        </div>
      </div>

      {/* Cartoon shapes */}
      <div className={compact ? "" : "space-y-1.5"}>
        {!compact && (
          <div className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1">
            ✨ Fun Cartoon Shapes
          </div>
        )}
        <div className={`grid ${compact ? "grid-cols-5 gap-1" : "grid-cols-5 gap-1.5"}`}>
          {cartoonShapes.map((shape) => (
            <ShapeButton
              key={shape.id}
              shape={shape}
              selected={bakeShape === shape.id}
              compact={compact}
              onClick={() => setBakeShape(shape.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function ShapeButton({
  shape,
  selected,
  compact,
  onClick,
}: {
  shape: ShapeOption
  selected: boolean
  compact: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 rounded-lg border-2 transition ${
        compact ? "p-1.5 min-h-[44px]" : "p-2.5 min-h-[64px]"
      } ${
        selected
          ? "border-primary bg-primary/10 shadow-sm"
          : "border-border bg-card hover:border-primary/40"
      }`}
      aria-label={shape.label}
      title={shape.label}
    >
      <span className={compact ? "text-lg" : "text-2xl"}>{shape.emoji}</span>
      <span className={`font-medium leading-tight ${compact ? "text-[9px]" : "text-[11px]"}`}>
        {shape.label}
      </span>
    </motion.button>
  )
}

// ─── Export shape options for use elsewhere ────────────────────────────

export { SHAPE_OPTIONS }
export type { ShapeOption }
