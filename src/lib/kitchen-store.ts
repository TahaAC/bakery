"use client"

import { create } from "zustand"
import { getIngredient, type Ingredient } from "./ingredients"

// ─── Types ────────────────────────────────────────────────────────────────

export type StationId = "pantry" | "mixing" | "mixer" | "oven" | "sink" | "recipe"

export interface BowlIngredient {
  ingredientId: string
  grams: number
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
  setOvenTemp: (c: number) => void
  setOvenMode: (m: OvenMode) => void
  setOvenOn: (on: boolean) => void
  toggleOvenLight: () => void
  setOvenTimer: (sec: number) => void
  tickOven: (deltaSec: number) => void

  // ─── Sink / clean-up ───
  utensils: Utensil[]
  waterOn: boolean
  soapApplied: boolean
  scrubLevel: number // 0..1 per active wash
  toggleWater: () => void
  applySoap: () => void
  scrub: (delta: number) => void
  resetUtensils: () => void

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

// ─── Store ────────────────────────────────────────────────────────────────

export const useKitchen = create<KitchenState>((set, get) => ({
  activeStation: "pantry",
  setActiveStation: (s) => {
    set({ activeStation: s })
    const labels: Record<StationId, string> = {
      pantry: "Opened the Pantry",
      mixing: "Moved to Mixing Station",
      mixer: "Engaged the Stand Mixer",
      oven: "Opened the Smart Oven",
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
