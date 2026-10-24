import Link from "next/link"
import { HiraLogo } from "@/components/kitchen/HiraLogo"
import { Home, GraduationCap } from "lucide-react"

/**
 * Custom HIRA Bakery 404 page.
 * Friendly tone — explains the page is "still in the oven".
 */
export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6 p-6"
      style={{
        background:
          "radial-gradient(ellipse 90% 70% at 50% 25%, #fff5d8 0%, #f0dca8 40%, #c89858 80%, #6a4520 100%)",
      }}
    >
      {/* Animated logo */}
      <div className="animate-bounce">
        <HiraLogo size={120} />
      </div>

      {/* 404 + tagline */}
      <div className="text-center">
        <div
          className="text-7xl sm:text-8xl font-bold tracking-tighter"
          style={{
            background: "linear-gradient(135deg, #7c2d12, #b45309, #fcd34d)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          404
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mt-2 text-stone-900">
          This page is still in the oven!
        </h1>
        <p className="text-sm sm:text-base text-stone-700/80 mt-2 max-w-md mx-auto">
          We couldn&apos;t find the page you were looking for. Don&apos;t worry — let&apos;s get
          you back to baking something delicious.
        </p>
      </div>

      {/* Sad cupcake illustration */}
      <SadCupcake />

      {/* CTA buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/"
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white shadow-lg active:scale-95 transition"
          style={{
            background: "linear-gradient(135deg, #b8602b 0%, #d97706 100%)",
            boxShadow: "0 6px 16px -4px rgba(184, 96, 43, 0.5)",
          }}
        >
          <Home className="w-4 h-4" />
          Back to Kitchen
        </Link>
        <Link
          href="/"
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-white border-2 border-amber-300 text-amber-900 hover:bg-amber-50 active:scale-95 transition"
        >
          <GraduationCap className="w-4 h-4" />
          Visit Bake School
        </Link>
      </div>

      {/* Footer hint */}
      <p className="text-[10px] text-stone-700/60 mt-4">
        HIRA Bakery · Modern Virtual Baking Kitchen
      </p>
    </div>
  )
}

/**
 * Sad cupcake illustration — a cupcake with a frown and a tear.
 * Server-rendered SVG with CSS animation for the tear drop.
 */
function SadCupcake() {
  return (
    <div className="relative" style={{ width: 120, height: 120 }}>
      <svg viewBox="0 0 120 120" width={120} height={120} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cupcake-wrapper" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fcd34d" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
          <linearGradient id="cupcake-frosting" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff5d8" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>

        {/* Wrapper / cup */}
        <path
          d="M 30 70 L 35 110 L 85 110 L 90 70 Z"
          fill="url(#cupcake-wrapper)"
        />
        {/* Wrapper ridges */}
        {[40, 50, 60, 70, 80].map((x, i) => (
          <line
            key={i}
            x1={x}
            y1="70"
            x2={x + (x - 60) * 0.15}
            y2="110"
            stroke="#7c2d12"
            strokeWidth="1"
            opacity="0.4"
          />
        ))}

        {/* Frosting swirl */}
        <path
          d="M 25 70 Q 30 50 50 50 Q 60 35 75 45 Q 95 40 95 60 Q 100 70 90 75 L 30 75 Q 20 70 25 70 Z"
          fill="url(#cupcake-frosting)"
        />
        {/* Frosting highlight */}
        <ellipse cx="50" cy="55" rx="10" ry="3" fill="#fffbeb" opacity="0.6" />

        {/* Sad eyes */}
        <ellipse cx="48" cy="62" rx="3" ry="4" fill="#1a1410" />
        <ellipse cx="72" cy="62" rx="3" ry="4" fill="#1a1410" />
        {/* Sad eyebrows (angled) */}
        <line x1="44" y1="56" x2="50" y2="58" stroke="#1a1410" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="76" y1="56" x2="70" y2="58" stroke="#1a1410" strokeWidth="1.5" strokeLinecap="round" />
        {/* Sad mouth */}
        <path d="M 55 72 Q 60 68 65 72" stroke="#1a1410" strokeWidth="1.5" fill="none" strokeLinecap="round" />

        {/* Single tear drop with animation */}
        <ellipse cx="48" cy="68" rx="1.5" ry="2.5" fill="#7fb3d5" opacity="0.8">
          <animate attributeName="cy" values="68;78;68" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
        </ellipse>

        {/* Cherry on top */}
        <circle cx="60" cy="38" r="5" fill="#dc2626" />
        <ellipse cx="58" cy="36" rx="1.5" ry="1" fill="#fca5a5" opacity="0.8" />
        {/* Cherry stem */}
        <path d="M 60 33 Q 64 28 67 30" stroke="#16a34a" strokeWidth="1.5" fill="none" strokeLinecap="round" />

        {/* Sprinkles */}
        <ellipse cx="35" cy="58" rx="2" ry="0.8" fill="#3b82f6" transform="rotate(45 35 58)" />
        <ellipse cx="85" cy="56" rx="2" ry="0.8" fill="#ec4899" transform="rotate(-30 85 56)" />
        <ellipse cx="42" cy="68" rx="2" ry="0.8" fill="#10b981" transform="rotate(60 42 68)" />
        <ellipse cx="80" cy="68" rx="2" ry="0.8" fill="#f59e0b" transform="rotate(-50 80 68)" />
      </svg>
    </div>
  )
}
