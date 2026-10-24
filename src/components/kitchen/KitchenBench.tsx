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
  GraduationCap,
  Award,
  ArrowRight,
} from "lucide-react"
import { useKitchen } from "@/lib/kitchen-store"
import { BADGES, LESSONS, randomFunFact } from "@/lib/lessons"
import { HiraLogo } from "./HiraLogo"
import { useEffect, useState } from "react"

interface BenchStation {
  id:
    | "pantry" | "mixing" | "mixer" | "oven"
    | "toppings" | "showcase" | "school" | "sink" | "recipe"
  label: string
  emoji: string
  icon: typeof Flame
  description: string
  /** Tailwind gradient classes for the card */
  gradient: string
  /** Solid accent color for icons/borders */
  accent: string
  /** Category for visual grouping */
  category: "learn" | "prep" | "bake" | "finish"
}

const BENCH_STATIONS: BenchStation[] = [
  // Learn
  {
    id: "school",
    label: "Bake School",
    emoji: "🎓",
    icon: GraduationCap,
    description: "Step-by-step lessons with Chef Bear",
    gradient: "from-amber-50 to-amber-100",
    accent: "#d97706",
    category: "learn",
  },
  // Prep
  {
    id: "pantry",
    label: "Pantry",
    emoji: "🧺",
    icon: ShoppingBasket,
    description: "23 ingredients across 7 categories",
    gradient: "from-orange-50 to-amber-100",
    accent: "#c2410c",
    category: "prep",
  },
  {
    id: "mixing",
    label: "Mixing Bowl",
    emoji: "🥣",
    icon: MixingIcon,
    description: "Whisk ingredients by hand",
    gradient: "from-sky-50 to-blue-100",
    accent: "#0369a1",
    category: "prep",
  },
  {
    id: "mixer",
    label: "Stand Mixer",
    emoji: "🍰",
    icon: Microwave,
    description: "Pro kneading power for dough",
    gradient: "from-slate-50 to-zinc-100",
    accent: "#475569",
    category: "prep",
  },
  // Bake
  {
    id: "oven",
    label: "Smart Oven",
    emoji: "🔥",
    icon: Flame,
    description: "Bake with real-time physics",
    gradient: "from-rose-50 to-orange-100",
    accent: "#b91c1c",
    category: "bake",
  },
  // Finish
  {
    id: "toppings",
    label: "Decorating",
    emoji: "🎨",
    icon: SparklesIcon,
    description: "Add glazes, frostings & sprinkles",
    gradient: "from-pink-50 to-fuchsia-100",
    accent: "#a21caf",
    category: "finish",
  },
  {
    id: "showcase",
    label: "Showcase",
    emoji: "🎂",
    icon: Eye,
    description: "Display & serve to customers",
    gradient: "from-yellow-50 to-amber-100",
    accent: "#a16207",
    category: "finish",
  },
  {
    id: "sink",
    label: "Sink",
    emoji: "🚰",
    icon: Droplets,
    description: "Wash utensils between steps",
    gradient: "from-cyan-50 to-sky-100",
    accent: "#0e7490",
    category: "finish",
  },
  {
    id: "recipe",
    label: "Recipe Card",
    emoji: "📝",
    icon: FileText,
    description: "Print or save your recipe",
    gradient: "from-stone-50 to-amber-50",
    accent: "#78350f",
    category: "finish",
  },
]

const CATEGORY_LABELS: Record<BenchStation["category"], { label: string; emoji: string }> = {
  learn: { label: "Learn", emoji: "📚" },
  prep: { label: "Prep", emoji: "🍴" },
  bake: { label: "Bake", emoji: "🔥" },
  finish: { label: "Finish", emoji: "✨" },
}

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
    const nextLesson = LESSONS[completedLessons.length] ?? LESSONS[0]
    if (nextLesson) startLesson(nextLesson.id)
  }

  // Group stations by category for organized layout
  const stationsByCategory: Record<BenchStation["category"], BenchStation[]> = {
    learn: BENCH_STATIONS.filter((s) => s.category === "learn"),
    prep: BENCH_STATIONS.filter((s) => s.category === "prep"),
    bake: BENCH_STATIONS.filter((s) => s.category === "bake"),
    finish: BENCH_STATIONS.filter((s) => s.category === "finish"),
  }

  return (
    <div className="h-full flex flex-col gap-3 overflow-y-auto kitchen-scrollbar pr-1 -mr-1">
      {/* Top hero banner — clean and modern */}
      <div
        className="relative rounded-2xl p-4 sm:p-5 overflow-hidden shrink-0"
        style={{
          background:
            "linear-gradient(135deg, #1a1410 0%, #2a1f17 40%, #b8602b 100%)",
          boxShadow: "0 10px 30px -10px rgba(80, 50, 20, 0.5)",
        }}
      >
        {/* Decorative pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 20%, rgba(252, 211, 77, 0.4), transparent 50%), radial-gradient(circle at 20% 80%, rgba(212, 144, 79, 0.3), transparent 50%)",
          }}
        />

        <div className="relative flex flex-wrap items-center gap-4">
          {/* Logo + title */}
          <div className="flex items-center gap-3 flex-1 min-w-[260px]">
            <motion.div
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="shrink-0 rounded-2xl overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #fcd34d, #b8602b)",
                boxShadow: "0 8px 20px rgba(184, 96, 43, 0.5)",
              }}
            >
              <HiraLogo size={56} />
            </motion.div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold leading-tight text-white tracking-tight">
                HIRA <span className="text-amber-300">Bakery</span>
              </h1>
              <p className="text-xs sm:text-sm text-amber-100/70 leading-tight mt-0.5">
                {completedLessons.length === 0
                  ? "Welcome! Start with a lesson or explore the kitchen."
                  : `Welcome back! ${completedLessons.length} of ${LESSONS.length} lessons complete.`}
              </p>
            </div>
          </div>

          {/* Stats — clean pill row */}
          <div className="flex flex-wrap items-center gap-2">
            <StatPill icon="🎓" label="Lessons" value={`${lessonsCount}/${LESSONS.length}`} />
            <StatPill icon="🏆" label="Badges" value={`${badgesCount}/${BADGES.length}`} />
            {totalMass > 0 && <StatPill icon="🥣" label="Bowl" value={`${totalMass}g`} />}
            {baking.status === "baking" && (
              <StatPill icon="🔥" label="Baking" value={`${Math.round(baking.brownLevel * 100)}%`} />
            )}
            {servedToCustomer && <StatPill icon="✨" label="Served" value="✓" />}
          </div>
        </div>

        {/* CTA buttons row */}
        <div className="relative flex flex-wrap gap-2 mt-4">
          <button
            onClick={handleStartFirstLesson}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-stone-900 active:scale-95 transition shadow-lg"
            style={{
              background: "linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%)",
              boxShadow: "0 4px 12px rgba(252, 211, 77, 0.4)",
            }}
          >
            <GraduationCap className="w-4 h-4" />
            {lessonsCount === 0 ? "Start First Lesson" : "Continue Learning"}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setActiveStation("pantry")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-white/10 text-white border border-white/20 hover:bg-white/15 active:scale-95 transition"
          >
            <ShoppingBasket className="w-4 h-4" />
            Free Play
          </button>
          <button
            onClick={() => showMascot(`🌟 Fun fact: ${funFact}`)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-white/10 text-white border border-white/20 hover:bg-white/15 active:scale-95 transition"
          >
            <SparklesIcon className="w-4 h-4" />
            Fun Fact
          </button>
        </div>
      </div>

      {/* Stations organized by category — clean grid */}
      <div className="flex-1 space-y-3 min-h-0">
        {(Object.keys(stationsByCategory) as BenchStation["category"][]).map((cat) => {
          const stations = stationsByCategory[cat]
          if (stations.length === 0) return null
          const meta = CATEGORY_LABELS[cat]
          return (
            <div key={cat} className="space-y-2">
              {/* Category label */}
              <div className="flex items-center gap-2 px-1">
                <span className="text-base">{meta.emoji}</span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {meta.label}
                </h3>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Station cards — responsive grid */}
              <div
                className={`grid gap-2.5 ${
                  cat === "learn"
                    ? "grid-cols-1"
                    : cat === "prep"
                    ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-3"
                    : cat === "bake"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-2 sm:grid-cols-4 lg:grid-cols-4"
                }`}
              >
                {stations.map((station, idx) => (
                  <StationCard
                    key={station.id}
                    station={station}
                    onClick={() => handleStationClick(station)}
                    index={idx}
                    stateBadge={getStateBadge(station.id, {
                      bowl,
                      baking,
                      appliedToppings,
                      ovenOn,
                      servedToCustomer,
                      completedLessons: lessonsCount,
                    })}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Fun fact strip at the bottom */}
      <div
        className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-3 flex items-center gap-3 shrink-0"
      >
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="text-2xl shrink-0"
        >
          💡
        </motion.div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
            Did you know?
          </div>
          <motion.p
            key={funFact}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-amber-900 leading-snug mt-0.5"
          >
            {funFact}
          </motion.p>
        </div>
      </div>
    </div>
  )
}

// ─── Station card ────────────────────────────────────────────────────────

function StationCard({
  station,
  onClick,
  index,
  stateBadge,
}: {
  station: BenchStation
  onClick: () => void
  index: number
  stateBadge: string | null
}) {
  const Icon = station.icon
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.97 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={`group relative overflow-hidden rounded-2xl border-2 bg-gradient-to-br ${station.gradient} p-3 sm:p-4 text-left transition-all hover:shadow-xl`}
      style={{
        borderColor: `${station.accent}33`,
      }}
      aria-label={station.label}
    >
      {/* Accent corner glow */}
      <div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-30 blur-2xl pointer-events-none transition-opacity group-hover:opacity-50"
        style={{ background: station.accent }}
      />

      {/* Top row: emoji + state badge */}
      <div className="relative flex items-start justify-between mb-2">
        <motion.div
          className="text-3xl sm:text-4xl"
          whileHover={{ scale: 1.15, rotate: 5 }}
        >
          {station.emoji}
        </motion.div>
        {stateBadge && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white shadow-sm"
            style={{ background: station.accent }}
          >
            {stateBadge}
          </motion.span>
        )}
      </div>

      {/* Label + description */}
      <div className="relative">
        <div className="flex items-center gap-1.5 mb-0.5">
          <Icon className="w-3.5 h-3.5" style={{ color: station.accent }} />
          <h4 className="text-sm font-bold leading-tight" style={{ color: station.accent }}>
            {station.label}
          </h4>
        </div>
        <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
          {station.description}
        </p>
      </div>

      {/* Hover hint arrow */}
      <div
        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: station.accent }}
      >
        <ArrowRight className="w-3.5 h-3.5" />
      </div>
    </motion.button>
  )
}

// ─── State badge helper ──────────────────────────────────────────────────

function getStateBadge(
  stationId: BenchStation["id"],
  state: {
    bowl: { ingredientId: string; grams: number }[]
    baking: { status: string; brownLevel: number }
    appliedToppings: { id: string }[]
    ovenOn: boolean
    servedToCustomer: boolean
    completedLessons: number
  }
): string | null {
  switch (stationId) {
    case "school":
      return state.completedLessons > 0 ? `${state.completedLessons}/10` : null
    case "pantry":
      return state.bowl.length > 0 ? `${state.bowl.length} items` : null
    case "mixing":
    case "mixer": {
      const mass = state.bowl.reduce((a, b) => a + b.grams, 0)
      return mass > 0 ? `${mass}g` : null
    }
    case "oven":
      if (state.ovenOn && state.baking.status === "baking") return "🔥 Live"
      if (state.baking.brownLevel > 0.05) return `${Math.round(state.baking.brownLevel * 100)}%`
      return null
    case "toppings":
      return state.appliedToppings.length > 0 ? `${state.appliedToppings.length}` : null
    case "showcase":
      return state.servedToCustomer ? "✓ Served" : null
    default:
      return null
  }
}

// ─── Stat pill ───────────────────────────────────────────────────────────

function StatPill({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/15">
      <span className="text-sm">{icon}</span>
      <span className="text-[10px] text-amber-100/70 uppercase tracking-wider font-semibold">
        {label}
      </span>
      <span className="text-xs font-bold text-white">{value}</span>
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
