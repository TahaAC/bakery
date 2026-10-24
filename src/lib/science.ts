// Science AR overlay content — short, accurate, bite-sized explanations.

export interface ScienceNote {
  trigger: string
  title: string
  body: string
  /** Optional reaction/equation shown in monospace */
  formula?: string
}

export const SCIENCE_NOTES: ScienceNote[] = [
  {
    trigger: "gluten",
    title: "How Gluten Forms",
    body: "When flour meets water, two wheat proteins — glutenin and gliadin — hydrate and link into long, elastic strands. Agitation (kneading, whisking) aligns these strands into a stretchy network that traps gas bubbles produced by yeast or baking powder, giving baked goods their lift and chew.",
    formula: "glutenin + gliadin + H₂O  →  gluten network",
  },
  {
    trigger: "yeast",
    title: "Yeast Fermentation",
    body: "Active dry yeast is a living fungus (Saccharomyces cerevisiae). In warm, wet dough it eats available sugars and exhales carbon dioxide and ethanol. The CO₂ inflates the gluten network; the ethanol contributes flavor and evaporates during baking. Ideal fermentation temperature: 24-32°C. Above 40°C, the yeast dies.",
    formula: "C₆H₁₂O₆  →  2 CO₂ + 2 C₂H₅OH",
  },
  {
    trigger: "baking-soda",
    title: "Baking Soda Chemistry",
    body: "Baking soda (sodium bicarbonate) is a base. It only releases leavening gas when paired with an acid — lemon juice, buttermilk, brown sugar, cocoa. Without acid, half its potential gas stays locked and a soapy taste lingers. Reaction begins the moment liquids touch it, so bake promptly.",
    formula: "NaHCO₃ + H⁺  →  Na⁺ + H₂O + CO₂",
  },
  {
    trigger: "baking-powder",
    title: "Double-Acting Baking Powder",
    body: "Baking powder is baking soda pre-mixed with a dry acid (often sodium aluminum sulfate or cream of tartar). 'Double-acting' means gas is released twice: once when hydrated (room temperature), and again when heated above ~60°C in the oven. This makes it more forgiving than baking soda alone.",
    formula: "NaHCO₃ + acid  →  CO₂ + H₂O + salt",
  },
  {
    trigger: "butter",
    title: "Butter & Tenderness",
    body: "Solid butter coats flour proteins in fat, interrupting gluten formation and producing a tender, flaky crumb. Melted butter coats less and lets gluten develop more, giving chewier results. The water in butter (16%) also flashes to steam in the oven, creating lift in laminated doughs like croissants.",
    formula: "butter = 80% fat + 16% water + 4% milk solids",
  },
  {
    trigger: "egg",
    title: "Eggs as Emulsifiers",
    body: "Egg yolk contains lecithin, a natural emulsifier that binds water-loving and fat-loving ingredients into a stable batter. Eggs also coagulate at 65-70°C, providing structural set. Yolk enriches with fat and color; white adds lift and chew through albumin protein networks.",
    formula: "lecithin  →  water-in-oil emulsion",
  },
  {
    trigger: "maillard",
    title: "Maillard Browning",
    body: "Above ~140°C, reducing sugars react with amino acids in a cascade of hundreds of new flavor and color molecules. This is the golden-brown crust on bread, the sear on a steak, the rim of a cookie. Caramelization is a separate, sugar-only reaction that begins at higher temperatures (~160°C).",
    formula: "sugar + amino acid + heat  →  melanoidins + aroma",
  },
  {
    trigger: "sugar",
    title: "Sugar: More Than Sweetness",
    body: "Sugar tenderizes by competing with flour for water (less gluten forms). It raises the gelatinization temperature of starches, extends shelf life by holding moisture, and accelerates browning via Maillard and caramelization. Reducing sugar by more than 25% fundamentally changes the bake's texture.",
  },
  {
    trigger: "oven",
    title: "Oven Heat Transfer",
    body: "Ovens cook via three modes simultaneously. Radiation: infrared energy from the hot walls and element. Convection: hot air circulating around the food. Conduction: heat moving from the pan into the dough. Convection fans speed surface drying and browning; radiant heat drives oven-spring lift.",
    formula: "Q_total = Q_radiation + Q_convection + Q_conduction",
  },
  {
    trigger: "salt",
    title: "Salt Tightens Gluten",
    body: "Salt ions interact with charged amino acids on gluten proteins, drawing them closer and aligning the strands. The result is a stronger, more elastic dough that holds gas better and rises higher. Salt also slows yeast — never omit it, but always measure precisely.",
  },
]

export function findScienceNote(text: string): ScienceNote | undefined {
  const lower = text.toLowerCase()
  return SCIENCE_NOTES.find((n) => lower.includes(n.trigger))
}
