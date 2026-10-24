"use client"

import { create } from "zustand"
import { getIngredient, type Ingredient } from "./ingredients"
import { TOPPINGS, type ToppingParticle } from "./toppings"
import { BADGES, LESSONS } from "./lessons"

// Build a fast lookup table of topping ID → topping material
const TOPPINGS_LOOKUP = Object.fromEntries(TOPPINGS.map((t) => [t.id, t]))
// Fast lookups for badges and lessons
const BADGES_LOOKUP = Object.fromEntries(BADGES.map((b) => [b.id, b]))
const LESSONS_LOOKUP = Object.fromEntries(LESSONS.map((l) => [l.id, l]))

// ─── Types ────────────────────────────────────────────────────────────────

export type StationId = "bench" | "pantry" | "mixing" | "mixer" | "oven" | "toppings" | "icecream" | "showcase" | "school" | "sink" | "recipe"

/** Cake/pan shape — determines how the finished bake looks in the showcase */
export type BakeShape =
  | "round"      // Classic round layer cake
  | "square"     // Square sheet cake
  | "cupcake"    // Cupcakes (3 visible)
  | "bundt"      // Bundt ring cake
  | "loaf"       // Loaf / bread pan
  | "star"       // Cartoon star shape (kids)
  | "heart"      // Cartoon heart shape (kids)
  | "bear"       // Cartoon bear face (kids)
  | "dino"       // Cartoon dinosaur (kids)
  | "rocket"     // Cartoon rocket (kids)

export interface BowlIngredient {
  ingredientId: string
  grams: number
}

/** A single applied topping instance on the pastry canvas */
export interface AppliedTopping {
  id: string
  toppingId: string
  /** Position on canvas in % (0-100), relative to canvas */
  x: number
  y: number
  /** Size/quantity factor 0..1 (controls visual size + gram weight) */
  amount: number
  /** Optional rotation in degrees for visual variety */
  rotation: number
  /** Stroke path for drizzle/pipe methods (array of {x,y} in canvas %) */
  path?: { x: number; y: number }[]
  /** Piping nozzle type for pipe-method toppings (affects visual style) */
  nozzleType?: string
  /** Pre-computed particles for dust/scatter methods.
   *  Generated once at apply-time so renders are deterministic. */
  particles?: ToppingParticle[]
}

export type OvenMode = "bake" | "fan" | "broil" | "proof"

export type CleanState = "dirty" | "soapy" | "rinsing" | "clean"

export interface Utensil {
  id: string
  name: string
  emoji: string
  state: CleanState
}

export interface ActionLogEntry {
  id: string
  time: number
  text: string
  kind: "info" | "action" | "thermal" | "science" | "voice" | "warning"
}

export interface BakingState {
  status: "idle" | "preheating" | "ready" | "baking" | "done"
  progress: number // 0..1
  riseLevel: number // 0..1 visual expansion
  brownLevel: number // 0..1 Maillard intensity
  donenessLabel: string
}

interface KitchenState {
  // ─── Station navigation ───
  activeStation: StationId
  setActiveStation: (s: StationId) => void

  // ─── Bowl contents (shared between pantry → mixing → oven) ───
  bowl: BowlIngredient[]
  addToBowl: (ingredientId: string, grams?: number) => void
  removeFromBowl: (ingredientId: string) => void
  clearBowl: () => void

  // ─── Mixing state ───
  mixLevel: number // 0..1 — how homogeneous the batter is
  mixSpeed: number // 0..10 mixing animation speed
  isMixing: boolean
  startMixing: (speed: number) => void
  stopMixing: () => void
  incrementMix: (delta: number) => void

  // ─── Mixer station ───
  mixerSpeed: number // 0..10
  isMixerOn: boolean
  kneadLevel: number // 0..1 gluten development
  doughFormed: boolean
  setMixerSpeed: (s: number) => void
  setMixerOn: (on: boolean) => void
  incrementKnead: (delta: number) => void

  // ─── Oven state ───
  ovenTempC: number // 50..300
  ovenMode: OvenMode
  ovenOn: boolean
  ovenLight: boolean
  ovenTimerSec: number // remaining seconds
  ovenTimerTotal: number
  baking: BakingState
  /** Selected cake/pan shape — determines the finished bake's appearance */
  bakeShape: BakeShape
  setBakeShape: (shape: BakeShape) => void
  setOvenTemp: (c: number) => void
  setOvenMode: (m: OvenMode) => void
  setOvenOn: (on: boolean) => void
  toggleOvenLight: () => void
  setOvenTimer: (sec: number) => void
  tickOven: (deltaSec: number) => void

  // ─── Ice Cream station ───
  /** Ingredients added to the ice cream churner (separate from the bake bowl) */
  iceCreamBowl: BowlIngredient[]
  /** Selected ice cream flavor base (vanilla/chocolate/strawberry/matcha/mango) */
  iceCreamFlavor: string
  /** Churn progress 0..1 */
  iceCreamChurnLevel: number
  /** Whether the churner is running */
  iceCreamChurning: boolean
  /** Freeze progress 0..1 (after churning, before serving) */
  iceCreamFreezeLevel: number
  /** Status of the ice cream making process */
  iceCreamStatus: "empty" | "mixing" | "churning" | "freezing" | "ready"
  /** Scoop count served (0 = whole tub) */
  iceCreamScoops: number
  addToIceCreamBowl: (ingredientId: string, grams?: number) => void
  removeFromIceCreamBowl: (ingredientId: string) => void
  clearIceCreamBowl: () => void
  setIceCreamFlavor: (flavor: string) => void
  setIceCreamChurning: (on: boolean) => void
  incrementIceCreamChurn: (delta: number) => void
  startIceCreamFreeze: () => void
  tickIceCreamFreeze: (deltaSec: number) => void
  serveIceCreamScoop: () => void
  resetIceCream: () => void

  // ─── Sink / clean-up ───
  utensils: Utensil[]
  waterOn: boolean
  soapApplied: boolean
  scrubLevel: number // 0..1 per active wash
  toggleWater: () => void
  applySoap: () => void
  scrub: (delta: number) => void
  resetUtensils: () => void

  // ─── Toppings station ───
  appliedToppings: AppliedTopping[]
  /** Currently selected topping for application */
  selectedToppingId: string | null
  /** Brush size 0.3..1.5 — affects per-stroke amount */
  toppingBrushSize: number
  /** Currently selected piping nozzle (for pipe-method toppings) */
  selectedNozzle: string
  setSelectedTopping: (id: string | null) => void
  setToppingBrushSize: (s: number) => void
  setSelectedNozzle: (n: string) => void
  applyTopping: (t: Omit<AppliedTopping, "id">) => void
  removeTopping: (id: string) => void
  clearToppings: () => void

  // ─── Showcase / customer display ───
  /** Slice count (0 = whole cake, 6/8/12 = sliced) */
  sliceCount: number
  /** True once the cake has been served to a customer */
  servedToCustomer: boolean
  /** ISO timestamp when the cake was served */
  servedAt: number | null
  /** Customer star rating (0 = not yet rated, 1..5 stars) */
  customerRating: number
  /** Customer review text (randomly generated when served) */
  customerReview: string
  setSliceCount: (n: number) => void
  serveToCustomer: () => void
  rateByCustomer: (stars: number) => void
  resetShowcase: () => void

  // ─── Learning environment ───
  /** IDs of unlocked achievement badges */
  unlockedBadges: string[]
  /** IDs of completed lessons */
  completedLessons: string[]
  /** ID of the currently active lesson (or null for free-play) */
  activeLessonId: string | null
  /** Index of the current step within the active lesson */
  activeLessonStep: number
  /** Science notes that have been viewed (for "Kitchen Scientist" badge) */
  viewedScienceNotes: string[]
  /** Whether Chef Bear mascot speech bubble is visible */
  mascotVisible: boolean
  /** Current message from the mascot */
  mascotMessage: string
  /** Whether the lesson-complete celebration is showing */
  celebrationVisible: boolean
  unlockBadge: (id: string) => void
  hasBadge: (id: string) => boolean
  startLesson: (id: string) => void
  exitLesson: () => void
  advanceLessonStep: () => void
  completeLesson: (id: string) => void
  markScienceNoteViewed: (trigger: string) => void
  showMascot: (message: string) => void
  hideMascot: () => void
  showCelebration: () => void
  hideCelebration: () => void

  // ─── Toggles ───
  scienceOverlay: boolean
  voiceAssistant: boolean
  toggleScience: () => void
  toggleVoice: () => void

  // ─── Recipe export ───
  recipeName: string
  setRecipeName: (s: string) => void

  // ─── Action log ───
  log: ActionLogEntry[]
  pushLog: (text: string, kind?: ActionLogEntry["kind"]) => void
  clearLog: () => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 10)

function makeUtensils(): Utensil[] {
  return [
    { id: "bowl-mixing", name: "Mixing Bowl", emoji: "🥣", state: "clean" },
    { id: "whisk", name: "Whisk", emoji: "🥢", state: "clean" },
    { id: "spatula", name: "Spatula", emoji: "🥄", state: "clean" },
    { id: "measuring-cup", name: "Measuring Cup", emoji: "🧪", state: "clean" },
  ]
}

function describeDoneness(brown: number, rise: number): string {
  if (brown < 0.1 && rise < 0.1) return "Raw"
  if (brown < 0.3 && rise < 0.3) return "Setting"
  if (brown < 0.5) return "Pale"
  if (brown < 0.7) return "Golden"
  if (brown < 0.85) return "Well-Browned"
  if (brown < 0.95) return "Dark"
  return "Burnt"
}

/**
 * Generate a customer review based on the quality of the finished bake.
 * Factors in: browning level, rise, topping count.
 */
function generateCustomerReview(
  baking: BakingState,
  toppings: AppliedTopping[]
): { rating: number; text: string } {
  const brown = baking.brownLevel
  const rise = baking.riseLevel
  const toppingCount = toppings.length

  // Base score from bake quality
  let score = 0
  if (brown >= 0.5 && brown <= 0.75) score += 2 // golden = ideal
  else if (brown > 0.75 && brown <= 0.85) score += 1.5 // well-browned
  else if (brown < 0.3) score += 0.5 // pale / underbaked
  else if (brown > 0.85) score += 0.3 // approaching burnt

  if (rise >= 0.4 && rise <= 0.85) score += 1.5 // good rise
  else if (rise > 0.85) score += 1 // over-risen
  else if (rise < 0.2) score += 0.2 // flat

  // Bonus for decoration
  if (toppingCount >= 3 && toppingCount <= 10) score += 1
  else if (toppingCount > 0) score += 0.5
  if (toppingCount > 15) score -= 0.5 // over-decorated

  const rating = Math.max(1, Math.min(5, Math.round(score)))

  const reviews: Record<number, string[]> = {
    5: [
      "Absolutely divine! The crumb is perfect and the presentation is stunning.",
      "Best bake I've had all year. The flavors are beautifully balanced.",
      "Five stars — I'll be back for another tomorrow!",
      "Gorgeous golden crust, exquisite decoration. A true masterpiece.",
    ],
    4: [
      "Really lovely bake — just a touch more decoration would make it perfect.",
      "Great texture and flavor. Would happily order again.",
      "Solid bake with a beautiful rise. Highly recommended.",
      "Delightful! The toppings complement the crumb perfectly.",
    ],
    3: [
      "Decent bake, though the crust could be more even.",
      "Pleasant enough — a little under-decorated for my taste.",
      "Decent flavor, but the texture was a bit dense.",
      "Average. The bake is fine but lacks visual flair.",
    ],
    2: [
      "The crust is a bit dark for my liking.",
      "Sadly underbaked in the middle. The toppings saved it slightly.",
      "Disappointing texture — could use more rise.",
      "Below expectations. Needs work on the bake time.",
    ],
    1: [
      "Unfortunately the bake is burnt. Please check your oven temperature.",
      "Sadly inedible — the browning went too far.",
      "Flat and overdone. Would not recommend.",
      "The cake collapsed and the crust is too dark.",
    ],
  }

  const pool = reviews[rating] ?? reviews[3]
  const text = pool[Math.floor(Math.random() * pool.length)]
  return { rating, text }
}

// ─── Store ────────────────────────────────────────────────────────────────

export const useKitchen = create<KitchenState>((set, get) => ({
  activeStation: "bench",
  setActiveStation: (s) => {
    set({ activeStation: s })
    const labels: Record<StationId, string> = {
      bench: "Entered the Kitchen",
      pantry: "Opened the Pantry",
      mixing: "Moved to Mixing Station",
      mixer: "Engaged the Stand Mixer",
      oven: "Opened the Smart Oven",
      toppings: "Opened the Toppings Station",
      icecream: "Opened the Ice Cream Station",
      showcase: "Presented the bake at the Showcase",
      school: "Opened Bake School",
      sink: "Went to the Sink",
      recipe: "Opened Recipe Exporter",
    }
    get().pushLog(labels[s], "info")
  },

  bowl: [],
  addToBowl: (ingredientId, gramsOverride) => {
    const ing = getIngredient(ingredientId)
    if (!ing) return
    const grams = gramsOverride ?? ing.defaultGrams
    set((s) => {
      const existing = s.bowl.find((b) => b.ingredientId === ingredientId)
      let bowl: BowlIngredient[]
      if (existing) {
        bowl = s.bowl.map((b) =>
          b.ingredientId === ingredientId ? { ...b, grams: b.grams + grams } : b
        )
      } else {
        bowl = [...s.bowl, { ingredientId, grams }]
      }
      return {
        bowl,
        mixLevel: Math.max(0, get().mixLevel - 0.15), // adding ingredients un-mixes
      }
    })
    get().pushLog(`Added ${grams}g of ${ing.name} to the bowl`, "action")
  },
  removeFromBowl: (ingredientId) => {
    const ing = getIngredient(ingredientId)
    set((s) => ({ bowl: s.bowl.filter((b) => b.ingredientId !== ingredientId) }))
    if (ing) get().pushLog(`Removed ${ing.name} from the bowl`, "action")
  },
  clearBowl: () => {
    set({ bowl: [], mixLevel: 0 })
    get().pushLog("Emptied the bowl", "action")
  },

  mixLevel: 0,
  mixSpeed: 0,
  isMixing: false,
  startMixing: (speed) => {
    set({ isMixing: true, mixSpeed: speed })
    get().pushLog(`Started mixing at speed ${speed.toFixed(1)}`, "action")
  },
  stopMixing: () => {
    if (!get().isMixing) return
    set({ isMixing: false, mixSpeed: 0 })
    get().pushLog("Stopped mixing", "action")
  },
  incrementMix: (delta) => {
    set((s) => ({ mixLevel: Math.min(1, Math.max(0, s.mixLevel + delta)) }))
  },

  mixerSpeed: 0,
  isMixerOn: false,
  kneadLevel: 0,
  doughFormed: false,
  setMixerSpeed: (s) => set({ mixerSpeed: s }),
  setMixerOn: (on) => {
    set({ isMixerOn: on })
    get().pushLog(on ? "Turned stand mixer ON" : "Turned stand mixer OFF", "action")
  },
  incrementKnead: (delta) => {
    set((s) => {
      const knead = Math.min(1, Math.max(0, s.kneadLevel + delta))
      const formed = knead > 0.6
      return { kneadLevel: knead, doughFormed: formed }
    })
  },

  ovenTempC: 180,
  ovenMode: "bake",
  ovenOn: false,
  ovenLight: true,
  ovenTimerSec: 0,
  ovenTimerTotal: 0,
  baking: {
    status: "idle",
    progress: 0,
    riseLevel: 0,
    brownLevel: 0,
    donenessLabel: "Raw",
  },
  bakeShape: "round",
  setBakeShape: (shape) => {
    set({ bakeShape: shape })
    get().pushLog(`Selected shape: ${shape}`, "action")
  },
  setOvenTemp: (c) => {
    const clamped = Math.min(300, Math.max(50, Math.round(c)))
    set({ ovenTempC: clamped })
  },
  setOvenMode: (m) => {
    set({ ovenMode: m })
    get().pushLog(`Oven mode → ${m.toUpperCase()}`, "thermal")
  },
  setOvenOn: (on) => {
    set({ ovenOn: on, baking: on ? { ...get().baking, status: "preheating" } : get().baking })
    get().pushLog(on ? `Oven ON — heating to ${get().ovenTempC}°C` : "Oven OFF", "thermal")
  },
  toggleOvenLight: () => set((s) => ({ ovenLight: !s.ovenLight })),
  setOvenTimer: (sec) => {
    set({ ovenTimerSec: sec, ovenTimerTotal: sec })
    get().pushLog(`Timer set to ${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`, "thermal")
  },
  tickOven: (deltaSec) => {
    const s = get()
    if (!s.ovenOn) return
    // preheat completes when temp target reached (simulated instant for demo)
    if (s.baking.status === "preheating") {
      set({ baking: { ...s.baking, status: "ready" } })
      get().pushLog(`Oven reached ${s.ovenTempC}°C — ready to bake`, "thermal")
      return
    }
    if (s.baking.status !== "baking") return

    const timerLeft = Math.max(0, s.ovenTimerSec - deltaSec)
    const total = s.ovenTimerTotal || 1
    const progress = Math.min(1, 1 - timerLeft / total)

    // temperature factor — hotter oven = faster browning
    const tempFactor = Math.max(0.3, (s.ovenTempC - 100) / 180) // 0.3..1
    // dough weight factor — more mass = slower heat penetration
    const doughMass = s.bowl.reduce((acc, b) => acc + b.grams, 0)
    const massFactor = Math.max(0.4, 1 - doughMass / 2000)

    const riseRate = 0.012 * tempFactor * massFactor * deltaSec
    const brownRate = 0.004 * tempFactor * deltaSec

    let rise = Math.min(1, s.baking.riseLevel + riseRate)
    let brown = Math.min(1, s.baking.brownLevel + brownRate)

    // Once rise reaches near-max, it starts to set; browning continues
    if (progress > 0.7) rise = Math.min(rise, 1 - (progress - 0.7) * 0.3)

    const status: BakingState["status"] =
      timerLeft <= 0 ? "done" : progress > 0.95 || brown > 0.95 ? "done" : "baking"

    set({
      ovenTimerSec: timerLeft,
      baking: {
        status,
        progress,
        riseLevel: rise,
        brownLevel: brown,
        donenessLabel: describeDoneness(brown, rise),
      },
    })

    if (status === "done" && s.baking.status !== "done") {
      get().pushLog(`Bake complete — ${describeDoneness(brown, rise)} (${Math.round(brown * 100)}% brown)`, "thermal")
      // mark utensils dirty after a bake
      set((st) => ({
        utensils: st.utensils.map((u) => (u.state === "clean" ? { ...u, state: "dirty" } : u)),
      }))
    }
  },

  // ─── Ice Cream state ───
  iceCreamBowl: [],
  iceCreamFlavor: "vanilla",
  iceCreamChurnLevel: 0,
  iceCreamChurning: false,
  iceCreamFreezeLevel: 0,
  iceCreamStatus: "empty",
  iceCreamScoops: 0,
  addToIceCreamBowl: (ingredientId, gramsOverride) => {
    const ing = getIngredient(ingredientId)
    if (!ing) return
    const grams = gramsOverride ?? ing.defaultGrams
    set((s) => {
      const existing = s.iceCreamBowl.find((b) => b.ingredientId === ingredientId)
      let iceCreamBowl: BowlIngredient[]
      if (existing) {
        iceCreamBowl = s.iceCreamBowl.map((b) =>
          b.ingredientId === ingredientId ? { ...b, grams: b.grams + grams } : b
        )
      } else {
        iceCreamBowl = [...s.iceCreamBowl, { ingredientId, grams }]
      }
      const status = s.iceCreamStatus === "empty" ? "mixing" : s.iceCreamStatus
      return { iceCreamBowl, iceCreamStatus: status }
    })
    get().pushLog(`Added ${grams}g of ${ing.name} to ice cream bowl`, "action")
  },
  removeFromIceCreamBowl: (ingredientId) => {
    const ing = getIngredient(ingredientId)
    set((s) => ({ iceCreamBowl: s.iceCreamBowl.filter((b) => b.ingredientId !== ingredientId) }))
    if (ing) get().pushLog(`Removed ${ing.name} from ice cream bowl`, "action")
  },
  clearIceCreamBowl: () => {
    set({
      iceCreamBowl: [],
      iceCreamChurnLevel: 0,
      iceCreamChurning: false,
      iceCreamFreezeLevel: 0,
      iceCreamStatus: "empty",
      iceCreamScoops: 0,
    })
    get().pushLog("Cleared ice cream bowl", "action")
  },
  setIceCreamFlavor: (flavor) => {
    set({ iceCreamFlavor: flavor })
    get().pushLog(`Selected ice cream flavor: ${flavor}`, "action")
  },
  setIceCreamChurning: (on) => {
    set({ iceCreamChurning: on })
    if (on) {
      set((s) => ({ iceCreamStatus: s.iceCreamStatus === "mixing" ? "churning" : s.iceCreamStatus }))
    }
    get().pushLog(on ? "Started churning ice cream" : "Stopped churning", "action")
  },
  incrementIceCreamChurn: (delta) => {
    set((s) => {
      const churn = Math.min(1, Math.max(0, s.iceCreamChurnLevel + delta))
      const status = churn >= 1 ? "freezing" : s.iceCreamStatus === "churning" ? "churning" : s.iceCreamStatus
      return { iceCreamChurnLevel: churn, iceCreamStatus: status }
    })
  },
  startIceCreamFreeze: () => {
    set({ iceCreamStatus: "freezing", iceCreamChurning: false })
    get().pushLog("Started freezing ice cream", "action")
  },
  tickIceCreamFreeze: (deltaSec) => {
    const s = get()
    if (s.iceCreamStatus !== "freezing") return
    // Freeze completes in ~30 seconds of simulation time
    const freezeRate = 0.033 * deltaSec
    const newFreeze = Math.min(1, s.iceCreamFreezeLevel + freezeRate)
    const status = newFreeze >= 1 ? "ready" : "freezing"
    set({ iceCreamFreezeLevel: newFreeze, iceCreamStatus: status })
    if (status === "ready" && s.iceCreamStatus !== "ready") {
      get().pushLog("Ice cream is frozen and ready to serve!", "action")
    }
  },
  serveIceCreamScoop: () => {
    set((s) => ({ iceCreamScoops: s.iceCreamScoops + 1 }))
    get().pushLog("Served a scoop of ice cream", "action")
  },
  resetIceCream: () => {
    set({
      iceCreamBowl: [],
      iceCreamChurnLevel: 0,
      iceCreamChurning: false,
      iceCreamFreezeLevel: 0,
      iceCreamStatus: "empty",
      iceCreamScoops: 0,
      iceCreamFlavor: "vanilla",
    })
    get().pushLog("Reset ice cream station", "action")
  },

  utensils: makeUtensils(),
  waterOn: false,
  soapApplied: false,
  scrubLevel: 0,
  toggleWater: () => {
    set((s) => ({ waterOn: !s.waterOn }))
    get().pushLog(get().waterOn ? "Water running" : "Water off", "action")
  },
  applySoap: () => {
    set({ soapApplied: true, scrubLevel: 0 })
    get().pushLog("Applied soap to sponge", "action")
  },
  scrub: (delta) => {
    const s = get()
    if (!s.waterOn || !s.soapApplied) return
    const newScrub = Math.min(1, s.scrubLevel + delta)
    set({ scrubLevel: newScrub })
    if (newScrub >= 1) {
      // clean one utensil
      const idx = s.utensils.findIndex((u) => u.state !== "clean")
      if (idx >= 0) {
        const u = s.utensils[idx]
        const newUtensils = [...s.utensils]
        newUtensils[idx] = { ...u, state: "clean" }
        set({ utensils: newUtensils, scrubLevel: 0, soapApplied: false })
        get().pushLog(`Cleaned the ${u.name}`, "action")
      } else {
        set({ scrubLevel: 0, soapApplied: false })
      }
    }
  },
  resetUtensils: () => set({ utensils: makeUtensils() }),

  // ─── Toppings state ───
  appliedToppings: [],
  selectedToppingId: null,
  toppingBrushSize: 0.7,
  selectedNozzle: "star",
  setSelectedTopping: (id) => {
    set({ selectedToppingId: id })
    if (id) {
      const top = TOPPINGS_LOOKUP[id]
      if (top) get().pushLog(`Selected topping: ${top.name}`, "action")
    }
  },
  setToppingBrushSize: (s) => set({ toppingBrushSize: Math.min(1.5, Math.max(0.3, s)) }),
  setSelectedNozzle: (n) => set({ selectedNozzle: n }),
  applyTopping: (t) => {
    const id = uid()
    set((s) => ({ appliedToppings: [...s.appliedToppings, { ...t, id }] }))
    const top = TOPPINGS_LOOKUP[t.toppingId]
    if (top) {
      const grams = Math.round(top.defaultGrams * t.amount * get().toppingBrushSize)
      get().pushLog(`Applied ${top.name} (${grams}g)`, "action")
    }
  },
  removeTopping: (id) => {
    set((s) => ({ appliedToppings: s.appliedToppings.filter((t) => t.id !== id) }))
  },
  clearToppings: () => {
    if (get().appliedToppings.length === 0) return
    set({ appliedToppings: [] })
    get().pushLog("Cleared all toppings", "action")
  },

  // ─── Showcase state ───
  sliceCount: 0,
  servedToCustomer: false,
  servedAt: null,
  customerRating: 0,
  customerReview: "",
  setSliceCount: (n) => {
    const valid = [0, 4, 6, 8, 10, 12].includes(n) ? n : 0
    set({ sliceCount: valid })
    if (valid > 0) {
      get().pushLog(`Cut into ${valid} slices`, "action")
    }
  },
  serveToCustomer: () => {
    if (get().servedToCustomer) return
    const now = Date.now()
    const review = generateCustomerReview(get().baking, get().appliedToppings)
    set({
      servedToCustomer: true,
      servedAt: now,
      customerReview: review.text,
      customerRating: review.rating,
    })
    get().pushLog(`Served to customer — rated ${review.rating}/5 stars`, "action")
  },
  rateByCustomer: (stars) => {
    const clamped = Math.min(5, Math.max(1, Math.round(stars)))
    set({ customerRating: clamped })
    get().pushLog(`Customer updated rating: ${clamped}/5`, "action")
  },
  resetShowcase: () => {
    set({
      sliceCount: 0,
      servedToCustomer: false,
      servedAt: null,
      customerRating: 0,
      customerReview: "",
    })
    get().pushLog("Showcase reset — ready for next customer", "action")
  },

  // ─── Learning environment state ───
  unlockedBadges: [],
  completedLessons: [],
  activeLessonId: null,
  activeLessonStep: 0,
  viewedScienceNotes: [],
  mascotVisible: false,
  mascotMessage: "",
  celebrationVisible: false,
  unlockBadge: (id) => {
    set((s) => {
      if (s.unlockedBadges.includes(id)) return s // already unlocked
      const badge = BADGES_LOOKUP[id]
      if (badge) {
        // defer mascot message via setTimeout to avoid setState-in-render
        setTimeout(() => {
          get().showMascot(`New badge unlocked: ${badge.emoji} ${badge.name}! ${badge.description}`)
        }, 0)
        get().pushLog(`🏆 Badge unlocked: ${badge.name}`, "action")
      }
      return { unlockedBadges: [...s.unlockedBadges, id] }
    })
  },
  hasBadge: (id) => get().unlockedBadges.includes(id),
  startLesson: (id) => {
    const lesson = LESSONS_LOOKUP[id]
    if (!lesson) return
    set({
      activeLessonId: id,
      activeLessonStep: 0,
      mascotVisible: true,
      mascotMessage: `${lesson.emoji} ${lesson.title}! ${lesson.description}`,
    })
    get().pushLog(`Started lesson: ${lesson.title}`, "info")
    // Navigate to the first step's station
    const firstStep = lesson.steps[0]
    if (firstStep) {
      setTimeout(() => get().setActiveStation(firstStep.station), 200)
    }
  },
  exitLesson: () => {
    set({ activeLessonId: null, activeLessonStep: 0 })
    get().pushLog("Exited lesson (free play mode)", "info")
  },
  advanceLessonStep: () => {
    const s = get()
    if (!s.activeLessonId) return
    const lesson = LESSONS_LOOKUP[s.activeLessonId]
    if (!lesson) return
    const nextStep = s.activeLessonStep + 1
    if (nextStep >= lesson.steps.length) {
      // Lesson complete
      get().completeLesson(lesson.id)
      return
    }
    set({ activeLessonStep: nextStep })
    const step = lesson.steps[nextStep]
    if (step) {
      get().pushLog(`Lesson step ${nextStep + 1}/${lesson.steps.length}: ${step.instruction}`, "info")
      // Show fun fact if available
      if (step.funFact) {
        setTimeout(() => {
          get().showMascot(`🌟 Fun fact: ${step.funFact}`)
        }, 600)
      }
      // Navigate to next step's station
      setTimeout(() => get().setActiveStation(step.station), 300)
    }
  },
  completeLesson: (id) => {
    const lesson = LESSONS_LOOKUP[id]
    if (!lesson) return
    set((s) => ({
      completedLessons: s.completedLessons.includes(id)
        ? s.completedLessons
        : [...s.completedLessons, id],
      activeLessonId: null,
      activeLessonStep: 0,
      celebrationVisible: true,
    }))
    // Unlock lesson badge
    setTimeout(() => get().unlockBadge(lesson.badgeId), 100)
    // Milestone badges
    const completedCount = get().completedLessons.length
    if (completedCount >= 5) {
      setTimeout(() => get().unlockBadge("lesson-5"), 300)
    }
    if (completedCount >= 10) {
      setTimeout(() => get().unlockBadge("lesson-10"), 400)
    }
    get().pushLog(`🎓 Lesson complete: ${lesson.title}!`, "action")
    setTimeout(() => {
      get().showMascot(`🎓 You finished ${lesson.title}! You're getting better at this!`)
    }, 500)
  },
  markScienceNoteViewed: (trigger) => {
    set((s) => {
      if (s.viewedScienceNotes.includes(trigger)) return s
      const viewed = [...s.viewedScienceNotes, trigger]
      // Auto-unlock Kitchen Scientist badge after 5 unique views
      if (viewed.length >= 5 && !s.unlockedBadges.includes("scientist")) {
        setTimeout(() => get().unlockBadge("scientist"), 100)
      }
      return { viewedScienceNotes: viewed }
    })
  },
  showMascot: (message) => {
    set({ mascotVisible: true, mascotMessage: message })
    // Auto-hide after 8 seconds
    setTimeout(() => {
      if (get().mascotMessage === message) get().hideMascot()
    }, 8000)
  },
  hideMascot: () => set({ mascotVisible: false }),
  showCelebration: () => set({ celebrationVisible: true }),
  hideCelebration: () => set({ celebrationVisible: false }),

  scienceOverlay: true,
  voiceAssistant: false,
  toggleScience: () => set((s) => ({ scienceOverlay: !s.scienceOverlay })),
  toggleVoice: () => set((s) => ({ voiceAssistant: !s.voiceAssistant })),

  recipeName: "My Custom Bake",
  setRecipeName: (s) => set({ recipeName: s }),

  log: [
    {
      id: uid(),
      time: Date.now(),
      text: "Rendering pipeline online. Awaiting first ingredient selection.",
      kind: "info",
    },
  ],
  pushLog: (text, kind = "info") => {
    set((s) => ({
      log: [...s.log.slice(-80), { id: uid(), time: Date.now(), text, kind }],
    }))
  },
  clearLog: () => set({ log: [] }),
}))

// ─── Selectors / derived helpers ──────────────────────────────────────────

export function totalBowlMass(bowl: BowlIngredient[]): number {
  return bowl.reduce((a, b) => a + b.grams, 0)
}

export function bowlSummary(bowl: BowlIngredient[]): { ingredient: Ingredient; grams: number }[] {
  return bowl
    .map((b) => {
      const ingredient = getIngredient(b.ingredientId)
      return ingredient ? { ingredient, grams: b.grams } : null
    })
    .filter(Boolean) as { ingredient: Ingredient; grams: number }[]
}

// Sorted for visualization: heavier / denser first (bottom of bowl)
export function bowlLayers(bowl: BowlIngredient[]): { ingredient: Ingredient; grams: number }[] {
  return bowlSummary(bowl).sort((a, b) => {
    // liquids at bottom, then viscous, then powder, then solid
    const order: Record<string, number> = { liquid: 0, viscous: 1, emulsion: 2, powder: 3, solid: 4 }
    const sa = order[a.ingredient.state] ?? 5
    const sb = order[b.ingredient.state] ?? 5
    if (sa !== sb) return sa - sb
    return b.ingredient.density - a.ingredient.density
  })
}

// ─── Topping helpers ──────────────────────────────────────────────────────

/**
 * Aggregate applied toppings into a summary list with total grams.
 * Used by the Recipe Exporter to render the toppings section.
 */
export function toppingsSummary(
  applied: AppliedTopping[],
  brushSize: number
): { topping: (typeof TOPPINGS)[number]; grams: number; count: number }[] {
  const byId = new Map<string, { count: number; totalAmount: number }>()
  for (const a of applied) {
    const cur = byId.get(a.toppingId) ?? { count: 0, totalAmount: 0 }
    cur.count += 1
    cur.totalAmount += a.amount * brushSize
    byId.set(a.toppingId, cur)
  }
  const result: { topping: (typeof TOPPINGS)[number]; grams: number; count: number }[] = []
  for (const [id, agg] of byId) {
    const top = TOPPINGS_LOOKUP[id]
    if (!top) continue
    const grams = Math.round(top.defaultGrams * agg.totalAmount)
    result.push({ topping: top, grams, count: agg.count })
  }
  return result.sort((a, b) => b.grams - a.grams)
}

export function totalToppingGrams(
  applied: AppliedTopping[],
  brushSize: number
): number {
  return toppingsSummary(applied, brushSize).reduce((a, t) => a + t.grams, 0)
}
