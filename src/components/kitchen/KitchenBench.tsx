"use client"

import { motion } from "framer-motion"
import {
  ShoppingBasket,
  Blend as MixingIcon,
  Microwave,
  Flame,
  Sparkles as SparklesIcon,
  Eye,
  Droplets,
  FileText,
  ChefHat,
  GraduationCap,
  Award,
} from "lucide-react"
import { useKitchen } from "@/lib/kitchen-store"
import { BADGES, LESSONS, randomFunFact } from "@/lib/lessons"
import { useEffect, useState } from "react"

interface BenchStation {
  id:
    | "pantry" | "mixing" | "mixer" | "oven"
    | "toppings" | "showcase" | "school" | "sink" | "recipe"
  label: string
  emoji: string
  icon: typeof Flame
  description: string
  /** Position on the bench in % (left, top of placement area) */
  position: { left: string; top: string; width: string; height: string }
  /** Color theme for the appliance */
  accent: string
}

const BENCH_STATIONS: BenchStation[] = [
  {
    id: "school",
    label: "Bake School",
    emoji: "🎓",
    icon: GraduationCap,
    description: "Learn step-by-step with Chef Bear!",
    position: { left: "2%", top: "8%", width: "20%", height: "32%" },
    accent: "#fcd34d",
  },
  {
    id: "pantry",
    label: "Pantry",
    emoji: "🚪",
    icon: ShoppingBasket,
    description: "All your ingredients",
    position: { left: "24%", top: "8%", width: "18%", height: "32%" },
    accent: "#c9a779",
  },
  {
    id: "mixing",
    label: "Mixing Bowl",
    emoji: "🥣",
    icon: MixingIcon,
    description: "Whisk by hand",
    position: { left: "44%", top: "8%", width: "16%", height: "32%" },
    accent: "#7FBED6",
  },
  {
    id: "mixer",
    label: "Stand Mixer",
    emoji: "🍰",
    icon: Microwave,
    description: "Pro kneading power",
    position: { left: "62%", top: "8%", width: "18%", height: "32%" },
    accent: "#b0b0b8",
  },
  {
    id: "oven",
    label: "Smart Oven",
    emoji: "🔥",
    icon: Flame,
    description: "Bake with real heat",
    position: { left: "82%", top: "8%", width: "16%", height: "32%" },
    accent: "#b8602b",
  },
  {
    id: "toppings",
    label: "Decorating",
    emoji: "🎨",
    icon: SparklesIcon,
    description: "Add the finishing touches",
    position: { left: "2%", top: "58%", width: "22%", height: "32%" },
    accent: "#E58AB8",
  },
  {
    id: "showcase",
    label: "Showcase",
    emoji: "🎂",
    icon: Eye,
    description: "Show off your bake",
    position: { left: "26%", top: "58%", width: "22%", height: "32%" },
    accent: "#fcd34d",
  },
  {
    id: "sink",
    label: "Sink",
    emoji: "🚰",
    icon: Droplets,
    description: "Wash up like a real chef",
    position: { left: "50%", top: "58%", width: "18%", height: "32%" },
    accent: "#7FBED6",
  },
  {
    id: "recipe",
    label: "Recipe Card",
    emoji: "📝",
    icon: FileText,
    description: "Print your recipe",
    position: { left: "70%", top: "58%", width: "14%", height: "32%" },
    accent: "#fde68a",
  },
]

export function KitchenBench() {
  const setActiveStation = useKitchen((s) => s.setActiveStation)
  const bowl = useKitchen((s) => s.bowl)
  const baking = useKitchen((s) => s.baking)
  const appliedToppings = useKitchen((s) => s.appliedToppings)
  const ovenOn = useKitchen((s) => s.ovenOn)
  const servedToCustomer = useKitchen((s) => s.servedToCustomer)
  const unlockedBadges = useKitchen((s) => s.unlockedBadges)
  const completedLessons = useKitchen((s) => s.completedLessons)
  const startLesson = useKitchen((s) => s.startLesson)
  const showMascot = useKitchen((s) => s.showMascot)
  const pushLog = useKitchen((s) => s.pushLog)

  const [funFact, setFunFact] = useState<string>("")
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFunFact(randomFunFact())
    const interval = setInterval(() => setFunFact(randomFunFact()), 12000)
    return () => clearInterval(interval)
  }, [])

  const totalMass = bowl.reduce((a, b) => a + b.grams, 0)
  const badgesCount = unlockedBadges.length
  const lessonsCount = completedLessons.length

  const handleStationClick = (station: BenchStation) => {
    setActiveStation(station.id)
  }

  const handleStartFirstLesson = () => {
    const firstLesson = LESSONS[0]
    if (firstLesson) {
      startLesson(firstLesson.id)
    }
  }

  return (
    <div className="h-full flex flex-col gap-3 overflow-hidden">
      {/* Top: welcome / status banner */}
      <div
        className="rounded-xl border-2 border-primary/30 p-3 sm:p-4 flex flex-wrap items-center gap-3 sm:gap-4"
        style={{
          background:
            "linear-gradient(135deg, #fff5d8 0%, #ffe0a8 50%, #fcd34d 100%)",
          boxShadow: "0 8px 24px -8px rgba(184, 96, 43, 0.4)",
        }}
      >
        <div className="flex items-center gap-3 flex-1 min-w-[260px]">
          <motion.div
            animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-3xl shrink-0"
            style={{
              background: "radial-gradient(circle at 30% 30%, #fff5d8, #b8602b)",
              boxShadow: "0 6px 14px rgba(184, 96, 43, 0.4)",
            }}
          >
            👨‍🍳
          </motion.div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-xl font-bold leading-tight">
              Welcome to Your Kitchen!
            </h2>
            <p className="text-xs sm:text-sm text-foreground/70 leading-tight mt-0.5">
              Tap any appliance to start baking, or visit the Bake School to learn step-by-step.
            </p>
          </div>
        </div>

        {/* Progress pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <ProgressPill emoji="🏆" label="Badges" value={badgesCount} total={BADGES.length} color="#fcd34d" />
          <ProgressPill emoji="🎓" label="Lessons" value={lessonsCount} total={LESSONS.length} color="#fde68a" />
          <ProgressPill emoji="🥣" label="In Bowl" value={totalMass} unit="g" color="#7FBED6" />
          {baking.status === "baking" && (
            <ProgressPill emoji="🔥" label="Baking" value={Math.round(baking.brownLevel * 100)} unit="%" color="#b8602b" />
          )}
          {servedToCustomer && (
            <ProgressPill emoji="😊" label="Served!" value={1} color="#bbf7d0" />
          )}
        </div>
      </div>

      {/* Middle: the kitchen bench scene */}
      <div
        className="relative flex-1 min-h-[400px] rounded-2xl overflow-hidden border-2 border-border"
        style={{
          background:
            "radial-gradient(ellipse 100% 70% at 50% 20%, #fff8e8 0%, #f0dca8 35%, #b88848 75%, #5a3818 100%)",
          boxShadow: "inset 0 0 80px rgba(80, 50, 20, 0.3)",
        }}
      >
        {/* Back wall — subway tile pattern */}
        <div
          className="absolute inset-x-0 top-0 h-[42%]"
          style={{
            background:
              "linear-gradient(180deg, #f5ead8 0%, #e8d5b8 100%)",
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent 0px, transparent 28px, rgba(120, 80, 40, 0.15) 28px, rgba(120, 80, 40, 0.15) 30px), repeating-linear-gradient(90deg, transparent 0px, transparent 56px, rgba(120, 80, 40, 0.15) 56px, rgba(120, 40, 0.15) 58px)",
            boxShadow: "inset 0 -8px 16px rgba(80, 50, 20, 0.2)",
          }}
        />

        {/* Window with sky view (decorative) */}
        <div
          className="absolute top-3 left-1/2 -translate-x-1/2 w-[24%] h-[28%] rounded-md overflow-hidden border-4"
          style={{
            borderColor: "#5a3818",
            background:
              "linear-gradient(180deg, #b8e0f5 0%, #d8eef8 50%, #f0d8a8 100%)",
            boxShadow: "inset 0 0 12px rgba(0,0,0,0.3)",
          }}
        >
          {/* Sun */}
          <div
            className="absolute top-1 right-2 w-4 h-4 rounded-full"
            style={{
              background: "radial-gradient(circle, #ffeb3b 0%, #ff9800 100%)",
              boxShadow: "0 0 8px #ffeb3b",
            }}
          />
          {/* Clouds */}
          <motion.div
            className="absolute top-3 left-2 w-3 h-1.5 rounded-full bg-white/80"
            animate={{ x: [0, 30, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute top-6 left-4 w-2 h-1 rounded-full bg-white/60"
            animate={{ x: [0, 25, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear", delay: 2 }}
          />
        </div>

        {/* Counter top — the bench surface */}
        <div
          className="absolute inset-x-0 bottom-0 h-[58%]"
          style={{
            background:
              "linear-gradient(180deg, #8a5028 0%, #6a3818 30%, #4a2810 70%, #2a1808 100%)",
            backgroundImage:
              "repeating-linear-gradient(92deg, rgba(60, 35, 15, 0.15) 0px, rgba(60, 35, 15, 0.15) 2px, transparent 2px, transparent 7px), linear-gradient(180deg, #8a5028 0%, #6a3818 30%, #4a2810 70%, #2a1808 100%)",
            boxShadow: "inset 0 6px 16px rgba(0,0,0,0.5)",
          }}
        >
          {/* Counter top edge highlight */}
          <div
            className="absolute top-0 inset-x-0 h-1.5"
            style={{
              background: "linear-gradient(180deg, rgba(255, 220, 170, 0.6) 0%, transparent 100%)",
            }}
          />
        </div>

        {/* Sunbeam */}
        <div className="absolute inset-0 sunbeam pointer-events-none" />
        {/* Film grain */}
        <div className="absolute inset-0 film-grain pointer-events-none" />

        {/* Appliance hotspots — clickable stations positioned on the bench */}
        {BENCH_STATIONS.map((station, idx) => {
          const Icon = station.icon
          // Special state hints
          let stateBadge: string | null = null
          if (station.id === "oven" && ovenOn && baking.status === "baking") {
            stateBadge = "🔥 Baking"
          } else if (station.id === "showcase" && servedToCustomer) {
            stateBadge = "✓ Served"
          } else if (station.id === "mixing" && totalMass > 0) {
            stateBadge = `${totalMass}g`
          } else if (station.id === "toppings" && appliedToppings.length > 0) {
            stateBadge = `${appliedToppings.length}`
          } else if (station.id === "school" && lessonsCount > 0) {
            stateBadge = `${lessonsCount}/${LESSONS.length}`
          }

          return (
            <motion.button
              key={station.id}
              onClick={() => handleStationClick(station)}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * idx, duration: 0.4 }}
              className="absolute group"
              style={{
                left: station.position.left,
                top: station.position.top,
                width: station.position.width,
                height: station.position.height,
              }}
              aria-label={station.label}
            >
              {/* The appliance visual */}
              <div
                className="relative w-full h-full rounded-xl overflow-hidden flex flex-col items-center justify-center p-2 sm:p-3 transition-all"
                style={{
                  background:
                    `linear-gradient(180deg, ${station.accent}33 0%, ${station.accent}66 100%)`,
                  border: `2px solid ${station.accent}`,
                  boxShadow: `0 8px 20px -4px ${station.accent}99, inset 0 1px 2px rgba(255,255,255,0.5)`,
                }}
              >
                {/* Appliance icon/emoji — large */}
                <motion.div
                  className="text-3xl sm:text-4xl md:text-5xl mb-1"
                  animate={
                    station.id === "oven" && ovenOn
                      ? { scale: [1, 1.05, 1] }
                      : station.id === "mixing" && totalMass > 0
                      ? { rotate: [0, -5, 5, 0] }
                      : {}
                  }
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {station.emoji}
                </motion.div>
                {/* Label */}
                <div className="text-[10px] sm:text-xs font-bold text-foreground leading-tight text-center">
                  {station.label}
                </div>
                {/* Tiny description */}
                <div className="hidden sm:block text-[9px] text-foreground/60 leading-tight text-center mt-0.5">
                  {station.description}
                </div>

                {/* State badge */}
                {stateBadge && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-card shadow-md border border-border"
                    style={{ color: station.accent }}
                  >
                    {stateBadge}
                  </motion.div>
                )}

                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 50% 50%, ${station.accent}55, transparent 70%)`,
                  }}
                />
              </div>
            </motion.button>
          )
        })}

        {/* Chef Bear mascot in corner */}
        <motion.div
          className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 z-10"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChefBearMascot size={64} onClick={() => showMascot("Hi! I'm Chef Bear. Want me to teach you how to bake? Head to the Bake School!")} />
        </motion.div>

        {/* Floating "Tip" badge */}
        <motion.div
          className="absolute top-3 left-3 max-w-[180px] rounded-lg bg-card/95 backdrop-blur-sm border-2 border-primary/40 p-2 shadow-lg pointer-events-none"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <div className="text-[9px] font-bold text-primary uppercase tracking-wide flex items-center gap-1">
            <SparklesIcon className="w-2.5 h-2.5" /> Did you know?
          </div>
          <p className="text-[10px] text-foreground/80 leading-tight mt-0.5">{funFact}</p>
        </motion.div>
      </div>

      {/* Bottom: Quick actions + Start lesson CTA */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleStartFirstLesson}
          className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm sm:text-base font-bold text-white shadow-lg active:scale-95 transition"
          style={{
            background: "linear-gradient(135deg, #b8602b 0%, #d4904f 50%, #fcd34d 100%)",
            boxShadow: "0 6px 16px -4px rgba(184, 96, 43, 0.5)",
          }}
        >
          <GraduationCap className="w-5 h-5" />
          {lessonsCount === 0 ? "Start Your First Lesson!" : `Continue Learning (${lessonsCount}/${LESSONS.length})`}
        </button>
        <button
          onClick={() => setActiveStation("pantry")}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold bg-card border-2 border-border hover:border-primary/50 shadow-sm active:scale-95 transition"
        >
          <ShoppingBasket className="w-5 h-5 text-primary" />
          Free Play
        </button>
        <button
          onClick={() => {
            showMascot(`🌟 Fun fact: ${randomFunFact()}`)
            pushLog("Chef Bear shared a fun fact", "info")
          }}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold bg-card border-2 border-border hover:border-primary/50 shadow-sm active:scale-95 transition"
        >
          <SparklesIcon className="w-5 h-5 text-primary" />
          Fun Fact
        </button>
      </div>
    </div>
  )
}

function ProgressPill({
  emoji,
  label,
  value,
  total,
  unit,
  color,
}: {
  emoji: string
  label: string
  value: number
  total?: number
  unit?: string
  color: string
}) {
  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-card/90 backdrop-blur-sm border-2 text-xs font-bold shadow-sm"
      style={{ borderColor: color, color }}
    >
      <span className="text-sm">{emoji}</span>
      <span className="text-foreground/70">{label}:</span>
      <span>
        {value}{unit ?? ""}
        {total !== undefined && <span className="opacity-60">/{total}</span>}
      </span>
    </div>
  )
}

// ─── Chef Bear Mascot ────────────────────────────────────────────────────

export function ChefBearMascot({
  size = 64,
  onClick,
}: {
  size?: number
  onClick?: () => void
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="relative cursor-pointer"
      style={{ width: size, height: size }}
      aria-label="Chef Bear mascot"
    >
      <svg viewBox="0 0 80 80" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="bearBody" cx="0.4" cy="0.3" r="0.7">
            <stop offset="0%" stopColor="#d4a574" />
            <stop offset="100%" stopColor="#8b5a2b" />
          </radialGradient>
          <radialGradient id="bearMuzzle" cx="0.5" cy="0.4" r="0.6">
            <stop offset="0%" stopColor="#f5e8d0" />
            <stop offset="100%" stopColor="#d4b890" />
          </radialGradient>
        </defs>
        {/* Ears */}
        <circle cx="20" cy="18" r="9" fill="url(#bearBody)" />
        <circle cx="20" cy="18" r="5" fill="#8b5a2b" opacity="0.5" />
        <circle cx="60" cy="18" r="9" fill="url(#bearBody)" />
        <circle cx="60" cy="18" r="5" fill="#8b5a2b" opacity="0.5" />
        {/* Head */}
        <circle cx="40" cy="40" r="28" fill="url(#bearBody)" />
        {/* Chef hat */}
        <ellipse cx="40" cy="20" rx="22" ry="8" fill="#ffffff" />
        <ellipse cx="32" cy="14" rx="9" ry="8" fill="#ffffff" />
        <ellipse cx="40" cy="11" rx="10" ry="9" fill="#ffffff" />
        <ellipse cx="48" cy="14" rx="9" ry="8" fill="#ffffff" />
        <ellipse cx="40" cy="20" rx="22" ry="3" fill="#e8e8e8" />
        {/* Muzzle */}
        <ellipse cx="40" cy="48" rx="14" ry="10" fill="url(#bearMuzzle)" />
        {/* Nose */}
        <ellipse cx="40" cy="44" rx="3" ry="2.5" fill="#2a1a0a" />
        {/* Mouth */}
        <path d="M 36 50 Q 40 53 44 50" stroke="#2a1a0a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Eyes */}
        <circle cx="32" cy="38" r="2.5" fill="#2a1a0a" />
        <circle cx="48" cy="38" r="2.5" fill="#2a1a0a" />
        <circle cx="33" cy="37" r="0.8" fill="#ffffff" />
        <circle cx="49" cy="37" r="0.8" fill="#ffffff" />
        {/* Cheeks */}
        <circle cx="26" cy="46" r="3" fill="#f5a8a8" opacity="0.6" />
        <circle cx="54" cy="46" r="3" fill="#f5a8a8" opacity="0.6" />
      </svg>
    </motion.button>
  )
}
