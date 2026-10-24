import { HiraLogo } from "@/components/kitchen/HiraLogo"

/**
 * Next.js Suspense fallback — shown while route segments load.
 * Branded with HIRA Bakery logo + animated whisk spinner.
 */
export default function Loading() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-8 p-6"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 30%, #fff8e8 0%, #f0dca8 50%, #c89858 100%)",
      }}
    >
      {/* Animated logo */}
      <div className="animate-pulse">
        <HiraLogo size={120} />
      </div>

      {/* Brand name */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">
          HIRA <span className="text-amber-700">Bakery</span>
        </h1>
        <p className="text-sm text-stone-700/70 mt-1">
          Warming up the oven...
        </p>
      </div>

      {/* Animated whisk / progress dots */}
      <div className="flex items-center gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="block w-2.5 h-2.5 rounded-full bg-amber-700"
            style={{
              animation: `hira-bounce 1s ease-in-out ${i * 0.12}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Inline keyframes — only loaded on this page */}
      <style>{`
        @keyframes hira-bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
