// HIRA Bakery — Topping Material Library
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
  | "cream"
  | "decoration"
  | "fruit"
  | "nut"
  | "accent"
  | "finish"

/** Piping nozzle shapes — affect how "pipe" method toppings render */
export type NozzleType =
  | "round"    // Simple round tip — smooth dollops
  | "star"     // Star tip — ridged rosettes
  | "leaf"     // Leaf tip — leaf-shaped piping
  | "petal"    // Petal tip — ruffled edges
  | "basket"   // Basket-weave tip — interleaved lines
  | "french"   // French star — fine ridged stars

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

  // ─── Whipped Creams (colored + flavored) ─────────────────────────────
  {
    id: "whipped-cream-white",
    name: "Classic Whipped Cream",
    emoji: "🍦",
    category: "cream",
    method: "pipe",
    color: "#FFFCF0",
    highlight: "#F0E8C8",
    defaultGrams: 40,
    maxGrams: 180,
    notes: "Soft, airy, perishable. Apply just before serving.",
  },
  {
    id: "whipped-cream-pink",
    name: "Pink Whipped Cream",
    emoji: "🌸",
    category: "cream",
    method: "pipe",
    color: "#FFD1DC",
    highlight: "#FFB0C4",
    defaultGrams: 40,
    maxGrams: 180,
    notes: "Rose-tinted whipped cream. Perfect for princess cakes.",
  },
  {
    id: "whipped-cream-blue",
    name: "Blue Whipped Cream",
    emoji: "💙",
    category: "cream",
    method: "pipe",
    color: "#B3D9FF",
    highlight: "#80B8E6",
    defaultGrams: 40,
    maxGrams: 180,
    notes: "Ocean-blue whipped cream. Great for themed birthday cakes.",
  },
  {
    id: "whipped-cream-green",
    name: "Green Whipped Cream",
    emoji: "💚",
    category: "cream",
    method: "pipe",
    color: "#B8E6B8",
    highlight: "#80C880",
    defaultGrams: 40,
    maxGrams: 180,
    notes: "Mint-green whipped cream. Pairs with chocolate and mint.",
  },
  {
    id: "whipped-cream-purple",
    name: "Purple Whipped Cream",
    emoji: "💜",
    category: "cream",
    method: "pipe",
    color: "#D4B8E6",
    highlight: "#A880C8",
    defaultGrams: 40,
    maxGrams: 180,
    notes: "Lavender-purple whipped cream. Elegant for special occasions.",
  },
  {
    id: "whipped-cream-yellow",
    name: "Yellow Whipped Cream",
    emoji: "💛",
    category: "cream",
    method: "pipe",
    color: "#FFF0B8",
    highlight: "#F5D878",
    defaultGrams: 40,
    maxGrams: 180,
    notes: "Sunny yellow whipped cream. Lemon-infused for brightness.",
  },
  {
    id: "whipped-cream-orange",
    name: "Orange Whipped Cream",
    emoji: "🧡",
    category: "cream",
    method: "pipe",
    color: "#FFD4B8",
    highlight: "#F5A878",
    defaultGrams: 40,
    maxGrams: 180,
    notes: "Warm orange whipped cream. Pumpkin spice vibes.",
  },
  {
    id: "whipped-cream-chocolate",
    name: "Chocolate Whipped Cream",
    emoji: "🍫",
    category: "cream",
    method: "pipe",
    color: "#8B5A2B",
    highlight: "#5A3A1A",
    defaultGrams: 45,
    maxGrams: 180,
    notes: "Cocoa-flavored whipped cream. Lighter than frosting.",
  },
  {
    id: "whipped-cream-mint",
    name: "Mint Whipped Cream",
    emoji: "🌿",
    category: "cream",
    method: "pipe",
    color: "#C8F0C8",
    highlight: "#80D080",
    defaultGrams: 40,
    maxGrams: 180,
    notes: "Peppermint-infused whipped cream. Cool and refreshing.",
  },

  // ─── All Fruits (comprehensive) ──────────────────────────────────────
  {
    id: "fresh-raspberries",
    name: "Raspberries",
    emoji: "🫐",
    category: "fruit",
    method: "place",
    color: "#C2185B",
    highlight: "#880E4F",
    defaultGrams: 35,
    maxGrams: 150,
    notes: "Delicate and tart. Handle gently — they crush easily.",
  },
  {
    id: "fresh-blackberries",
    name: "Blackberries",
    emoji: "🫐",
    category: "fruit",
    method: "place",
    color: "#311B92",
    highlight: "#1A0E5C",
    defaultGrams: 40,
    maxGrams: 150,
    notes: "Deep purple-black, juicy and sweet-tart. Stains easily.",
  },
  {
    id: "fresh-peach-slices",
    name: "Peach Slices",
    emoji: "🍑",
    category: "fruit",
    method: "layer",
    color: "#FFB74D",
    highlight: "#F57C00",
    defaultGrams: 50,
    maxGrams: 180,
    notes: "Sweet, fragrant, golden. Poach briefly for easier slicing.",
  },
  {
    id: "fresh-banana-slices",
    name: "Banana Slices",
    emoji: "🍌",
    category: "fruit",
    method: "layer",
    color: "#FFE082",
    highlight: "#FFB300",
    defaultGrams: 50,
    maxGrams: 180,
    notes: "Brush with lemon juice to prevent browning.",
  },
  {
    id: "fresh-kiwi-slices",
    name: "Kiwi Slices",
    emoji: "🥝",
    category: "fruit",
    method: "layer",
    color: "#8BC34A",
    highlight: "#558B2F",
    defaultGrams: 40,
    maxGrams: 150,
    notes: "Vibrant green with black seeds. Peel before slicing.",
  },
  {
    id: "fresh-mango-slices",
    name: "Mango Slices",
    emoji: "🥭",
    category: "fruit",
    method: "layer",
    color: "#FFB300",
    highlight: "#FF8F00",
    defaultGrams: 50,
    maxGrams: 180,
    notes: "Tropical, sweet, golden-orange. Fan slices for decoration.",
  },
  {
    id: "fresh-pineapple",
    name: "Pineapple Chunks",
    emoji: "🍍",
    category: "fruit",
    method: "place",
    color: "#FFEB3B",
    highlight: "#F9A825",
    defaultGrams: 45,
    maxGrams: 160,
    notes: "Sweet and tangy. Drain well — excess juice makes cake soggy.",
  },
  {
    id: "fresh-cherries",
    name: "Fresh Cherries",
    emoji: "🍒",
    category: "fruit",
    method: "place",
    color: "#C62828",
    highlight: "#8E0000",
    defaultGrams: 30,
    maxGrams: 120,
    notes: "Classic Black Forest topping. Pit before placing.",
  },
  {
    id: "fresh-apple-slices",
    name: "Apple Slices",
    emoji: "🍎",
    category: "fruit",
    method: "layer",
    color: "#E53935",
    highlight: "#B71C1C",
    defaultGrams: 45,
    maxGrams: 160,
    notes: "Tart-sweet. Toss with cinnamon sugar before arranging.",
  },
  {
    id: "fresh-orange-slices",
    name: "Orange Slices",
    emoji: "🍊",
    category: "fruit",
    method: "layer",
    color: "#FF9800",
    highlight: "#E65100",
    defaultGrams: 40,
    maxGrams: 150,
    notes: "Bright citrus. Use blood oranges for dramatic color.",
  },
  {
    id: "fresh-grapes",
    name: "Fresh Grapes",
    emoji: "🍇",
    category: "fruit",
    method: "place",
    color: "#6A1B9A",
    highlight: "#4A148C",
    defaultGrams: 35,
    maxGrams: 140,
    notes: "Sweet, juicy, bite-sized. Use red and green mixed for contrast.",
  },
  {
    id: "fresh-pomegranate",
    name: "Pomegranate Seeds",
    emoji: "🔴",
    category: "fruit",
    method: "scatter",
    color: "#D32F2F",
    highlight: "#B71C1C",
    defaultGrams: 15,
    maxGrams: 60,
    notes: "Jewel-like seeds. Burst with tart juice. Stunning on white frosting.",
  },
  {
    id: "fresh-passionfruit",
    name: "Passion Fruit Pulp",
    emoji: "🟣",
    category: "fruit",
    method: "drizzle",
    color: "#6A1B9A",
    highlight: "#311B92",
    defaultGrams: 20,
    maxGrams: 80,
    notes: "Tropical tang with crunchy seeds. Spoon over frosting.",
  },
  {
    id: "fresh-figs",
    name: "Fresh Figs",
    emoji: "🌿",
    category: "fruit",
    method: "place",
    color: "#6D4C41",
    highlight: "#3E2723",
    defaultGrams: 35,
    maxGrams: 140,
    notes: "Elegant, honey-sweet. Cut in half to show the seeded interior.",
  },
  {
    id: "fresh-blueberries-large",
    name: "Giant Blueberries",
    emoji: "🫐",
    category: "fruit",
    method: "place",
    color: "#1565C0",
    highlight: "#0D47A1",
    defaultGrams: 30,
    maxGrams: 120,
    notes: "Plump, sweet, antioxidant-rich. Burst when bitten.",
  },
  {
    id: "fresh-cranberries",
    name: "Cranberries",
    emoji: "🔴",
    category: "fruit",
    method: "scatter",
    color: "#C62828",
    highlight: "#8E0000",
    defaultGrams: 20,
    maxGrams: 80,
    notes: "Tart and festive. Perfect for holiday bakes.",
  },
  {
    id: "fresh-pear-slices",
    name: "Pear Slices",
    emoji: "🍐",
    category: "fruit",
    method: "layer",
    color: "#D4E157",
    highlight: "#827717",
    defaultGrams: 45,
    maxGrams: 160,
    notes: "Delicate, perfumed, sweet. Poach in wine for extra flavor.",
  },
  {
    id: "fresh-apricot-slices",
    name: "Apricot Slices",
    emoji: "🟠",
    category: "fruit",
    method: "layer",
    color: "#FFB74D",
    highlight: "#E65100",
    defaultGrams: 35,
    maxGrams: 140,
    notes: "Velvety, sweet, sunset-orange. Pairs with almond.",
  },
  {
    id: "fresh-plum-slices",
    name: "Plum Slices",
    emoji: "🟣",
    category: "fruit",
    method: "layer",
    color: "#8E24AA",
    highlight: "#4A148C",
    defaultGrams: 40,
    maxGrams: 150,
    notes: "Sweet-tart with dramatic purple skin. Use Italian prune plums.",
  },

  // ─── All Nuts (comprehensive) ─────────────────────────────────────────
  {
    id: "sliced-almonds",
    name: "Sliced Almonds",
    emoji: "🥜",
    category: "nut",
    method: "scatter",
    color: "#D4A76A",
    highlight: "#8B6F47",
    defaultGrams: 15,
    maxGrams: 60,
    notes: "Thin, flaked, golden. Toast for deeper flavor and crunch.",
    science: "maillard",
  },
  {
    id: "whole-almonds",
    name: "Whole Almonds",
    emoji: "🌰",
    category: "nut",
    method: "scatter",
    color: "#C19A6B",
    highlight: "#8B6F47",
    defaultGrams: 20,
    maxGrams: 70,
    notes: "Blanched whole almonds. Press into frosting for decoration.",
    science: "maillard",
  },
  {
    id: "walnut-halves",
    name: "Walnut Halves",
    emoji: "🌰",
    category: "nut",
    method: "place",
    color: "#795548",
    highlight: "#4E342E",
    defaultGrams: 20,
    maxGrams: 70,
    notes: "Rich, earthy, slightly bitter. Classic with banana bread.",
    science: "maillard",
  },
  {
    id: "pecan-halves",
    name: "Pecan Halves",
    emoji: "🌰",
    category: "nut",
    method: "place",
    color: "#8D6E63",
    highlight: "#5D4037",
    defaultGrams: 20,
    maxGrams: 70,
    notes: "Buttery, sweet, elongated. Star of pecan pie.",
    science: "maillard",
  },
  {
    id: "pistachios",
    name: "Pistachios",
    emoji: "🟢",
    category: "nut",
    method: "scatter",
    color: "#66BB6A",
    highlight: "#388E3C",
    defaultGrams: 15,
    maxGrams: 55,
    notes: "Vibrant green, sweet, delicate. Shelled and chopped.",
    science: "maillard",
  },
  {
    id: "macadamia-nuts",
    name: "Macadamia Nuts",
    emoji: "🟤",
    category: "nut",
    method: "scatter",
    color: "#D4C4A8",
    highlight: "#A6926B",
    defaultGrams: 20,
    maxGrams: 70,
    notes: "Creamy, buttery, round. White chocolate's best friend.",
    science: "maillard",
  },
  {
    id: "hazelnuts",
    name: "Hazelnuts",
    emoji: "🌰",
    category: "nut",
    method: "scatter",
    color: "#A1887F",
    highlight: "#5D4037",
    defaultGrams: 15,
    maxGrams: 55,
    notes: "Nutty, aromatic, papery skin. Toast and rub off skins.",
    science: "maillard",
  },
  {
    id: "cashews",
    name: "Cashews",
    emoji: "🥜",
    category: "nut",
    method: "scatter",
    color: "#D4B896",
    highlight: "#8B6F47",
    defaultGrams: 18,
    maxGrams: 65,
    notes: "Creamy, sweet, crescent-shaped. Buttery and mild.",
    science: "maillard",
  },
  {
    id: "peanuts",
    name: "Peanuts",
    emoji: "🥜",
    category: "nut",
    method: "scatter",
    color: "#A1887F",
    highlight: "#5D4037",
    defaultGrams: 18,
    maxGrams: 65,
    notes: "Roasted, salted, crunchy. American classic — try with chocolate.",
    science: "maillard",
  },
  {
    id: "pine-nuts",
    name: "Pine Nuts",
    emoji: "🟡",
    category: "nut",
    method: "scatter",
    color: "#FFF9C4",
    highlight: "#FBC02D",
    defaultGrams: 10,
    maxGrams: 40,
    notes: "Tiny, ivory, buttery. Toast lightly — they burn fast!",
    science: "maillard",
  },
  {
    id: "brazil-nuts",
    name: "Brazil Nuts",
    emoji: "🟠",
    category: "nut",
    method: "scatter",
    color: "#D4A76A",
    highlight: "#8B6F47",
    defaultGrams: 18,
    maxGrams: 65,
    notes: "Large, creamy, earthy. Rich in selenium.",
    science: "maillard",
  },

  // ─── Flavor Accents & Extracts ────────────────────────────────────────
  {
    id: "mint-leaves",
    name: "Fresh Mint Leaves",
    emoji: "🌿",
    category: "accent",
    method: "place",
    color: "#4CAF50",
    highlight: "#2E7D32",
    defaultGrams: 3,
    maxGrams: 12,
    notes: "Aromatic, cooling, bright green. Garnish for chocolate desserts.",
  },
  {
    id: "almond-extract-drizzle",
    name: "Almond Extract Glaze",
    emoji: "💧",
    category: "accent",
    method: "drizzle",
    color: "#FFF8E1",
    highlight: "#FFE082",
    defaultGrams: 10,
    maxGrams: 40,
    notes: "Concentrated almond aroma. A little goes a long way!",
  },
  {
    id: "coffee-drizzle",
    name: "Espresso Drizzle",
    emoji: "☕",
    category: "accent",
    method: "drizzle",
    color: "#3E2723",
    highlight: "#1B0F0A",
    defaultGrams: 15,
    maxGrams: 60,
    notes: "Concentrated coffee glaze. Amplifies chocolate flavor.",
  },
  {
    id: "rose-water-drizzle",
    name: "Rose Water Syrup",
    emoji: "🌹",
    category: "accent",
    method: "drizzle",
    color: "#F8BBD0",
    highlight: "#E91E63",
    defaultGrams: 8,
    maxGrams: 30,
    notes: "Delicate floral perfume. Middle Eastern classic.",
  },
  {
    id: "orange-blossom-drizzle",
    name: "Orange Blossom Syrup",
    emoji: "🌸",
    category: "accent",
    method: "drizzle",
    color: "#FFE0B2",
    highlight: "#FF9800",
    defaultGrams: 8,
    maxGrams: 30,
    notes: "Sweet floral citrus. Used in baklava and madeleines.",
  },
  {
    id: "lavender-sprinkle",
    name: "Lavender Buds",
    emoji: "🟣",
    category: "accent",
    method: "scatter",
    color: "#9575CD",
    highlight: "#5E35B1",
    defaultGrams: 3,
    maxGrams: 10,
    notes: "Dried culinary lavender. Floral, herbal, calming.",
  },
  {
    id: "cinnamon-dust",
    name: "Cinnamon Dust",
    emoji: "🟤",
    category: "accent",
    method: "dust",
    color: "#8D6E63",
    highlight: "#5D4037",
    defaultGrams: 5,
    maxGrams: 20,
    notes: "Warm, spicy, aromatic. Pairs with apple, banana, chocolate.",
  },
  {
    id: "cardamom-dust",
    name: "Cardamom Dust",
    emoji: "🟢",
    category: "accent",
    method: "dust",
    color: "#A5D6A7",
    highlight: "#388E3C",
    defaultGrams: 3,
    maxGrams: 10,
    notes: "Citrusy, floral, complex. Scandinavian and Indian baking.",
  },
  {
    id: "matcha-dust",
    name: "Matcha Powder",
    emoji: "🍵",
    category: "accent",
    method: "dust",
    color: "#66BB6A",
    highlight: "#2E7D32",
    defaultGrams: 5,
    maxGrams: 20,
    notes: "Stone-ground green tea. Antioxidant-rich, earthy, vivid green.",
  },
]

export const TOPPING_CATEGORY_META: Record<
  ToppingCategory,
  { label: string; color: string; icon: string }
> = {
  glaze: { label: "Glazes & Syrups", color: "#E5B95A", icon: "🍯" },
  frosting: { label: "Frostings", color: "#F0D8A8", icon: "🧁" },
  cream: { label: "Whipped Creams", color: "#FCE4EC", icon: "🍦" },
  decoration: { label: "Decorations", color: "#E58AB8", icon: "🌈" },
  fruit: { label: "Fresh Fruit", color: "#7FBED6", icon: "🍓" },
  nut: { label: "Nuts", color: "#A0673A", icon: "🌰" },
  accent: { label: "Flavor Accents", color: "#C8E6C9", icon: "🌿" },
  finish: { label: "Finishing", color: "#D9A868", icon: "✨" },
}

export const NOZZLE_META: Record<
  NozzleType,
  { label: string; description: string; icon: string }
> = {
  round: {
    label: "Round",
    description: "Smooth round tip for dots, dots, and writing",
    icon: "●",
  },
  star: {
    label: "Star",
    description: "Classic ridged star for rosettes and borders",
    icon: "✦",
  },
  leaf: {
    label: "Leaf",
    description: "V-shaped tip for leaf shapes",
    icon: "🍃",
  },
  petal: {
    label: "Petal",
    description: "Curved tip for ruffled petals and flowers",
    icon: "🌸",
  },
  basket: {
    label: "Basket",
    description: "Flat tip for woven basket-weave patterns",
    icon: "▦",
  },
  french: {
    label: "French Star",
    description: "Fine-tooth star for delicate detail work",
    icon: "❋",
  },
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

// ─── Particle generation ─────────────────────────────────────────────────
//
// IMPORTANT: These helpers are called ONCE at apply-time (when the user
// finishes a stroke / taps to place a topping). The returned particles are
// stored on the AppliedTopping and reused on every render. This prevents
// the "bubbling" / flicker that happens when Math.random() is called inside
// render — every state update would otherwise regenerate positions and
// make the topping visually shift.

export interface ToppingParticle {
  x: number
  y: number
  size: number
  rotation: number
  useHighlight: boolean
  opacity: number
}

/**
 * Pre-compute particles for `dust` and `scatter` topping methods.
 * Called once when the topping is applied; the result is stored on
 * the AppliedTopping and rendered deterministically thereafter.
 *
 * @param method   "dust" or "scatter"
 * @param amount   0..1 size/quantity factor (controls particle count + spread)
 * @param baseSize The visual size of the topping instance in px (used to scale offsets)
 */
export function generateToppingParticles(
  method: "dust" | "scatter",
  amount: number,
  baseSize: number
): ToppingParticle[] {
  if (method === "dust") {
    const count = Math.max(6, Math.floor(amount * 18))
    const particles: ToppingParticle[] = []
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const dist = (Math.random() * 0.5 + 0.2) * baseSize
      const px = Math.cos(angle) * dist + (Math.random() - 0.5) * baseSize * 0.4
      const py = Math.sin(angle) * dist + (Math.random() - 0.5) * baseSize * 0.4
      particles.push({
        x: px,
        y: py,
        size: 1 + Math.random() * 2.5,
        rotation: 0,
        useHighlight: Math.random() > 0.7,
        opacity: 0.75 + Math.random() * 0.25,
      })
    }
    return particles
  }

  // scatter
  const count = 4 + Math.floor(amount * 5)
  const particles: ToppingParticle[] = []
  for (let i = 0; i < count; i++) {
    particles.push({
      x: (Math.random() - 0.5) * baseSize,
      y: (Math.random() - 0.5) * baseSize,
      size: 2 + Math.random() * 4,
      rotation: Math.random() * 360,
      useHighlight: Math.random() > 0.6,
      opacity: 1,
    })
  }
  return particles
}

/**
 * Pre-compute confetti particles for celebrations.
 * Same pattern — called once when the celebration starts, rendered
 * deterministically thereafter to avoid flicker.
 */
export function generateConfetti(count: number): {
  left: number
  delay: number
  duration: number
  direction: number
  color: string
}[] {
  const colors = [
    "#E84A4F", "#F5D040", "#5A8ACF", "#7AC07A",
    "#B070C8", "#FF8A40", "#E58AB8", "#7FBED6",
  ]
  return Array.from({ length: count }).map(() => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.6,
    duration: 2 + Math.random() * 1.5,
    direction: Math.random() > 0.5 ? 1 : -1,
    color: colors[Math.floor(Math.random() * colors.length)],
  }))
}

