"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Plus, Info } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { INGREDIENTS, CATEGORY_META, type IngredientCategory } from "@/lib/ingredients"
import { useKitchen } from "@/lib/kitchen-store"
import { findScienceNote } from "@/lib/science"

const CATEGORIES: IngredientCategory[] = ["dry", "wet", "fat", "leavening", "egg", "dairy", "flavor"]

export function PantryStation() {
  const addToBowl = useKitchen((s) => s.addToBowl)
  const [query, setQuery] = useState("")
  const [activeCat, setActiveCat] = useState<IngredientCategory | "all">("all")
  const [selected, setSelected] = useState<string | null>(null)
  const [grams, setGrams] = useState<number>(100)

  const filtered = useMemo(() => {
    return INGREDIENTS.filter((ing) => {
      if (activeCat !== "all" && ing.category !== activeCat) return false
      if (query && !ing.name.toLowerCase().includes(query.toLowerCase())) return false
      return true
    })
  }, [query, activeCat])

  const selectedIngredient = selected ? INGREDIENTS.find((i) => i.id === selected) : null

  const handleAdd = (id: string) => {
    const ing = INGREDIENTS.find((i) => i.id === id)
    if (!ing) return
    setSelected(id)
    setGrams(ing.defaultGrams)
  }

  const confirmAdd = () => {
    if (!selectedIngredient) return
    addToBowl(selectedIngredient.id, grams)
    setSelected(null)
  }

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-4 h-full">
      {/* Left: pantry browser */}
      <div className="flex flex-col gap-3 min-h-0">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ingredients..."
              className="pl-8"
            />
          </div>
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveCat("all")}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition ${
              activeCat === "all"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border hover:border-primary/50"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((c) => {
            const meta = CATEGORY_META[c]
            const active = activeCat === c
            return (
              <button
                key={c}
                onClick={() => setActiveCat(c)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition ${
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border hover:border-primary/50"
                }`}
              >
                <span className="mr-1">{meta.icon}</span>
                {meta.label}
              </button>
            )
          })}
        </div>

        {/* Ingredient grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 overflow-y-auto kitchen-scrollbar pr-1 flex-1 min-h-0 content-start">
          {filtered.map((ing) => {
            const isSelected = selected === ing.id
            return (
              <motion.button
                key={ing.id}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAdd(ing.id)}
                className={`station-card relative flex flex-col items-center text-center gap-1 p-3 rounded-lg border bg-card ${
                  isSelected ? "border-primary ring-2 ring-primary/30" : "border-border"
                }`}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl border border-black/10"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${ing.highlight ?? ing.color}, ${ing.color})`,
                  }}
                >
                  {ing.emoji}
                </div>
                <div className="text-xs font-medium leading-tight">{ing.name}</div>
                <div className="text-[10px] text-muted-foreground font-mono">
                  {ing.defaultGrams}g · {ing.state}
                </div>
                <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Plus className="w-3 h-3" />
                </div>
              </motion.button>
            )
          })}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-8 text-sm text-muted-foreground">
              No ingredients match your search.
            </div>
          )}
        </div>
      </div>

      {/* Right: detail / quantity panel */}
      <div className="border border-border rounded-lg bg-card p-4 flex flex-col min-h-0">
        <AnimatePresence mode="wait">
          {selectedIngredient ? (
            <motion.div
              key={selectedIngredient.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="flex flex-col gap-3 h-full"
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-3xl border border-black/10 shrink-0"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${selectedIngredient.highlight ?? selectedIngredient.color}, ${selectedIngredient.color})`,
                  }}
                >
                  {selectedIngredient.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold leading-tight">{selectedIngredient.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                    {selectedIngredient.category} · {selectedIngredient.state}
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {selectedIngredient.notes}
              </p>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">Quantity</span>
                  <span className="font-mono text-primary">{grams}g</span>
                </div>
                <Slider
                  value={[grams]}
                  onValueChange={(v) => setGrams(v[0])}
                  min={1}
                  max={500}
                  step={1}
                />
                <div className="flex gap-1">
                  {[5, 15, 50, 100, 200].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setGrams(preset)}
                      className="flex-1 text-[10px] py-1 rounded border border-border hover:border-primary/50 hover:bg-accent/40"
                    >
                      {preset}g
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-md bg-muted/40 px-2 py-1.5">
                  <div className="text-muted-foreground">Density</div>
                  <div className="font-mono">{selectedIngredient.density.toFixed(2)} g/mL</div>
                </div>
                <div className="rounded-md bg-muted/40 px-2 py-1.5">
                  <div className="text-muted-foreground">Behavior</div>
                  <div className="font-mono capitalize">{selectedIngredient.behavior}</div>
                </div>
              </div>

              {/* Science hint */}
              {findScienceNote(selectedIngredient.id) && (
                <div className="rounded-md border border-accent/40 bg-accent/10 p-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <Info className="w-3 h-3" /> Science AR
                  </div>
                  <div className="text-xs mt-1 font-medium">
                    {findScienceNote(selectedIngredient.id)?.title}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                    {findScienceNote(selectedIngredient.id)?.body}
                  </p>
                </div>
              )}

              <div className="mt-auto flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelected(null)} className="flex-1">
                  Cancel
                </Button>
                <Button size="sm" onClick={confirmAdd} className="flex-1">
                  Add to Bowl
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center text-center gap-3 text-muted-foreground"
            >
              <div className="text-5xl opacity-40">🥄</div>
              <p className="text-sm">
                Tap any ingredient on the left to select a quantity, then add it to your bowl.
              </p>
              <p className="text-xs text-muted-foreground/80">
                The system will never auto-pick ratios for you — you decide every gram.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
