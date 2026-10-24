"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChefHat,
  ShoppingBasket,
  Blend as MixingIcon,
  Microwave,
  Flame,
  Droplets,
  Sparkles as SparklesIcon,
  FileText,
  Mic,
  MicOff,
  FlaskConical,
  ScrollText,
  Trash2,
  Eye,
  Home,
  GraduationCap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useKitchen, type StationId } from "@/lib/kitchen-store"
import { useMounted, formatTimeHMS } from "@/hooks/use-mounted"
import { useLessonTracker } from "@/hooks/use-lesson-tracker"
import { getLesson } from "@/lib/lessons"
import { PantryStation } from "./PantryStation"
import { MixingStation } from "./MixingStation"
import { StandMixerStation } from "./StandMixerStation"
import { OvenStation } from "./OvenStation"
import { ToppingsStation } from "./ToppingsStation"
import { ShowcaseStation } from "./ShowcaseStation"
import { SinkStation } from "./SinkStation"
import { RecipeExporter } from "./RecipeExporter"
import { VoiceAssistant } from "./VoiceAssistant"
import { ScienceOverlay } from "./ScienceOverlay"
import { KitchenBench } from "./KitchenBench"
import { BakeSchoolStation } from "./BakeSchoolStation"
import { MascotBubble, CelebrationOverlay } from "./MascotOverlay"
import { BowlContentsList } from "./BowlView"

const STATIONS: {
  id: StationId
  label: string
  icon: typeof Flame
  description: string
}[] = [
  { id: "bench", label: "Kitchen", icon: Home, description: "Your virtual kitchen bench" },
  { id: "school", label: "Bake School", icon: GraduationCap, description: "Learn step-by-step with Chef Bear" },
  { id: "pantry", label: "Pantry", icon: ShoppingBasket, description: "Browse & add ingredients" },
  { id: "mixing", label: "Mixing", icon: MixingIcon, description: "Whisk bowl by hand" },
  { id: "mixer", label: "Stand Mixer", icon: Microwave, description: "Knead & develop gluten" },
  { id: "oven", label: "Smart Oven", icon: Flame, description: "Bake with real-time physics" },
  { id: "toppings", label: "Toppings", icon: SparklesIcon, description: "Decorate your bake (touch-friendly)" },
  { id: "showcase", label: "Showcase", icon: Eye, description: "Display finished cake for the customer" },
  { id: "sink", label: "Sink", icon: Droplets, description: "Wash utensils" },
  { id: "recipe", label: "Recipe", icon: FileText, description: "Export printable card" },
]

const LOG_COLORS: Record<string, string> = {
  info: "text-muted-foreground",
  action: "text-foreground",
  thermal: "text-primary",
  science: "text-accent-foreground",
  voice: "text-blue-600",
  warning: "text-destructive",
}

export function KitchenApp() {
  const activeStation = useKitchen((s) => s.activeStation)
  const setActiveStation = useKitchen((s) => s.setActiveStation)
  const bowl = useKitchen((s) => s.bowl)
  const mixLevel = useKitchen((s) => s.mixLevel)
  const kneadLevel = useKitchen((s) => s.kneadLevel)
  const baking = useKitchen((s) => s.baking)
  const ovenOn = useKitchen((s) => s.ovenOn)
  const ovenTempC = useKitchen((s) => s.ovenTempC)
  const utensils = useKitchen((s) => s.utensils)
  const log = useKitchen((s) => s.log)
  const clearLog = useKitchen((s) => s.clearLog)
  const voiceAssistant = useKitchen((s) => s.voiceAssistant)
  const toggleVoice = useKitchen((s) => s.toggleVoice)
  const scienceOverlay = useKitchen((s) => s.scienceOverlay)
  const toggleScience = useKitchen((s) => s.toggleScience)
  const appliedToppings = useKitchen((s) => s.appliedToppings)
  const servedToCustomer = useKitchen((s) => s.servedToCustomer)

  const [voiceOpen, setVoiceOpen] = useState(false)
  const [scienceOpen, setScienceOpen] = useState(false)
  const logEndRef = useRef<HTMLDivElement>(null)
  // Defers rendering of locale-sensitive time strings until after hydration
  // so SSR HTML matches the first client render.
  const mounted = useMounted()
  // Auto-track lesson progress + unlock badges based on store state
  useLessonTracker()

  // Sync overlay open states with toggles
  useEffect(() => {
    setVoiceOpen(voiceAssistant)
  }, [voiceAssistant])
  useEffect(() => {
    setScienceOpen(scienceOverlay)
  }, [scienceOverlay])

  // Auto-scroll log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [log])

  const dirtyCount = utensils.filter((u) => u.state !== "clean").length
  const totalMass = bowl.reduce((a, b) => a + b.grams, 0)

  const renderStation = () => {
    switch (activeStation) {
      case "bench": return <KitchenBench />
      case "school": return <BakeSchoolStation />
      case "pantry": return <PantryStation />
      case "mixing": return <MixingStation />
      case "mixer": return <StandMixerStation />
      case "oven": return <OvenStation />
      case "toppings": return <ToppingsStation />
      case "showcase": return <ShowcaseStation />
      case "sink": return <SinkStation />
      case "recipe": return <RecipeExporter />
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ─── Top Bar ─── */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-md print:hidden">
        <div className="px-3 sm:px-4 py-2 flex items-center gap-2 sm:gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-lg metal-copper flex items-center justify-center shadow-md">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-bold leading-tight tracking-tight">
                HIRA <span className="text-primary">Bakery</span>
              </div>
              <div className="text-[10px] text-muted-foreground leading-tight">
                Modern Virtual Baking Kitchen
              </div>
            </div>
          </div>

          {/* Status pills */}
          <div className="hidden md:flex items-center gap-1.5 ml-2">
            <Badge variant="outline" className="text-[10px] font-normal">
              <span className={`w-1.5 h-1.5 rounded-full mr-1 ${ovenOn ? "bg-primary animate-pulse" : "bg-muted-foreground/40"}`} />
              Oven {ovenOn ? `${ovenTempC}°C` : "Off"}
            </Badge>
            <Badge variant="outline" className="text-[10px] font-normal">
              Bowl: {totalMass}g · {bowl.length} ing.
            </Badge>
            <Badge variant="outline" className="text-[10px] font-normal">
              Mix: {Math.round(mixLevel * 100)}%
            </Badge>
            {kneadLevel > 0 && (
              <Badge variant="outline" className="text-[10px] font-normal">
                Knead: {Math.round(kneadLevel * 100)}%
              </Badge>
            )}
            {appliedToppings.length > 0 && (
              <Badge variant="outline" className="text-[10px] font-normal">
                Toppings: {appliedToppings.length}
              </Badge>
            )}
            {baking.status === "done" && !servedToCustomer && (
              <Badge className="text-[10px] font-normal bg-amber-500 text-white border-amber-500 animate-pulse">
                Ready to serve!
              </Badge>
            )}
            {servedToCustomer && (
              <Badge className="text-[10px] font-normal bg-rose-500 text-white border-rose-500">
                Served
              </Badge>
            )}
            {dirtyCount > 0 && (
              <Badge variant="outline" className="text-[10px] font-normal text-destructive border-destructive/40">
                {dirtyCount} dirty
              </Badge>
            )}
          </div>

          {/* Right toggles */}
          <div className="ml-auto flex items-center gap-1.5">
            <Button
              variant={scienceOverlay ? "secondary" : "ghost"}
              size="sm"
              onClick={toggleScience}
              className="h-9"
              title="Toggle Science AR Overlay"
            >
              <FlaskConical className={`w-4 h-4 ${scienceOverlay ? "text-primary" : ""}`} />
              <span className="hidden sm:inline ml-1.5 text-xs">Science</span>
            </Button>
            <Button
              variant={voiceAssistant ? "secondary" : "ghost"}
              size="sm"
              onClick={toggleVoice}
              className="h-9"
              title="Toggle Voice Assistant"
            >
              {voiceAssistant ? <Mic className="w-4 h-4 text-primary" /> : <MicOff className="w-4 h-4" />}
              <span className="hidden sm:inline ml-1.5 text-xs">Voice</span>
            </Button>
          </div>
        </div>

        {/* Station tabs */}
        <div className="px-3 sm:px-4 pb-2 flex gap-1 overflow-x-auto kitchen-scrollbar">
          {STATIONS.map((s) => {
            const Icon = s.icon
            const active = activeStation === s.id
            return (
              <button
                key={s.id}
                onClick={() => setActiveStation(s.id)}
                className={`group flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition whitespace-nowrap ${
                  active
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card border-border hover:border-primary/50 hover:bg-accent/30"
                }`}
                title={s.description}
              >
                <Icon className="w-4 h-4" />
                <span>{s.label}</span>
                {s.id === "oven" && ovenOn && baking.status === "baking" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
                )}
                {s.id === "toppings" && appliedToppings.length > 0 && (
                  <span className="text-[10px] px-1.5 rounded-full bg-primary/80 text-primary-foreground">
                    {appliedToppings.length}
                  </span>
                )}
                {s.id === "showcase" && baking.status === "done" && !servedToCustomer && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
                {s.id === "showcase" && servedToCustomer && (
                  <span className="text-[10px] px-1.5 rounded-full bg-rose-500 text-white">
                    ✓
                  </span>
                )}
                {s.id === "sink" && dirtyCount > 0 && (
                  <span className="text-[10px] px-1 rounded-full bg-destructive text-destructive-foreground">
                    {dirtyCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </header>

      {/* ─── Main Layout ─── */}
      <div className="flex-1 grid lg:grid-cols-[1fr_280px] gap-3 p-3 sm:p-4 min-h-0">
        {/* Station viewport */}
        <main className="min-h-0 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStation}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex-1 min-h-0"
            >
              {renderStation()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Side panel: bowl + log */}
        <aside className="hidden lg:flex flex-col gap-3 min-h-0">
          {/* Bowl contents */}
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Bowl Contents
              </h3>
              <Badge variant="outline" className="text-[10px]">{totalMass}g</Badge>
            </div>
            <BowlContentsList />
          </div>

          {/* Action log */}
          <div className="rounded-lg border border-border bg-card p-3 flex-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <ScrollText className="w-3 h-3" /> Action Log
              </h3>
              <button
                onClick={clearLog}
                className="text-[10px] text-muted-foreground hover:text-destructive flex items-center gap-1"
                title="Clear log"
              >
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            </div>
            <div className="flex-1 overflow-y-auto kitchen-scrollbar space-y-1 text-xs">
              {log.slice().reverse().map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`leading-snug ${LOG_COLORS[entry.kind] ?? "text-foreground"}`}
                >
                  <span className="font-mono text-[10px] text-muted-foreground/70 mr-1.5">
                    {mounted ? formatTimeHMS(entry.time) : "--:--:--"}
                  </span>
                  {entry.text}
                </motion.div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>
        </aside>
      </div>

      {/* ─── Mobile log toggle (collapsible) ─── */}
      <details className="lg:hidden border-t border-border bg-card print:hidden">
        <summary className="px-4 py-2 text-sm font-semibold flex items-center gap-2 cursor-pointer">
          <ScrollText className="w-4 h-4" />
          Bowl & Log
          <Badge variant="outline" className="ml-auto text-[10px]">{log.length}</Badge>
        </summary>
        <div className="px-4 pb-3 space-y-3">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
              Bowl Contents
            </h3>
            <BowlContentsList />
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
              Action Log
            </h3>
            <div className="max-h-48 overflow-y-auto kitchen-scrollbar space-y-1 text-xs">
              {log.slice().reverse().map((entry) => (
                <div key={entry.id} className={`leading-snug ${LOG_COLORS[entry.kind] ?? "text-foreground"}`}>
                  <span className="font-mono text-[10px] text-muted-foreground/70 mr-1.5">
                    {mounted ? formatTimeHMS(entry.time) : "--:--:--"}
                  </span>
                  {entry.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </details>

      {/* ─── Floating overlays ─── */}
      <VoiceAssistant open={voiceOpen} onClose={() => toggleVoice()} />
      <ScienceOverlay open={scienceOpen} onClose={() => toggleScience()} />
      <MascotBubble />
      <CelebrationOverlay />

      {/* ─── Active Lesson step indicator (bottom of screen) ─── */}
      <ActiveLessonBar />

      {/* ─── Footer ─── */}
      <footer className="mt-auto border-t border-border bg-card/60 px-4 py-2 text-[10px] text-muted-foreground text-center print:hidden">
        HIRA Bakery · Modern virtual baking kitchen · Physics & chemistry simulation · Recipe export — all running locally in your browser.
      </footer>
    </div>
  )
}

// ─── Active Lesson step indicator (floating bottom bar) ──────────────────

function ActiveLessonBar() {
  const activeLessonId = useKitchen((s) => s.activeLessonId)
  const activeLessonStep = useKitchen((s) => s.activeLessonStep)
  const exitLesson = useKitchen((s) => s.exitLesson)
  const setActiveStation = useKitchen((s) => s.setActiveStation)
  const activeStation = useKitchen((s) => s.activeStation)

  if (!activeLessonId) return null
  const lesson = getLesson(activeLessonId)
  if (!lesson) return null
  const step = lesson.steps[activeLessonStep]
  if (!step) return null

  const onWrongStation = step.station !== activeStation

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      className="fixed bottom-0 inset-x-0 z-30 print:hidden"
    >
      <div
        className="mx-auto max-w-3xl m-3 rounded-xl border-2 border-primary/50 p-3 shadow-xl flex items-center gap-3"
        style={{
          background: "linear-gradient(135deg, #fff5d8 0%, #ffe0a8 50%, #fcd34d 100%)",
        }}
      >
        <div className="text-2xl shrink-0">{lesson.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-primary font-bold">
            <span>{lesson.title}</span>
            <span>·</span>
            <span>Step {activeLessonStep + 1}/{lesson.steps.length}</span>
            {onWrongStation && (
              <Badge className="ml-1 bg-amber-500 text-white animate-pulse">
                Go to {step.station} →
              </Badge>
            )}
          </div>
          <div className="text-sm font-semibold truncate">{step.instruction}</div>
        </div>
        {onWrongStation && (
          <Button
            size="sm"
            onClick={() => setActiveStation(step.station)}
            className="shrink-0"
          >
            Go →
          </Button>
        )}
        <button
          onClick={exitLesson}
          className="text-xs text-muted-foreground hover:text-destructive px-2 py-1 shrink-0"
          aria-label="Exit lesson"
        >
          Exit
        </button>
      </div>
    </motion.div>
  )
}
