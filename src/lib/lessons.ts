// HIRA Bakery — Learning Environment
// Kid-friendly baking curriculum + achievement badges + fun facts.
// Designed for ages 7+ to learn real kitchen science through play.

export interface LessonStep {
  /** What the kid should do */
  instruction: string
  /** Friendly hint from Chef Bear */
  hint: string
  /** The station the kid needs to be on */
  station: "pantry" | "mixing" | "mixer" | "oven" | "toppings" | "showcase"
  /** Predicate to check if this step is complete (called against store state) */
  check: (state: LessonCheckContext) => boolean
  /** Fun fact shown when this step completes */
  funFact?: string
}

export interface LessonCheckContext {
  bowl: { ingredientId: string; grams: number }[]
  mixLevel: number
  kneadLevel: number
  ovenOn: boolean
  ovenTempC: number
  baking: { status: string; brownLevel: number; riseLevel: number; donenessLabel: string }
  appliedToppings: { id: string; toppingId: string }[]
  servedToCustomer: boolean
  customerRating: number
  sliceCount: number
}

export interface Lesson {
  id: string
  title: string
  emoji: string
  description: string
  /** Approximate time in minutes (for kid/parent expectations) */
  estMinutes: number
  /** Difficulty 1-5 stars */
  difficulty: number
  /** What you'll learn (kid-friendly learning objectives) */
  learningGoals: string[]
  steps: LessonStep[]
  /** Badge earned on completion */
  badgeId: string
}

export interface AchievementBadge {
  id: string
  name: string
  emoji: string
  description: string
  /** Pastel color for the badge background */
  color: string
}

// ─── Achievement badges ──────────────────────────────────────────────────

export const BADGES: AchievementBadge[] = [
  {
    id: "first-ingredient",
    name: "First Scoop",
    emoji: "🌾",
    description: "Added your very first ingredient to the bowl",
    color: "#fde68a",
  },
  {
    id: "first-mix",
    name: "Mixing Master",
    emoji: "🌀",
    description: "Whisked ingredients until smooth and combined",
    color: "#bbf7d0",
  },
  {
    id: "gluten-builder",
    name: "Gluten Builder",
    emoji: "💪",
    description: "Developed gluten by kneading dough",
    color: "#fed7aa",
  },
  {
    id: "first-bake",
    name: "First Bake",
    emoji: "🔥",
    description: "Completed your first bake in the oven",
    color: "#fecaca",
  },
  {
    id: "golden-crust",
    name: "Golden Crust",
    emoji: "✨",
    description: "Achieved a perfectly golden-brown crust",
    color: "#fde68a",
  },
  {
    id: "decorator",
    name: "Cake Decorator",
    emoji: "🎨",
    description: "Decorated a bake with at least 3 toppings",
    color: "#ddd6fe",
  },
  {
    id: "first-customer",
    name: "Happy Customer",
    emoji: "😊",
    description: "Served your first bake to a customer",
    color: "#bbf7d0",
  },
  {
    id: "five-stars",
    name: "Five-Star Baker",
    emoji: "⭐",
    description: "Earned a 5-star customer review",
    color: "#fef3c7",
  },
  {
    id: "scientist",
    name: "Kitchen Scientist",
    emoji: "🔬",
    description: "Read 5 science AR notes during baking",
    color: "#c7d2fe",
  },
  {
    id: "lesson-1",
    name: "Lesson 1 Graduate",
    emoji: "🎓",
    description: "Completed your first Bake School lesson",
    color: "#fbcfe8",
  },
  {
    id: "lesson-5",
    name: "Bread Apprentice",
    emoji: "🍞",
    description: "Completed 5 Bake School lessons",
    color: "#fde68a",
  },
  {
    id: "lesson-10",
    name: "Master Baker",
    emoji: "👑",
    description: "Completed all 10 Bake School lessons",
    color: "#fcd34d",
  },
]

export function getBadge(id: string): AchievementBadge | undefined {
  return BADGES.find((b) => b.id === id)
}

// ─── Lesson curriculum ───────────────────────────────────────────────────

export const LESSONS: Lesson[] = [
  {
    id: "lesson-1",
    title: "First Mix",
    emoji: "🥄",
    description: "Let's start by mixing flour and water — the simplest dough in the world!",
    estMinutes: 3,
    difficulty: 1,
    learningGoals: [
      "Learn how flour and water combine into a dough",
      "Understand what 'whisking' means",
      "See how powders turn into batter when wet",
    ],
    badgeId: "lesson-1",
    steps: [
      {
        instruction: "Go to the Pantry and add 120g of All-Purpose Flour",
        hint: "Tap the flour bag, then tap 'Add to Bowl'!",
        station: "pantry",
        check: (s) => s.bowl.some((b) => b.ingredientId.includes("flour") && b.grams >= 100),
        funFact: "Flour is made from grinding wheat grains. One wheat plant makes enough flour for about 70 loaves of bread!",
      },
      {
        instruction: "Now add 100g of Water to the bowl",
        hint: "Water is in the Wet Goods section. Tap the blue water drop!",
        station: "pantry",
        check: (s) => s.bowl.some((b) => b.ingredientId === "water" && b.grams >= 80),
        funFact: "Water makes flour proteins wake up and start linking together — that's how dough forms!",
      },
      {
        instruction: "Go to the Mixing Station and whisk until 50% combined",
        hint: "Move to the Mixing tab, set speed to 5, and press Start!",
        station: "mixing",
        check: (s) => s.mixLevel >= 0.5,
        funFact: "When you whisk, you're mixing the water-loving parts of flour with the water. They form stretchy strands called gluten!",
      },
    ],
  },
  {
    id: "lesson-2",
    title: "Sweet Sugar",
    emoji: "🍯",
    description: "Discover how sugar dissolves and makes everything sweeter!",
    estMinutes: 4,
    difficulty: 1,
    learningGoals: [
      "See how sugar dissolves in liquid",
      "Learn that sugar comes from plants",
      "Understand why we measure ingredients carefully",
    ],
    badgeId: "lesson-1",
    steps: [
      {
        instruction: "Add 100g of Granulated Sugar to the bowl",
        hint: "Sugar is a dry ingredient — look for the white crystals!",
        station: "pantry",
        check: (s) => s.bowl.some((b) => b.ingredientId === "sugar-granulated" && b.grams >= 80),
        funFact: "Sugar comes from two plants: sugarcane (a tall grass) and sugar beets (a root vegetable). Both make the exact same sugar!",
      },
      {
        instruction: "Add 100g of Water",
        hint: "Wet goods section — the blue drop!",
        station: "pantry",
        check: (s) => s.bowl.some((b) => b.ingredientId === "water" && b.grams >= 80),
      },
      {
        instruction: "Whisk until the sugar is fully dissolved (80% mixed)",
        hint: "Watch the bowl — the white sugar will disappear into the water!",
        station: "mixing",
        check: (s) => s.mixLevel >= 0.8,
        funFact: "Sugar 'dissolves' means the crystals break apart so small you can't see them anymore, but they're still there making the water sweet!",
      },
    ],
  },
  {
    id: "lesson-3",
    title: "Butter & Eggs",
    emoji: "🧈",
    description: "Learn how fats and eggs make bakes rich and fluffy!",
    estMinutes: 5,
    difficulty: 2,
    learningGoals: [
      "Understand what fats do in baking",
      "See how eggs hold things together",
      "Mix wet and dry ingredients properly",
    ],
    badgeId: "lesson-1",
    steps: [
      {
        instruction: "Add 120g of flour and 100g of sugar",
        hint: "Two dry ingredients from the Pantry!",
        station: "pantry",
        check: (s) =>
          s.bowl.some((b) => b.ingredientId.includes("flour")) &&
          s.bowl.some((b) => b.ingredientId === "sugar-granulated"),
      },
      {
        instruction: "Add 100g of Butter (the yellow block)",
        hint: "Butter is in the Fats section. It coats the flour to make the bake tender!",
        station: "pantry",
        check: (s) => s.bowl.some((b) => b.ingredientId === "butter"),
        funFact: "Butter is 80% fat and 16% water. The fat coats flour proteins so they can't link up too much — that's what makes cakes tender!",
      },
      {
        instruction: "Add 1 Whole Egg (50g)",
        hint: "Eggs are emulsifiers — they help water and fat mix together!",
        station: "pantry",
        check: (s) => s.bowl.some((b) => b.ingredientId === "egg-whole"),
        funFact: "Egg yolks have a special ingredient called lecithin. It's like a tiny bridge that connects water and fat so they don't separate!",
      },
      {
        instruction: "Whisk everything together until 70% combined",
        hint: "Mix it well — but don't overdo it or the gluten gets tough!",
        station: "mixing",
        check: (s) => s.mixLevel >= 0.7,
      },
    ],
  },
  {
    id: "lesson-4",
    title: "Yeast Alive!",
    emoji: "🦠",
    description: "Discover the tiny living thing that makes bread rise!",
    estMinutes: 8,
    difficulty: 3,
    learningGoals: [
      "Learn that yeast is a living fungus",
      "See how yeast makes bubbles that lift dough",
      "Understand why bread needs time to rise",
    ],
    badgeId: "lesson-5",
    steps: [
      {
        instruction: "Add 130g of Bread Flour and 5g of Sea Salt",
        hint: "Bread flour has more protein for stronger dough. Salt tightens the gluten!",
        station: "pantry",
        check: (s) =>
          s.bowl.some((b) => b.ingredientId === "flour-bread") &&
          s.bowl.some((b) => b.ingredientId === "salt"),
        funFact: "Salt doesn't just add flavor — it actually makes gluten strands stronger and tighter, so the dough can hold more bubbles!",
      },
      {
        instruction: "Add 7g of Active Dry Yeast and 100g of warm Water",
        hint: "Yeast is in the Leavening section. It looks like tiny tan granules!",
        station: "pantry",
        check: (s) =>
          s.bowl.some((b) => b.ingredientId === "yeast") &&
          s.bowl.some((b) => b.ingredientId === "water"),
        funFact: "Yeast is a LIVING fungus — millions of tiny creatures! When they eat sugar, they burp out carbon dioxide gas, which inflates the dough like a balloon.",
      },
      {
        instruction: "Go to the Stand Mixer and knead to 60% gluten development",
        hint: "The mixer develops the gluten network that traps the yeast's bubbles!",
        station: "mixer",
        check: (s) => s.kneadLevel >= 0.6,
        funFact: "Kneading lines up the gluten strands like a stretchy net. Without this net, the yeast's bubbles would just escape and the bread would stay flat!",
      },
    ],
  },
  {
    id: "lesson-5",
    title: "First Bake",
    emoji: "🔥",
    description: "Time to bake! Watch heat transform soft dough into crusty bread.",
    estMinutes: 10,
    difficulty: 3,
    learningGoals: [
      "Learn how an oven cooks food",
      "See the Maillard reaction brown the crust",
      "Understand oven temperature and timing",
    ],
    badgeId: "lesson-5",
    steps: [
      {
        instruction: "Make sure your bowl has at least 200g of ingredients",
        hint: "If not, add some flour and water first!",
        station: "pantry",
        check: (s) => s.bowl.reduce((a, b) => a + b.grams, 0) >= 200,
      },
      {
        instruction: "Go to the Smart Oven and set temperature to 180°C",
        hint: "Drag the temperature slider. 180°C is perfect for most cakes and breads!",
        station: "oven",
        check: (s) => s.ovenTempC >= 175 && s.ovenTempC <= 185,
        funFact: "180°C (350°F) is the sweet spot for baking — hot enough to brown the outside, but gentle enough to cook the inside before the outside burns!",
      },
      {
        instruction: "Set the timer to 25 minutes and start baking",
        hint: "Tap 'Start bake' and watch the magic happen!",
        station: "oven",
        check: (s) => s.baking.status === "baking" || s.baking.status === "done",
        funFact: "When dough hits hot air, three things happen: water turns to steam (lifts the dough), starches gel (set the structure), and proteins cook (firm up the crumb).",
      },
      {
        instruction: "Wait for the bake to reach 'Golden' doneness",
        hint: "Watch the doneness label change from Raw → Setting → Pale → Golden!",
        station: "oven",
        check: (s) =>
          s.baking.brownLevel >= 0.5 && s.baking.brownLevel <= 0.85,
        funFact: "That golden color is the 'Maillard reaction' — sugars and proteins react under heat to make hundreds of new flavor molecules. It's the same reaction that makes toasted marshmallows so yummy!",
      },
    ],
  },
  {
    id: "lesson-6",
    title: "Bubble Magic",
    emoji: "🫧",
    description: "Discover baking soda and baking powder — the bubble makers!",
    estMinutes: 6,
    difficulty: 3,
    learningGoals: [
      "Learn the difference between baking soda and baking powder",
      "See how acid activates baking soda",
      "Understand what makes cakes fluffy",
    ],
    badgeId: "lesson-5",
    steps: [
      {
        instruction: "Add 120g of flour and 5g of Baking Soda",
        hint: "Baking soda is in the Leavening section. It needs acid to work!",
        station: "pantry",
        check: (s) =>
          s.bowl.some((b) => b.ingredientId.includes("flour")) &&
          s.bowl.some((b) => b.ingredientId === "baking-soda"),
        funFact: "Baking soda is a base. It only makes bubbles when it meets an acid like lemon juice, buttermilk, or brown sugar. Without acid, it just tastes soapy!",
      },
      {
        instruction: "Add 15g of Lemon Juice",
        hint: "Lemon juice is the acid that activates the baking soda!",
        station: "pantry",
        check: (s) => s.bowl.some((b) => b.ingredientId === "lemon-juice"),
        funFact: "When the acid (lemon) meets the base (baking soda), they react and make carbon dioxide gas — the same gas that fizzes up your soda pop!",
      },
      {
        instruction: "Add 100g of water and whisk to 60%",
        hint: "Watch for bubbles — that's the chemical reaction happening!",
        station: "mixing",
        check: (s) =>
          s.bowl.some((b) => b.ingredientId === "water") && s.mixLevel >= 0.6,
      },
    ],
  },
  {
    id: "lesson-7",
    title: "Cake Decorator",
    emoji: "🎨",
    description: "Learn to make bakes beautiful with toppings!",
    estMinutes: 7,
    difficulty: 2,
    learningGoals: [
      "Practice fine motor skills with the decorating brush",
      "Learn about different topping types (glaze, frosting, sprinkles)",
      "Express creativity through decoration",
    ],
    badgeId: "lesson-5",
    steps: [
      {
        instruction: "Make sure you have a baked cake (Golden or Well-Browned)",
        hint: "If not, head to the Oven first!",
        station: "oven",
        check: (s) => s.baking.brownLevel >= 0.4,
      },
      {
        instruction: "Go to Toppings and add a Vanilla Glaze drizzle",
        hint: "Select the glaze, then drag your finger across the cake!",
        station: "toppings",
        check: (s) => s.appliedToppings.some((t) => t.toppingId === "vanilla-glaze"),
        funFact: "Glaze is just powdered sugar + milk. When it dries, the sugar forms a shiny crust that makes any cake look fancy!",
      },
      {
        instruction: "Add Rainbow Sprinkles on top",
        hint: "Pick the sprinkles and drag across the cake — they'll scatter!",
        station: "toppings",
        check: (s) => s.appliedToppings.some((t) => t.toppingId === "rainbow-sprinkles"),
        funFact: "Sprinkles are called 'jimmies' in some places, and 'hundreds and thousands' in Australia! They're made of sugar and food coloring coated in wax.",
      },
      {
        instruction: "Place at least 3 Fresh Berries on the cake",
        hint: "Tap the cake in different spots to place berries!",
        station: "toppings",
        check: (s) =>
          s.appliedToppings.filter((t) => t.toppingId === "fresh-berries").length >= 3,
        funFact: "Berries are full of vitamins and antioxidants. Bakers love them because their bright colors make any dessert look like a party!",
      },
    ],
  },
  {
    id: "lesson-8",
    title: "Customer Service",
    emoji: "🤝",
    description: "Present your bake and learn what customers love!",
    estMinutes: 5,
    difficulty: 2,
    learningGoals: [
      "Understand how presentation affects enjoyment",
      "Learn about food safety and serving",
      "See how feedback helps you improve",
    ],
    badgeId: "lesson-5",
    steps: [
      {
        instruction: "Have a baked and decorated cake ready",
        hint: "Make sure you've baked AND added at least 2 toppings!",
        station: "toppings",
        check: (s) =>
          s.baking.brownLevel >= 0.4 && s.appliedToppings.length >= 2,
      },
      {
        instruction: "Go to the Showcase and cut the cake into 8 slices",
        hint: "Tap the '8' button — slicing shows the inside of the cake!",
        station: "showcase",
        check: (s) => s.sliceCount === 8,
        funFact: "Cutting a cake into equal slices is math in action! A round cake cut into 8 pieces makes 45° slices (360° ÷ 8 = 45°).",
      },
      {
        instruction: "Serve the cake to your customer",
        hint: "Tap 'Serve to Customer' — they'll give you an honest review!",
        station: "showcase",
        check: (s) => s.servedToCustomer,
        funFact: "Real bakers love customer feedback — even critical reviews help them improve. The best bakers keep learning forever!",
      },
      {
        instruction: "Try to get a 4 or 5 star rating!",
        hint: "If the rating is low, try adding more toppings or baking a bit longer next time.",
        station: "showcase",
        check: (s) => s.customerRating >= 4,
        funFact: "Customers rate based on look, smell, and taste. A beautiful cake with great texture gets top marks every time!",
      },
    ],
  },
  {
    id: "lesson-9",
    title: "Chocolate Lab",
    emoji: "🍫",
    description: "Experiment with cocoa — the magical bean that becomes chocolate!",
    estMinutes: 8,
    difficulty: 4,
    learningGoals: [
      "Learn where chocolate comes from",
      "See how cocoa transforms bakes",
      "Practice following a more complex recipe",
    ],
    badgeId: "lesson-5",
    steps: [
      {
        instruction: "Add 120g of flour, 100g of sugar, and 30g of Cocoa Powder",
        hint: "Three dry ingredients! Sift the cocoa to avoid lumps.",
        station: "pantry",
        check: (s) =>
          s.bowl.some((b) => b.ingredientId.includes("flour")) &&
          s.bowl.some((b) => b.ingredientId === "sugar-granulated") &&
          s.bowl.some((b) => b.ingredientId === "cocoa"),
        funFact: "Chocolate comes from cacao beans that grow on trees in tropical rainforests. It takes about 400 beans to make just one pound of chocolate!",
      },
      {
        instruction: "Add 100g of butter, 1 egg, and 100g of milk",
        hint: "The wet ingredients! Butter + egg + milk = rich chocolate cake base.",
        station: "pantry",
        check: (s) =>
          s.bowl.some((b) => b.ingredientId === "butter") &&
          s.bowl.some((b) => b.ingredientId === "egg-whole") &&
          s.bowl.some((b) => b.ingredientId === "milk-whole"),
      },
      {
        instruction: "Add 8g of Baking Powder (the double-acting kind)",
        hint: "Baking powder has its own acid built in — no lemon needed!",
        station: "pantry",
        check: (s) => s.bowl.some((b) => b.ingredientId === "baking-powder"),
        funFact: "Baking powder is 'double-acting' — it makes bubbles twice: once when wet, and again when heated in the oven. That's why it's more forgiving than baking soda!",
      },
      {
        instruction: "Whisk until 75% combined, then bake at 180°C until Golden",
        hint: "A smooth chocolate batter is what you want!",
        station: "oven",
        check: (s) =>
          s.baking.brownLevel >= 0.5 ||
          (s.baking.status === "done" && s.baking.brownLevel >= 0.3),
      },
    ],
  },
  {
    id: "lesson-10",
    title: "Master Baker",
    emoji: "👑",
    description: "Put it all together — your final exam to become a Master Baker!",
    estMinutes: 15,
    difficulty: 5,
    learningGoals: [
      "Apply everything you've learned about ingredients",
      "Practice the full baking process start to finish",
      "Create a signature bake to be proud of",
    ],
    badgeId: "lesson-10",
    steps: [
      {
        instruction: "Build your own recipe with at least 5 different ingredients",
        hint: "Use what you've learned! Try flour, sugar, butter, egg, milk, plus a flavor like cocoa or vanilla.",
        station: "pantry",
        check: (s) => s.bowl.length >= 5,
      },
      {
        instruction: "Whisk or knead the mixture properly",
        hint: "If it has yeast, knead to 60%. Otherwise whisk to 70%.",
        station: "mixing",
        check: (s) => s.mixLevel >= 0.7 || s.kneadLevel >= 0.6,
      },
      {
        instruction: "Bake at the right temperature until Golden",
        hint: "180°C is a safe choice. Watch the doneness label!",
        station: "oven",
        check: (s) =>
          s.baking.brownLevel >= 0.5 && s.baking.brownLevel <= 0.85,
      },
      {
        instruction: "Decorate with at least 4 toppings",
        hint: "Be creative! Mix glazes, sprinkles, fruit, and more.",
        station: "toppings",
        check: (s) => s.appliedToppings.length >= 4,
      },
      {
        instruction: "Serve to the customer and earn 5 stars!",
        hint: "If at first you don't succeed, try again with different ratios or decorations!",
        station: "showcase",
        check: (s) => s.customerRating >= 5,
      },
    ],
  },
]

export function getLesson(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id)
}

// ─── Fun facts (rotating, kid-friendly) ──────────────────────────────────

export const FUN_FACTS: string[] = [
  "🍞 The oldest known bread recipe is over 14,000 years old — older than the pyramids!",
  "🧈 Butter was discovered by accident when ancient people carried milk on horseback in leather bags.",
  "🥚 One chicken lays about 250-300 eggs per year. That's enough for 50 cakes!",
  "🍯 Honey never spoils. Pots of honey found in ancient Egyptian tombs are still edible today!",
  "🍫 Chocolate was once used as money by the Aztec people.",
  "🦠 Yeast is so tiny that one teaspoon contains about 10 billion living yeast cells!",
  "🌾 Wheat is the most grown crop on Earth — we plant enough to cover the entire country of India.",
  "🥄 The first measuring cups were just people's cupped hands. Now we use exact cups for better bakes!",
  "🔥 The Maillard reaction (browning) was named after a French scientist named Louis-Camille Maillard in 1912.",
  "🎂 The tradition of putting candles on birthday cakes started in ancient Greece for the goddess Artemis.",
  "🧂 Roman soldiers were sometimes paid in salt — that's where the word 'salary' comes from!",
  "💧 A single grain of sugar has about 1 billion (1,000,000,000) sugar molecules in it!",
  "🍞 The world's longest baguette was 132 meters (433 feet) — almost as long as a football field!",
  "🥛 Cows give about 25 liters of milk per day. That's enough to make 10 cakes!",
  "🌸 Vanilla comes from the pod of a special orchid flower that only blooms for one day a year.",
]

export function randomFunFact(): string {
  return FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)]
}
