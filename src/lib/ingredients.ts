// Master Baker VR — Ingredient Library
// Each ingredient has visual, physical, and chemical properties used by the simulation.

export type IngredientCategory = "dry" | "wet" | "fat" | "leavening" | "flavor" | "dairy" | "egg"

export type IngredientState = "solid" | "powder" | "liquid" | "viscous" | "emulsion"

export interface Ingredient {
  id: string
  name: string
  emoji: string
  category: IngredientCategory
  state: IngredientState
  /** Default color rendered in the bowl (hex) */
  color: string
  /** Secondary highlight color for layered rendering */
  highlight?: string
  /** Density relative to water (1.0). Affects stacking order in bowl */
  density: number
  /** Default serving in grams when added with one tap */
  defaultGrams: number
  /** Short tasting / tactile notes shown in UI */
  notes: string
  /** Mixing behavior tag */
  behavior: "dissolves" | "suspends" | "emulsifies" | "coats" | "melts" | "remains"
}

export const INGREDIENTS: Ingredient[] = [
  // ─── Dry Goods ─────────────────────────────────────────────────────────
  {
    id: "flour-ap",
    name: "All-Purpose Flour",
    emoji: "🌾",
    category: "dry",
    state: "powder",
    color: "#F4E8C8",
    highlight: "#E8D49B",
    density: 0.55,
    defaultGrams: 120,
    notes: "Fine milled wheat. Builds gluten when hydrated and agitated.",
    behavior: "suspends",
  },
  {
    id: "flour-bread",
    name: "Bread Flour",
    emoji: "🌾",
    category: "dry",
    state: "powder",
    color: "#EEDDB0",
    highlight: "#D9C286",
    density: 0.58,
    defaultGrams: 130,
    notes: "Higher protein (12-14%). Develops stronger, more elastic gluten.",
    behavior: "suspends",
  },
  {
    id: "sugar-granulated",
    name: "Granulated Sugar",
    emoji: "🍬",
    category: "dry",
    state: "powder",
    color: "#FBFAF5",
    highlight: "#E8E5D8",
    density: 0.85,
    defaultGrams: 100,
    notes: "Crystalline sucrose. Dissolves in water, caramelizes above 160°C.",
    behavior: "dissolves",
  },
  {
    id: "sugar-brown",
    name: "Brown Sugar",
    emoji: "🟤",
    category: "dry",
    state: "powder",
    color: "#8B5A2B",
    highlight: "#5E3A18",
    density: 0.78,
    defaultGrams: 100,
    notes: "Molasses-rich. Adds moisture, acidity, and deep caramel notes.",
    behavior: "dissolves",
  },
  {
    id: "cocoa",
    name: "Cocoa Powder",
    emoji: "🍫",
    category: "dry",
    state: "powder",
    color: "#3B2317",
    highlight: "#1F110A",
    density: 0.45,
    defaultGrams: 30,
    notes: "Fat-reduced cocoa solids. Adds bitterness, color, and acidity.",
    behavior: "suspends",
  },
  {
    id: "salt",
    name: "Fine Sea Salt",
    emoji: "🧂",
    category: "dry",
    state: "powder",
    color: "#F0F0EC",
    highlight: "#C9C9C0",
    density: 1.20,
    defaultGrams: 5,
    notes: "Tightens gluten, enhances flavor, controls yeast activity.",
    behavior: "dissolves",
  },
  {
    id: "baking-soda",
    name: "Baking Soda",
    emoji: "⚗️",
    category: "leavening",
    state: "powder",
    color: "#FAFAF8",
    highlight: "#DCDCD4",
    density: 1.10,
    defaultGrams: 5,
    notes: "Sodium bicarbonate. Needs acid to release CO₂.",
    behavior: "dissolves",
  },
  {
    id: "baking-powder",
    name: "Baking Powder",
    emoji: "🧪",
    category: "leavening",
    state: "powder",
    color: "#F5F5F0",
    highlight: "#D4D4CB",
    density: 1.05,
    defaultGrams: 8,
    notes: "Double-acting. Releases gas on hydration and again under heat.",
    behavior: "dissolves",
  },
  {
    id: "yeast",
    name: "Active Dry Yeast",
    emoji: "🦠",
    category: "leavening",
    state: "powder",
    color: "#C9A779",
    highlight: "#8B6A43",
    density: 0.55,
    defaultGrams: 7,
    notes: "Living fungus. Ferments sugars into CO₂ and ethanol.",
    behavior: "suspends",
  },

  // ─── Wet Goods ─────────────────────────────────────────────────────────
  {
    id: "water",
    name: "Water",
    emoji: "💧",
    category: "wet",
    state: "liquid",
    color: "#BFE3F2",
    highlight: "#7FBED6",
    density: 1.00,
    defaultGrams: 100,
    notes: "Universal solvent. Hydrates flour to form gluten network.",
    behavior: "dissolves",
  },
  {
    id: "milk-whole",
    name: "Whole Milk",
    emoji: "🥛",
    category: "dairy",
    state: "liquid",
    color: "#F8F4EC",
    highlight: "#E6DDC8",
    density: 1.03,
    defaultGrams: 120,
    notes: "Adds fat, protein, sugar (lactose). Tenderizes crumb, aids browning.",
    behavior: "emulsifies",
  },
  {
    id: "vanilla",
    name: "Vanilla Extract",
    emoji: "🌿",
    category: "flavor",
    state: "liquid",
    color: "#5A2E1A",
    highlight: "#3A1C0F",
    density: 1.05,
    defaultGrams: 5,
    notes: "Alcohol-based extract. Aromatic compounds bloom in fat.",
    behavior: "coats",
  },
  {
    id: "lemon-juice",
    name: "Lemon Juice",
    emoji: "🍋",
    category: "wet",
    state: "liquid",
    color: "#F7F1B0",
    highlight: "#D9D470",
    density: 1.02,
    defaultGrams: 15,
    notes: "Citric acid. Activates baking soda, brightens flavor.",
    behavior: "dissolves",
  },

  // ─── Fats ──────────────────────────────────────────────────────────────
  {
    id: "butter",
    name: "Unsalted Butter",
    emoji: "🧈",
    category: "fat",
    state: "viscous",
    color: "#F6DD92",
    highlight: "#E5C04E",
    density: 0.91,
    defaultGrams: 100,
    notes: "80% fat, 16% water. Coats flour to tenderize, melts to lubricate.",
    behavior: "coats",
  },
  {
    id: "oil-veg",
    name: "Vegetable Oil",
    emoji: "🛢️",
    category: "fat",
    state: "liquid",
    color: "#E8D77A",
    highlight: "#B89F3A",
    density: 0.92,
    defaultGrams: 80,
    notes: "100% liquid fat. Produces dense, moist, tender crumb.",
    behavior: "coats",
  },

  // ─── Eggs ──────────────────────────────────────────────────────────────
  {
    id: "egg-whole",
    name: "Whole Egg",
    emoji: "🥚",
    category: "egg",
    state: "emulsion",
    color: "#F6C44C",
    highlight: "#F6E7B4",
    density: 1.03,
    defaultGrams: 50,
    notes: "Emulsifier + coagulant. Yolk enriches, white adds structure.",
    behavior: "emulsifies",
  },
  {
    id: "egg-yolk",
    name: "Egg Yolk",
    emoji: "🟡",
    category: "egg",
    state: "viscous",
    color: "#F5B400",
    highlight: "#D89400",
    density: 1.04,
    defaultGrams: 18,
    notes: "Lecithin-rich emulsifier. Adds richness, gloss, and tenderness.",
    behavior: "emulsifies",
  },

  // ─── Flavor / Inclusions ───────────────────────────────────────────────
  {
    id: "choc-chips",
    name: "Chocolate Chips",
    emoji: "🍫",
    category: "flavor",
    state: "solid",
    color: "#3B1F12",
    highlight: "#1F1009",
    density: 0.85,
    defaultGrams: 100,
    notes: "Semi-sweet couverture. Melts between 30-34°C, holds shape when baked.",
    behavior: "remains",
  },
  {
    id: "berries",
    name: "Fresh Berries",
    emoji: "🫐",
    category: "flavor",
    state: "solid",
    color: "#4A2A6B",
    highlight: "#2D1545",
    density: 0.95,
    defaultGrams: 80,
    notes: "Acidic + juicy. Bleeds color, lowers pH, may sink in loose batter.",
    behavior: "remains",
  },
  {
    id: "nuts",
    name: "Chopped Nuts",
    emoji: "🌰",
    category: "flavor",
    state: "solid",
    color: "#A0673A",
    highlight: "#5E3A1A",
    density: 0.55,
    defaultGrams: 60,
    notes: "Added texture and fat. Toast in oven first to release oils.",
    behavior: "remains",
  },
]

export const CATEGORY_META: Record<IngredientCategory, { label: string; color: string; icon: string }> = {
  dry: { label: "Dry Goods", color: "#C9A779", icon: "🌾" },
  wet: { label: "Wet Goods", color: "#7FBED6", icon: "💧" },
  fat: { label: "Fats", color: "#E5C04E", icon: "🧈" },
  leavening: { label: "Leavening", color: "#D9A3D9", icon: "⚗️" },
  flavor: { label: "Flavor", color: "#B5739A", icon: "🍫" },
  dairy: { label: "Dairy", color: "#E6DDC8", icon: "🥛" },
  egg: { label: "Eggs", color: "#F5B400", icon: "🥚" },
}

export function getIngredient(id: string): Ingredient | undefined {
  return INGREDIENTS.find((i) => i.id === id)
}
