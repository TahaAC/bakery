"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { FileText, Printer, Save, RotateCcw, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useKitchen, bowlLayers, totalBowlMass, toppingsSummary } from "@/lib/kitchen-store"
import { CATEGORY_META } from "@/lib/ingredients"
import { useMounted, formatDateShort } from "@/hooks/use-mounted"

export function RecipeExporter() {
  const bowl = useKitchen((s) => s.bowl)
  const recipeName = useKitchen((s) => s.recipeName)
  const setRecipeName = useKitchen((s) => s.setRecipeName)
  const mixLevel = useKitchen((s) => s.mixLevel)
  const kneadLevel = useKitchen((s) => s.kneadLevel)
  const ovenTempC = useKitchen((s) => s.ovenTempC)
  const ovenMode = useKitchen((s) => s.ovenMode)
  const ovenTimerTotal = useKitchen((s) => s.ovenTimerTotal)
  const baking = useKitchen((s) => s.baking)
  const appliedToppings = useKitchen((s) => s.appliedToppings)
  const toppingBrushSize = useKitchen((s) => s.toppingBrushSize)
  const pushLog = useKitchen((s) => s.pushLog)

  const layers = bowlLayers(bowl)
  const totalMass = totalBowlMass(bowl)
  const toppingList = toppingsSummary(appliedToppings, toppingBrushSize)
  const toppingTotalGrams = toppingList.reduce((a, t) => a + t.grams, 0)

  // Hydration-safe date: defer rendering until after mount so server and
  // client agree on the value (avoids "Generated Oct 24" vs "Oct 25" near
  // midnight, and locale-format mismatches).
  const mounted = useMounted()
  const generatedDateLabel = mounted ? formatDateShort(Date.now()) : ""

  // Hydration analysis
  const analysis = useMemo(() => {
    const dryMass = layers
      .filter((l) => l.ingredient.state === "powder" || l.ingredient.state === "solid")
      .reduce((a, l) => a + l.grams, 0)
    const wetMass = layers
      .filter((l) => ["liquid", "viscous", "emulsion"].includes(l.ingredient.state))
      .reduce((a, l) => a + l.grams, 0)
    const hydration = dryMass > 0 ? (wetMass / dryMass) * 100 : 0
    const fatMass = layers
      .filter((l) => l.ingredient.category === "fat")
      .reduce((a, l) => a + l.grams, 0)
    const sugarMass = layers
      .filter((l) => l.ingredient.id.includes("sugar"))
      .reduce((a, l) => a + l.grams, 0)
    const leaveningMass = layers
      .filter((l) => l.ingredient.category === "leavening")
      .reduce((a, l) => a + l.grams, 0)

    let verdict = ""
    let verdictColor = ""
    if (totalMass === 0) {
      verdict = "No ingredients yet — add some in the Pantry first."
      verdictColor = "text-muted-foreground"
    } else if (hydration < 35 && dryMass > 0) {
      verdict = "Very low hydration — dough will be tight and crumbly. Expect dense crumb."
      verdictColor = "text-amber-700"
    } else if (hydration > 90) {
      verdict = "Very high hydration — slack batter, may not hold shape. Good for ciabatta or pancake."
      verdictColor = "text-amber-700"
    } else if (hydration >= 55 && hydration <= 75) {
      verdict = "Bread-like hydration. Strong gluten development likely."
      verdictColor = "text-green-700"
    } else if (hydration >= 75 && hydration <= 110) {
      verdict = "Cake/quick-bread hydration. Tender, moist crumb expected."
      verdictColor = "text-green-700"
    } else {
      verdict = "Cookie / scone range — low moisture, tender texture."
      verdictColor = "text-amber-700"
    }

    return { dryMass, wetMass, hydration, fatMass, sugarMass, leaveningMass, verdict, verdictColor }
  }, [layers, totalMass])

  const handlePrint = () => {
    pushLog("Sent recipe card to printer (browser print dialog)", "action")
    window.print()
  }

  const handleSave = () => {
    const recipeText = formatRecipeText(layers, recipeName, analysis, ovenTempC, ovenMode, ovenTimerTotal, toppingList)
    const blob = new Blob([recipeText], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${recipeName.replace(/\s+/g, "_").toLowerCase()}.txt`
    a.click()
    URL.revokeObjectURL(url)
    pushLog(`Saved recipe "${recipeName}" as .txt`, "action")
  }

  const tempF = Math.round(ovenTempC * 9 / 5 + 32)
  const bakeTimeMin = Math.round(ovenTimerTotal / 60)

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-4 h-full">
      {/* Left: recipe card preview */}
      <div className="flex flex-col gap-3 min-h-0">
        <div
          id="recipe-card"
          className="relative flex-1 overflow-y-auto kitchen-scrollbar rounded-xl border-2 border-border bg-[#fffaf0] p-6 shadow-lg"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent 0, transparent 23px, rgba(184, 96, 43, 0.05) 24px)",
          }}
        >
          {/* Card header */}
          <div className="flex items-start justify-between gap-4 pb-3 border-b-2 border-dashed border-border">
            <div className="flex-1">
              <div className="text-[10px] uppercase tracking-widest text-primary font-semibold">
                Master Baker VR · Recipe Card
              </div>
              <Input
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                className="text-2xl font-bold border-none px-0 h-auto bg-transparent focus-visible:ring-0 mt-1"
                placeholder="Untitled Bake"
              />
              <div className="text-xs text-muted-foreground mt-1">
                {mounted ? `Generated ${generatedDateLabel}` : "\u00A0"}
              </div>
            </div>
            <div className="w-16 h-16 rounded-full metal-copper flex items-center justify-center text-3xl shrink-0">
              🥖
            </div>
          </div>

          {/* Yield */}
          <div className="grid grid-cols-3 gap-3 my-4 text-center">
            <div className="rounded-md bg-muted/30 p-2">
              <div className="text-[10px] uppercase text-muted-foreground">Total mass</div>
              <div className="font-mono text-lg">{totalMass}g</div>
            </div>
            <div className="rounded-md bg-muted/30 p-2">
              <div className="text-[10px] uppercase text-muted-foreground">Hydration</div>
              <div className="font-mono text-lg">{analysis.hydration.toFixed(0)}%</div>
            </div>
            <div className="rounded-md bg-muted/30 p-2">
              <div className="text-[10px] uppercase text-muted-foreground">Ingredients</div>
              <div className="font-mono text-lg">{layers.length}</div>
            </div>
          </div>

          {/* Ingredients list with both grams and ounces */}
          <div className="mb-4">
            <h3 className="text-sm font-bold mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-primary" /> Ingredients
            </h3>
            {layers.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                No ingredients in the bowl yet.
              </p>
            ) : (
              <ul className="space-y-1">
                {layers.map((l) => (
                  <li
                    key={l.ingredient.id}
                    className="flex items-center justify-between py-1 border-b border-dotted border-border/60 text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: l.ingredient.color }}
                      />
                      {l.ingredient.emoji} {l.ingredient.name}
                    </span>
                    <span className="font-mono text-xs">
                      {l.grams}g · {(l.grams * 0.035274).toFixed(2)}oz
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Method */}
          <div className="mb-4">
            <h3 className="text-sm font-bold mb-2">Method</h3>
            <ol className="space-y-1.5 text-sm list-decimal list-inside">
              <li>Gather and measure all ingredients listed above.</li>
              <li>
                Combine in mixing bowl. Whisk to {mixLevel < 0.4 ? "streaky texture" : mixLevel < 0.8 ? "smooth batter" : "fully homogenized"} ({Math.round(mixLevel * 100)}% combined).
              </li>
              {kneadLevel > 0 && (
                <li>
                  Knead dough to {Math.round(kneadLevel * 100)}% gluten development ({kneadLevel < 0.4 ? "shaggy" : kneadLevel < 0.7 ? "elastic" : "silky and windowpane-ready"}).
                </li>
              )}
              <li>
                Preheat oven to <span className="font-mono">{ovenTempC}°C / {tempF}°F</span> on <span className="uppercase font-mono">{ovenMode}</span> mode.
              </li>
              {bakeTimeMin > 0 && (
                <li>Bake for {bakeTimeMin} minutes, until {baking.donenessLabel.toLowerCase()}.</li>
              )}
              {toppingList.length > 0 && (
                <li>
                  Decorate: {toppingList
                    .map((t) => `${t.grams}g ${t.topping.name.toLowerCase()}`)
                    .join(", ")}
                  {toppingList.some((t) => t.topping.requiresBaked === false)
                    ? " (apply pre-bake items before baking)"
                    : " (apply after cooling)"}.
                </li>
              )}
              <li>Cool on a wire rack before serving.</li>
            </ol>
          </div>

          {/* Toppings list */}
          {toppingList.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-bold mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" /> Toppings & Decoration
              </h3>
              <ul className="space-y-1">
                {toppingList.map((t) => (
                  <li
                    key={t.topping.id}
                    className="flex items-center justify-between py-1 border-b border-dotted border-border/60 text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: t.topping.color }}
                      />
                      {t.topping.emoji} {t.topping.name}
                      <span className="text-[10px] text-muted-foreground">
                        ({t.count} application{t.count === 1 ? "" : "s"})
                      </span>
                    </span>
                    <span className="font-mono text-xs">
                      {t.grams}g · {(t.grams * 0.035274).toFixed(2)}oz
                    </span>
                  </li>
                ))}
                <li className="flex justify-between pt-1 text-xs font-mono text-muted-foreground">
                  <span>Topping total</span>
                  <span>{toppingTotalGrams}g</span>
                </li>
              </ul>
            </div>
          )}

          {/* Pro tips */}
          <div className="rounded-md bg-accent/10 border border-accent/30 p-3">
            <div className="text-xs font-semibold flex items-center gap-1.5 text-primary">
              <Sparkles className="w-3 h-3" /> Baker's Note
            </div>
            <p className={`text-xs mt-1 ${analysis.verdictColor}`}>{analysis.verdict}</p>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-dashed border-border text-[10px] text-muted-foreground flex justify-between">
            <span>Master Baker VR · Virtual-to-Real Recipe Exporter</span>
            <span>Recipe ID: MBVR-{Date.now().toString(36).slice(-6).toUpperCase()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 print:hidden">
          <Button onClick={handlePrint} disabled={layers.length === 0}>
            <Printer className="w-4 h-4 mr-1.5" /> Print card
          </Button>
          <Button onClick={handleSave} variant="outline" disabled={layers.length === 0}>
            <Save className="w-4 h-4 mr-1.5" /> Save as .txt
          </Button>
        </div>
      </div>

      {/* Right: analysis panel */}
      <div className="border border-border rounded-lg bg-card p-4 flex flex-col gap-3 min-h-0 overflow-y-auto kitchen-scrollbar print:hidden">
        <div>
          <h3 className="text-sm font-semibold mb-1">Recipe Analysis</h3>
          <p className="text-xs text-muted-foreground">
            Composition computed live from your bowl. Use it to predict texture before baking.
          </p>
        </div>

        <div className="space-y-2">
          <AnalysisRow label="Dry mass" value={`${analysis.dryMass}g`} pct={totalMass ? (analysis.dryMass / totalMass) * 100 : 0} color="#c9a779" />
          <AnalysisRow label="Wet mass" value={`${analysis.wetMass}g`} pct={totalMass ? (analysis.wetMass / totalMass) * 100 : 0} color="#7FBED6" />
          <AnalysisRow label="Fat" value={`${analysis.fatMass}g`} pct={totalMass ? (analysis.fatMass / totalMass) * 100 : 0} color="#e5c04e" />
          <AnalysisRow label="Sugar" value={`${analysis.sugarMass}g`} pct={totalMass ? (analysis.sugarMass / totalMass) * 100 : 0} color="#d4904f" />
          <AnalysisRow label="Leavening" value={`${analysis.leaveningMass}g`} pct={totalMass ? (analysis.leaveningMass / totalMass) * 100 : 0} color="#d9a3d9" />
        </div>

        <div className="rounded-md bg-muted/40 p-3">
          <div className="text-[10px] uppercase text-muted-foreground">Hydration ratio</div>
          <div className="text-2xl font-mono">{analysis.hydration.toFixed(1)}%</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            wet mass ÷ dry mass × 100. Bread dough: 60–80%. Cake batter: 80–110%.
          </div>
        </div>

        <div className="rounded-md border border-border p-3">
          <div className="text-xs font-semibold mb-1">Verdict</div>
          <p className={`text-xs leading-relaxed ${analysis.verdictColor}`}>
            {analysis.verdict}
          </p>
        </div>

        {/* Category breakdown */}
        {layers.length > 0 && (
          <div>
            <div className="text-xs font-semibold mb-1.5">By category</div>
            <div className="flex flex-wrap gap-1">
              {Object.entries(
                layers.reduce((acc, l) => {
                  acc[l.ingredient.category] = (acc[l.ingredient.category] ?? 0) + l.grams
                  return acc
                }, {} as Record<string, number>)
              ).map(([cat, g]) => {
                const meta = CATEGORY_META[cat as keyof typeof CATEGORY_META]
                return (
                  <Badge key={cat} variant="secondary" className="text-[10px]">
                    {meta.icon} {meta.label}: {g}g
                  </Badge>
                )
              })}
            </div>
          </div>
        )}

        <div className="mt-auto pt-3 border-t border-border text-[11px] text-muted-foreground">
          <p>
            Tip: Save successful ratios — repeat the exact grams in your physical kitchen to reproduce the bake.
          </p>
        </div>
      </div>
    </div>
  )
}

function AnalysisRow({ label, value, pct, color }: { label: string; value: string; pct: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono">{value} · {pct.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full"
          style={{ background: color }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </div>
  )
}

function formatRecipeText(
  layers: { ingredient: { id: string; name: string; emoji: string }; grams: number }[],
  name: string,
  analysis: { dryMass: number; wetMass: number; hydration: number; fatMass: number; sugarMass: number; leaveningMass: number; verdict: string },
  ovenTempC: number,
  ovenMode: string,
  ovenTimerTotal: number,
  toppings: { topping: { id: string; name: string; emoji: string }; grams: number; count: number }[]
): string {
  const tempF = Math.round(ovenTempC * 9 / 5 + 32)
  const bakeMin = Math.round(ovenTimerTotal / 60)
  const lines: string[] = []
  lines.push(`═══════════════════════════════════════`)
  lines.push(`  MASTER BAKER VR — RECIPE CARD`)
  lines.push(`═══════════════════════════════════════`)
  lines.push(``)
  lines.push(`Name: ${name}`)
  lines.push(`Generated: ${new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}`)
  lines.push(``)
  lines.push(`─── INGREDIENTS ───`)
  layers.forEach((l) => {
    lines.push(`  ${l.grams}g  (${(l.grams * 0.035274).toFixed(2)}oz)  ${l.ingredient.name}`)
  })
  lines.push(``)
  lines.push(`─── METHOD ───`)
  lines.push(`1. Measure all ingredients by weight (grams preferred).`)
  lines.push(`2. Combine in a mixing bowl and whisk until uniform.`)
  if (analysis.hydration < 75) lines.push(`3. Knead until dough passes the windowpane test.`)
  lines.push(`${analysis.hydration < 75 ? "4" : "3"}. Preheat oven to ${ovenTempC}°C / ${tempF}°F (${ovenMode.toUpperCase()} mode).`)
  if (bakeMin > 0) lines.push(`${analysis.hydration < 75 ? "5" : "4"}. Bake for ${bakeMin} minutes, until golden.`)
  lines.push(`${analysis.hydration < 75 ? "6" : "5"}. Cool on a wire rack before slicing.`)
  if (toppings.length > 0) {
    lines.push(`${analysis.hydration < 75 ? "7" : "6"}. Decorate as listed below.`)
  }
  if (toppings.length > 0) {
    lines.push(``)
    lines.push(`─── TOPPINGS & DECORATION ───`)
    toppings.forEach((t) => {
      lines.push(`  ${t.grams}g  (${(t.grams * 0.035274).toFixed(2)}oz)  ${t.topping.name}  (${t.count} application${t.count === 1 ? "" : "s"})`)
    })
    lines.push(`  Total toppings: ${toppings.reduce((a, t) => a + t.grams, 0)}g`)
  }
  lines.push(``)
  lines.push(`─── ANALYSIS ───`)
  lines.push(`Total mass:     ${analysis.dryMass + analysis.wetMass}g`)
  lines.push(`Hydration:      ${analysis.hydration.toFixed(1)}%`)
  lines.push(`Fat:            ${analysis.fatMass}g`)
  lines.push(`Sugar:          ${analysis.sugarMass}g`)
  lines.push(`Leavening:      ${analysis.leaveningMass}g`)
  lines.push(`Verdict:        ${analysis.verdict}`)
  lines.push(``)
  lines.push(`─── TIPS ───`)
  lines.push(`· Scale all ingredients proportionally for larger/smaller batches.`)
  lines.push(`· Oven temperatures vary — calibrate with an oven thermometer.`)
  lines.push(`· Rest dough 10 min if it resists shaping.`)
  lines.push(``)
  lines.push(`Bake with care. — Master Baker VR`)
  return lines.join("\n")
}
