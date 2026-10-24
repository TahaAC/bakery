// Master Baker VR — Topping Material Library
// Toppings are applied AFTER baking (finishing/decoration).
// Each topping has a visual rendering strategy and a tactile application method.

export type ToppingApplicationMethod =
  | "dust" // powdered sugar, cocoa dusting — scattered cloud
  | "drizzle" // chocolate, caramel, honey — thin streaming lines
  | "pipe" // frosting, icing, whipped cream — spirals/dollops
  | "scatter" // sprinkles, nuts, seeds — discrete pieces
  | "layer" // fruit slices, glaze — broad even coat
  | "place" // cherries, edible flowers, whole berries — positioned pieces

export type ToppingCategory =
  | "glaze"
  | "frosting"
  | "decoration"
  | "fruit"
  | "nut"
  | "finish"

export interface ToppingMaterial {
  id: string
  name: string
  emoji: string
  category: ToppingCategory
  method: ToppingApplicationMethod
  /** Primary color */
  color: string
  /** Secondary accent color (highlight) */
  highlight?: string
  /** Default grams per "tap" or per drag pass */
  defaultGrams: number
  /** Maximum recommended grams before it overpowers */
  maxGrams: number
  /** Short tasting / application note */
  notes: string
  /** Optional science trigger */
  science?: string
  /** Whether this topping requires the bake to be done before applying */
  requiresBaked?: boolean
}

export const TOPPINGS: ToppingMaterial[] = [
  // ─── Glazes & Syrups ───────────────────────────────────────────────────
  {
    id: "powdered-sugar",
    name: "Powdered Sugar",
    emoji: "❄️",
    category: "glaze",
    method: "dust",
    color: "#FBFAF5",
    highlight: "#E8E5D8",
    defaultGrams: 15,
    maxGrams: 60,
    notes: "10x fineness. Dusts evenly, dissolves on contact with moist surfaces.",
    science: "sugar",
  },
  {
    id: "cocoa-dust",
    name: "Cocoa Dusting",
    emoji: "🍫",
    category: "glaze",
    method: "dust",
    color: "#3B2317",
    highlight: "#1F110A",
    defaultGrams: 8,
    maxGrams: 30,
    notes: "Bitter counterpoint to sweet glazes. Sift before dusting to avoid clumps.",
    science: "cocoa",
  },
  {
    id: "vanilla-glaze",
    name: "Vanilla Glaze",
    emoji: "🥛",
    category: "glaze",
    method: "drizzle",
    color: "#FFF8E0",
    highlight: "#F0E0B0",
    defaultGrams: 30,
    maxGrams: 120,
    notes: "Powdered sugar + milk + vanilla. Sets to a soft, opaque sheen.",
    science: "sugar",
  },
  {
    id: "chocolate-drizzle",
    name: "Chocolate Drizzle",
    emoji: "🍫",
    category: "glaze",
    method: "drizzle",
    color: "#3B1F12",
    highlight: "#1F1009",
    defaultGrams: 25,
    maxGrams: 100,
    notes: "Melted couverture. Sets with a glossy snap at room temperature.",
    science: "butter",
  },
  {
    id: "caramel-drizzle",
    name: "Caramel Drizzle",
    emoji: "🍯",
    category: "glaze",
    method: "drizzle",
    color: "#C46A1F",
    highlight: "#8B4A14",
    defaultGrams: 20,
    maxGrams: 80,
    notes: "Caramelized sugar + cream. Stays soft, slightly tacky when cool.",
    science: "maillard",
  },
  {
    id: "lemon-glaze",
    name: "Lemon Glaze",
    emoji: "🍋",
    category: "glaze",
    method: "drizzle",
    color: "#FFF4B0",
    highlight: "#F0D870",
    defaultGrams: 25,
    maxGrams: 100,
    notes: "Powdered sugar + lemon juice. Tart, bright, sets translucent.",
  },

  // ─── Frostings & Creams ───────────────────────────────────────────────
  {
    id: "buttercream",
    name: "Vanilla Buttercream",
    emoji: "🧁",
    category: "frosting",
    method: "pipe",
    color: "#FFF5DC",
    highlight: "#F0D8A8",
    defaultGrams: 50,
    maxGrams: 250,
    notes: "Butter + powdered sugar + vanilla. Holds peaks, smooths to silk.",
    science: "butter",
  },
  {
    id: "chocolate-frosting",
    name: "Chocolate Frosting",
    emoji: "🍫",
    category: "frosting",
    method: "pipe",
    color: "#4A2818",
    highlight: "#2A1408",
    defaultGrams: 50,
    maxGrams: 250,
    notes: "Cocoa-enriched buttercream. Deeper flavor, softer set.",
    science: "cocoa",
  },
  {
    id: "cream-cheese",
    name: "Cream Cheese Frosting",
    emoji: "🧀",
    category: "frosting",
    method: "pipe",
    color: "#FFF8E8",
    highlight: "#F0E5C8",
    defaultGrams: 45,
    maxGrams: 200,
    notes: "Tangy, soft. Pairs with carrot, red velvet, cinnamon bakes.",
  },
  {
    id: "whipped-cream",
    name: "Whipped Cream",
    emoji: "🍦",
    category: "frosting",
    method: "pipe",
    color: "#FFFCF0",
    highlight: "#F0E8C8",
    defaultGrams: 40,
    maxGrams: 180,
    notes: "Soft, airy, perishable. Apply just before serving.",
  },
  {
    id: "royal-icing",
    name: "Royal Icing",
    emoji: "👑",
    category: "frosting",
    method: "pipe",
    color: "#FFFEFA",
    highlight: "#F0EEE0",
    defaultGrams: 30,
    maxGrams: 120,
    notes: "Egg white + powdered sugar. Dries hard, perfect for detail work.",
    science: "egg",
  },

  // ─── Decorations ──────────────────────────────────────────────────────
  {
    id: "rainbow-sprinkles",
    name: "Rainbow Sprinkles",
    emoji: "🌈",
    category: "decoration",
    method: "scatter",
    color: "#E85A4F",
    highlight: "#5A8ACF",
    defaultGrams: 8,
    maxGrams: 30,
    notes: "Wax-coated jimmies. Apply to wet frosting so they adhere.",
  },
  {
    id: "chocolate-sprinkles",
    name: "Chocolate Sprinkles",
    emoji: "🟤",
    category: "decoration",
    method: "scatter",
    color: "#3B1F12",
    highlight: "#5A3A1F",
    defaultGrams: 8,
    maxGrams: 30,
    notes: "Long, thin chocolate-flavored strands. Classic for donuts.",
  },
  {
    id: "crushed-nuts",
    name: "Crushed Nuts",
    emoji: "🌰",
    category: "decoration",
    method: "scatter",
    color: "#A0673A",
    highlight: "#5E3A1A",
    defaultGrams: 15,
    maxGrams: 60,
    notes: "Almonds, pecans, or walnuts. Toast first for deeper flavor.",
    science: "maillard",
  },
  {
    id: "shredded-coconut",
    name: "Shredded Coconut",
    emoji: "🥥",
    category: "decoration",
    method: "scatter",
    color: "#F5E8C8",
    highlight: "#D9C498",
    defaultGrams: 12,
    maxGrams: 50,
    notes: "Sweetened or unsweetened. Toasts beautifully under broiler.",
  },
  {
    id: "edible-flowers",
    name: "Edible Flowers",
    emoji: "🌸",
    category: "decoration",
    method: "place",
    color: "#E58AB8",
    highlight: "#C46A98",
    defaultGrams: 5,
    maxGrams: 20,
    notes: "Pansies, nasturtiums, violets. Delicate — apply last, serve same day.",
  },

  // ─── Fresh Fruit ──────────────────────────────────────────────────────
  {
    id: "fresh-berries",
    name: "Fresh Berries",
    emoji: "🫐",
    category: "fruit",
    method: "place",
    color: "#4A2A6B",
    highlight: "#2D1545",
    defaultGrams: 40,
    maxGrams: 150,
    notes: "Blueberries, raspberries, blackberries. Wash and dry thoroughly first.",
  },
  {
    id: "sliced-strawberry",
    name: "Sliced Strawberries",
    emoji: "🍓",
    category: "fruit",
    method: "layer",
    color: "#E84A4A",
    highlight: "#B82828",
    defaultGrams: 50,
    maxGrams: 180,
    notes: "Fan slices for visual impact. Macerate in sugar for 10 min for gloss.",
  },
  {
    id: "lemon-zest",
    name: "Lemon Zest",
    emoji: "🍋",
    category: "fruit",
    method: "dust",
    color: "#F5E84A",
    highlight: "#D9C828",
    defaultGrams: 3,
    maxGrams: 12,
    notes: "Bright citrus oils. Zest only the yellow layer — white pith is bitter.",
  },

  // ─── Finishing Touches ────────────────────────────────────────────────
  {
    id: "streusel",
    name: "Streusel Crumble",
    emoji: "🟫",
    category: "finish",
    method: "scatter",
    color: "#A06840",
    highlight: "#5E3A1A",
    defaultGrams: 30,
    maxGrams: 120,
    notes: "Butter + flour + sugar. Apply BEFORE bake for crunchy top.",
    requiresBaked: false,
  },
  {
    id: "turbinado-sugar",
    name: "Turbinado Sugar",
    emoji: "✨",
    category: "finish",
    method: "scatter",
    color: "#D9A868",
    highlight: "#A07840",
    defaultGrams: 10,
    maxGrams: 40,
    notes: "Large sparkling crystals. Apply before bake for crackly crust.",
    requiresBaked: false,
  },
  {
    id: "flaky-sea-salt",
    name: "Flaky Sea Salt",
    emoji: "🧂",
    category: "finish",
    method: "scatter",
    color: "#F8F8F4",
    highlight: "#C8C8C0",
    defaultGrams: 2,
    maxGrams: 8,
    notes: "Maldon-style flakes. Finishing salt for chocolate & caramel bakes.",
  },
  {
    id: "honey-glaze",
    name: "Honey Wash",
    emoji: "🍯",
    category: "finish",
    method: "layer",
    color: "#E8B040",
    highlight: "#B08020",
    defaultGrams: 15,
    maxGrams: 60,
    notes: "Warm honey brushed on hot bake. Gives glossy lacquer finish.",
    science: "maillard",
  },
]

export const TOPPING_CATEGORY_META: Record<
  ToppingCategory,
  { label: string; color: string; icon: string }
> = {
  glaze: { label: "Glazes & Syrups", color: "#E5B95A", icon: "🍯" },
  frosting: { label: "Frostings", color: "#F0D8A8", icon: "🧁" },
  decoration: { label: "Decorations", color: "#E58AB8", icon: "🌈" },
  fruit: { label: "Fresh Fruit", color: "#7FBED6", icon: "🍓" },
  nut: { label: "Nuts", color: "#A0673A", icon: "🌰" },
  finish: { label: "Finishing", color: "#D9A868", icon: "✨" },
}

export const TOPPING_METHOD_META: Record<
  ToppingApplicationMethod,
  { label: string; description: string; icon: string }
> = {
  dust: {
    label: "Dust",
    description: "Hold sieve high and tap to scatter a fine cloud",
    icon: "🌫️",
  },
  drizzle: {
    label: "Drizzle",
    description: "Move spoon side-to-side to stream thin ribbons",
    icon: "〰️",
  },
  pipe: {
    label: "Pipe",
    description: "Squeeze piping bag for spirals, dollops, or borders",
    icon: "🌀",
  },
  scatter: {
    label: "Scatter",
    description: "Toss handfuls evenly across the surface",
    icon: "✺",
  },
  layer: {
    label: "Layer",
    description: "Brush or lay flat for an even coat",
    icon: "▭",
  },
  place: {
    label: "Place",
    description: "Position individual pieces with precision",
    icon: "✦",
  },
}

export function getTopping(id: string): ToppingMaterial | undefined {
  return TOPPINGS.find((t) => t.id === id)
}
