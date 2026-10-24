"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useMemo } from "react"
import { X, PartyPopper, Award } from "lucide-react"
import { useKitchen } from "@/lib/kitchen-store"
import { getBadge } from "@/lib/lessons"
import { ChefBearMascot } from "./KitchenBench"
import { Button } from "@/components/ui/button"

/**
 * Floating Chef Bear mascot with a speech bubble.
 * Shows when mascotVisible is true in the store.
 */
export function MascotBubble() {
  const visible = useKitchen((s) => s.mascotVisible)
  const message = useKitchen((s) => s.mascotMessage)
  const hideMascot = useKitchen((s) => s.hideMascot)

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.9 }}
          transition={{ duration: 0.3, type: "spring" }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-md w-[90%] print:hidden"
        >
          <div className="flex items-end gap-2">
            {/* Mascot */}
            <div className="shrink-0">
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ChefBearMascot size={72} onClick={hideMascot} />
              </motion.div>
            </div>

            {/* Speech bubble */}
            <div className="relative flex-1 rounded-2xl bg-white border-2 border-primary/40 p-3 shadow-xl">
              {/* Tail */}
              <div
                className="absolute -left-2 bottom-4 w-4 h-4 rotate-45 bg-white border-l-2 border-b-2 border-primary/40"
              />
              <button
                onClick={hideMascot}
                className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full hover:bg-muted flex items-center justify-center"
                aria-label="Close"
              >
                <X className="w-3 h-3" />
              </button>
              <p className="text-sm text-foreground leading-snug pr-4">
                {message}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Celebration overlay shown when a lesson is completed or a badge is unlocked.
 */
export function CelebrationOverlay() {
  const visible = useKitchen((s) => s.celebrationVisible)
  const hideCelebration = useKitchen((s) => s.hideCelebration)
  const unlockedBadges = useKitchen((s) => s.unlockedBadges)
  const completedLessons = useKitchen((s) => s.completedLessons)
  const setActiveStation = useKitchen((s) => s.setActiveStation)

  // Pre-compute confetti pieces ONCE per visibility mount.
  // useMemo with [visible] dependency means pieces are regenerated only
  // when the overlay is re-opened — not on every render, which would
  // cause visible flicker ("bubbling") during the animation.
  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 30 }).map(() => ({
        left: Math.random() * 100,
        direction: Math.random() > 0.5 ? 1 : -1,
        duration: 2 + Math.random(),
        delay: Math.random() * 0.5,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      })),
    [visible]
  )

  const handleDone = () => {
    hideCelebration()
    setActiveStation("bench")
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:hidden"
          onClick={handleDone}
        >
          <motion.div
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.5, y: 50 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="relative max-w-md w-full rounded-2xl bg-card border-4 border-primary/40 p-6 shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Confetti (pre-computed, no flicker) */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
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
                  initial={{ y: -20, rotate: 0 }}
                  animate={{
                    y: ["-20px", "120%"],
                    rotate: [0, 360 * piece.direction * 3],
                  }}
                  transition={{
                    duration: piece.duration,
                    delay: piece.delay,
                    repeat: Infinity,
                  }}
                />
              ))}
            </div>

            {/* Trophy */}
            <motion.div
              animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-6xl mb-2"
            >
              🎉
            </motion.div>

            <h2 className="text-2xl font-bold mb-1">Congratulations!</h2>
            <p className="text-sm text-muted-foreground mb-4">
              You completed a Bake School lesson!
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-2.5">
                <div className="text-[10px] uppercase text-amber-700 font-bold">Lessons Done</div>
                <div className="text-xl font-mono font-bold text-amber-800">
                  {completedLessons.length}
                </div>
              </div>
              <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-2.5">
                <div className="text-[10px] uppercase text-yellow-700 font-bold">Badges Earned</div>
                <div className="text-xl font-mono font-bold text-yellow-800">
                  {unlockedBadges.length}
                </div>
              </div>
            </div>

            <Button onClick={handleDone} className="w-full h-12 text-base" size="lg">
              <PartyPopper className="w-4 h-4 mr-1.5" /> Back to the Kitchen
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const CONFETTI_COLORS = [
  "#E84A4F", "#F5D040", "#5A8ACF", "#7AC07A",
  "#B070C8", "#FF8A40", "#E58AB8", "#7FBED6",
]
