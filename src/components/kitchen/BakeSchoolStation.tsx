"use client"

import { motion, AnimatePresence } from "framer-motion"
import {
  GraduationCap,
  CheckCircle2,
  Lock,
  Star,
  Clock,
  ArrowLeft,
  Sparkles,
  Award,
  RotateCcw,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useKitchen, type LessonCheckContext } from "@/lib/kitchen-store"
import { LESSONS, BADGES, getLesson, getBadge, type Lesson, type LessonStep } from "@/lib/lessons"
import { ChefBearMascot } from "./KitchenBench"

export function BakeSchoolStation() {
  const completedLessons = useKitchen((s) => s.completedLessons)
  const activeLessonId = useKitchen((s) => s.activeLessonId)
  const activeLessonStep = useKitchen((s) => s.activeLessonStep)
  const unlockedBadges = useKitchen((s) => s.unlockedBadges)
  const startLesson = useKitchen((s) => s.startLesson)
  const exitLesson = useKitchen((s) => s.exitLesson)
  const setActiveStation = useKitchen((s) => s.setActiveStation)

  // If a lesson is active, show the in-progress view
  if (activeLessonId) {
    const lesson = getLesson(activeLessonId)
    if (lesson) {
      return (
        <ActiveLessonView
          lesson={lesson}
          currentStep={activeLessonStep}
          onExit={exitLesson}
          onGoToStation={(s) => setActiveStation(s)}
        />
      )
    }
  }

  // Otherwise show the lesson list + badges
  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-4 h-full">
      {/* Left: lesson list */}
      <div className="flex flex-col gap-3 min-h-0">
        <div className="rounded-xl border-2 border-primary/30 p-3 sm:p-4 flex items-center gap-3"
          style={{
            background: "linear-gradient(135deg, #fff5d8 0%, #ffe0a8 50%, #fcd34d 100%)",
            boxShadow: "0 8px 24px -8px rgba(184, 96, 43, 0.4)",
          }}
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="text-4xl sm:text-5xl"
          >
            🎓
          </motion.div>
          <div>
            <h2 className="text-base sm:text-xl font-bold leading-tight">Bake School</h2>
            <p className="text-xs sm:text-sm text-foreground/70 leading-tight">
              Learn to bake step-by-step with Chef Bear! Complete {LESSONS.length} fun lessons and earn badges.
            </p>
          </div>
        </div>

        {/* Lesson grid — scrollable */}
        <div className="flex-1 overflow-y-auto kitchen-scrollbar pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {LESSONS.map((lesson, idx) => {
              const isCompleted = completedLessons.includes(lesson.id)
              const isUnlocked = idx === 0 || completedLessons.includes(LESSONS[idx - 1].id)
              const badge = getBadge(lesson.badgeId)

              return (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  isCompleted={isCompleted}
                  isUnlocked={isUnlocked}
                  badge={badge}
                  onStart={() => startLesson(lesson.id)}
                />
              )
            })}
          </div>
        </div>
      </div>

      {/* Right: badges + progress */}
      <div className="border border-border rounded-lg bg-card p-4 flex flex-col gap-3 min-h-0 overflow-y-auto kitchen-scrollbar">
        <div>
          <h3 className="text-sm font-semibold mb-1 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-primary" /> Achievement Badges
          </h3>
          <p className="text-xs text-muted-foreground">
            You've earned {unlockedBadges.length} of {BADGES.length} badges. Keep baking to unlock them all!
          </p>
        </div>

        {/* Progress bar */}
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full"
            style={{ background: "linear-gradient(90deg, #fcd34d, #b8602b)" }}
            animate={{ width: `${(unlockedBadges.length / BADGES.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Badge grid */}
        <div className="grid grid-cols-3 gap-2">
          {BADGES.map((badge) => {
            const earned = unlockedBadges.includes(badge.id)
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={earned ? { scale: 1.05 } : {}}
                className={`relative aspect-square rounded-lg p-2 flex flex-col items-center justify-center text-center border-2 ${
                  earned ? "border-primary" : "border-border opacity-50"
                }`}
                style={{
                  background: earned ? badge.color : "var(--muted)",
                }}
                title={earned ? `${badge.name}: ${badge.description}` : "Locked — keep playing to unlock!"}
              >
                <div className={`text-2xl ${earned ? "" : "grayscale opacity-60"}`}>
                  {earned ? badge.emoji : "🔒"}
                </div>
                <div className={`text-[8px] sm:text-[9px] font-bold leading-tight mt-0.5 ${
                  earned ? "text-foreground" : "text-muted-foreground"
                }`}>
                  {badge.name}
                </div>
                {!earned && (
                  <Lock className="absolute top-1 right-1 w-2.5 h-2.5 text-muted-foreground" />
                )}
              </motion.div>
            )
          })}
        </div>

        <div className="mt-auto pt-3 border-t border-border text-[11px] text-muted-foreground">
          <p className="flex items-start gap-1.5">
            <Sparkles className="w-3 h-3 mt-0.5 shrink-0 text-primary" />
            <span>Badges unlock automatically as you bake. Try new recipes and experiments to find them all!</span>
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Lesson card ──────────────────────────────────────────────────────────

function LessonCard({
  lesson,
  isCompleted,
  isUnlocked,
  badge,
  onStart,
}: {
  lesson: Lesson
  isCompleted: boolean
  isUnlocked: boolean
  badge: ReturnType<typeof getBadge>
  onStart: () => void
}) {
  return (
    <motion.div
      whileHover={isUnlocked ? { y: -2 } : {}}
      className={`relative rounded-lg border-2 p-3 transition ${
        isCompleted
          ? "border-green-400 bg-green-50"
          : isUnlocked
          ? "border-primary/40 bg-card hover:border-primary"
          : "border-border bg-muted/30 opacity-60"
      }`}
    >
      {/* Header */}
      <div className="flex items-start gap-2 mb-1.5">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-2xl shrink-0"
          style={{
            background: isUnlocked
              ? `radial-gradient(circle at 30% 30%, ${badge?.color ?? "#fcd34d"}, #b8602b)`
              : "var(--muted)",
          }}
        >
          {isUnlocked ? lesson.emoji : "🔒"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-bold leading-tight">{lesson.title}</h3>
            {isCompleted && (
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
            )}
          </div>
          <p className="text-[11px] text-muted-foreground leading-tight mt-0.5 line-clamp-2">
            {lesson.description}
          </p>
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-2 mb-2 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-0.5">
          <Clock className="w-2.5 h-2.5" />
          {lesson.estMinutes} min
        </span>
        <span className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-2 h-2 ${
                i < lesson.difficulty ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"
              }`}
            />
          ))}
        </span>
        <span>{lesson.steps.length} steps</span>
      </div>

      {/* Action */}
      {isUnlocked ? (
        <Button
          onClick={onStart}
          size="sm"
          className="w-full h-9"
          variant={isCompleted ? "outline" : "default"}
        >
          {isCompleted ? (
            <>
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Replay
            </>
          ) : (
            <>
              <GraduationCap className="w-3.5 h-3.5 mr-1" /> Start Lesson
            </>
          )}
        </Button>
      ) : (
        <div className="text-[10px] text-center text-muted-foreground italic py-1.5">
          🔒 Complete previous lesson to unlock
        </div>
      )}
    </motion.div>
  )
}

// ─── Active lesson view (shown when a lesson is in progress) ──────────────

function ActiveLessonView({
  lesson,
  currentStep,
  onExit,
  onGoToStation,
}: {
  lesson: Lesson
  currentStep: number
  onExit: () => void
  onGoToStation: (s: LessonStep["station"]) => void
}) {
  const step = lesson.steps[currentStep]
  const totalSteps = lesson.steps.length
  const progressPct = ((currentStep + 1) / totalSteps) * 100

  if (!step) return null

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Top header with progress */}
      <div
        className="rounded-xl border-2 border-primary/30 p-3 sm:p-4 flex items-center gap-3"
        style={{
          background: "linear-gradient(135deg, #fff5d8 0%, #ffe0a8 50%, #fcd34d 100%)",
          boxShadow: "0 8px 24px -8px rgba(184, 96, 43, 0.4)",
        }}
      >
        <button
          onClick={onExit}
          className="w-9 h-9 rounded-full bg-card/80 hover:bg-card flex items-center justify-center shrink-0"
          aria-label="Exit lesson"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-2xl">{lesson.emoji}</span>
            <h2 className="text-base sm:text-lg font-bold leading-tight">{lesson.title}</h2>
          </div>
          <p className="text-[11px] sm:text-xs text-foreground/70 leading-tight mt-0.5">
            Step {currentStep + 1} of {totalSteps}
          </p>
        </div>
        <Badge className="bg-primary/80">
          {Math.round(progressPct)}%
        </Badge>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full"
          style={{ background: "linear-gradient(90deg, #fcd34d, #b8602b)" }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Main content: mascot + current step */}
      <div className="flex-1 grid lg:grid-cols-[1fr_280px] gap-3 min-h-0">
        {/* Left: current step instruction */}
        <div
          className="rounded-xl border-2 border-primary/40 p-4 sm:p-6 flex flex-col"
          style={{
            background:
              "radial-gradient(ellipse at 30% 20%, #fff8e8 0%, #fff0d0 50%, #fcd34d 100%)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] uppercase tracking-widest text-primary font-bold">
              Step {currentStep + 1}
            </span>
            <span className="text-[10px] text-muted-foreground">·</span>
            <span className="text-[10px] text-muted-foreground capitalize">
              {step.station} station
            </span>
          </div>

          <h3 className="text-lg sm:text-2xl font-bold leading-tight mb-2">
            {step.instruction}
          </h3>

          <p className="text-sm sm:text-base text-foreground/80 italic leading-relaxed mb-3">
            💡 {step.hint}
          </p>

          {/* Step list — show all steps with current highlighted */}
          <div className="flex-1 overflow-y-auto kitchen-scrollbar mt-2">
            <div className="space-y-1.5">
              {lesson.steps.map((s, i) => {
                const isPast = i < currentStep
                const isCurrent = i === currentStep
                return (
                  <div
                    key={i}
                    className={`flex items-start gap-2 p-2 rounded-md text-xs ${
                      isCurrent
                        ? "bg-primary/10 border border-primary/40"
                        : isPast
                        ? "opacity-50"
                        : ""
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        isPast
                          ? "bg-green-500 text-white"
                          : isCurrent
                          ? "bg-primary text-primary-foreground animate-pulse"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isPast ? "✓" : i + 1}
                    </div>
                    <div className={`flex-1 ${isCurrent ? "font-semibold" : ""}`}>
                      {s.instruction}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Action button */}
          <Button
            onClick={() => onGoToStation(step.station)}
            className="w-full h-12 mt-3 text-base"
            size="lg"
          >
            Go to {step.station} →
          </Button>
        </div>

        {/* Right: Chef Bear + learning goals + fun fact */}
        <div className="flex flex-col gap-3 min-h-0">
          {/* Chef Bear mascot */}
          <div className="rounded-lg border-2 border-primary/30 bg-card p-3 flex flex-col items-center text-center">
            <ChefBearMascot size={88} />
            <div className="text-xs font-bold mt-1.5">Chef Bear</div>
            <p className="text-[11px] text-muted-foreground italic mt-0.5">
              "You're doing great! I'm right here if you need help."
            </p>
          </div>

          {/* Learning goals */}
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="text-xs font-semibold mb-1.5 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-primary" /> You'll Learn
            </div>
            <ul className="space-y-1 text-[11px] text-muted-foreground">
              {lesson.learningGoals.map((g, i) => (
                <li key={i} className="leading-snug">
                  • {g}
                </li>
              ))}
            </ul>
          </div>

          {/* Fun fact if available */}
          {step.funFact && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border-2 border-amber-300 bg-amber-50 p-3"
            >
              <div className="text-xs font-semibold mb-1 flex items-center gap-1.5 text-amber-800">
                <Sparkles className="w-3.5 h-3.5" /> Fun Fact!
              </div>
              <p className="text-[11px] text-amber-900 leading-relaxed">
                {step.funFact}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
