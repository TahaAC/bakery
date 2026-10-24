"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FlaskConical, ChevronDown, X } from "lucide-react"
import { SCIENCE_NOTES, type ScienceNote } from "@/lib/science"
import { useKitchen } from "@/lib/kitchen-store"

interface ScienceOverlayProps {
  open: boolean
  onClose: () => void
}

export function ScienceOverlay({ open, onClose }: ScienceOverlayProps) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const bowl = useKitchen((s) => s.bowl)
  const ovenOn = useKitchen((s) => s.ovenOn)
  const baking = useKitchen((s) => s.baking)

  // Determine which science notes are relevant to current state
  const relevant = SCIENCE_NOTES.filter((n) => {
    if (n.trigger === "oven" || n.trigger === "maillard") {
      return ovenOn || baking.brownLevel > 0.05
    }
    if (n.trigger === "gluten" || n.trigger === "yeast") {
      return bowl.some((b) => b.ingredientId.includes("flour"))
    }
    return bowl.some((b) => b.ingredientId.includes(n.trigger))
  })

  const allNotes = relevant.length > 0 ? relevant : SCIENCE_NOTES.slice(0, 3)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ duration: 0.25 }}
          className="fixed top-20 right-4 bottom-24 w-80 z-40 rounded-2xl border-2 border-primary/30 bg-card/95 backdrop-blur-md shadow-2xl flex flex-col overflow-hidden print:hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-primary to-accent text-primary-foreground px-4 py-3">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4" />
              <span className="text-sm font-semibold">Science AR Overlay</span>
            </div>
            <button onClick={onClose} aria-label="Close science overlay">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sub-header */}
          <div className="px-4 py-2 bg-accent/20 border-b border-border text-[11px] text-muted-foreground">
            {relevant.length > 0
              ? `${relevant.length} active reaction${relevant.length === 1 ? "" : "s"} detected in your kitchen.`
              : "Add ingredients or turn on the oven to see live reactions."}
          </div>

          {/* Note list */}
          <div className="flex-1 overflow-y-auto kitchen-scrollbar p-3 space-y-2">
            {allNotes.map((note) => (
              <ScienceCard
                key={note.trigger}
                note={note}
                expanded={expanded === note.trigger}
                onToggle={() => setExpanded(expanded === note.trigger ? null : note.trigger)}
                active={relevant.some((r) => r.trigger === note.trigger)}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-muted/40 border-t border-border text-[10px] text-muted-foreground">
            Toggle off anytime from the top-bar beaker icon.
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ScienceCard({
  note,
  expanded,
  onToggle,
  active,
}: {
  note: ScienceNote
  expanded: boolean
  onToggle: () => void
  active: boolean
}) {
  return (
    <motion.div
      layout
      className={`rounded-lg border bg-card overflow-hidden transition ${
        active ? "border-primary/50 shadow-sm" : "border-border opacity-70"
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left hover:bg-muted/40"
      >
        <div className="flex items-center gap-2 min-w-0">
          {active && (
            <motion.span
              className="w-2 h-2 rounded-full bg-primary shrink-0"
              animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
          <span className="text-xs font-semibold truncate">{note.title}</span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-muted-foreground shrink-0 transition ${expanded ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-0.5">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {note.body}
              </p>
              {note.formula && (
                <div className="mt-2 font-mono text-[10px] bg-muted/60 px-2 py-1.5 rounded text-foreground/80">
                  {note.formula}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
