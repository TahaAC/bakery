"use client"

import { motion } from "framer-motion"

interface HiraLogoProps {
  size?: number
  /** Whether to animate (used in header/banner) */
  animated?: boolean
  /** Show the wordmark next to the icon */
  withWordmark?: boolean
  className?: string
}

/**
 * Custom HIRA Bakery Logo
 *
 * Design: A stylized "H" formed by two wheat stalks (left + right columns
 * of the H) connected by a chef-hat-crowned rolling pin (the crossbar).
 * Color palette: warm copper + amber + cream — matches the bakery theme.
 *
 * The wheat grains represent baking ingredients, the rolling pin represents
 * the craft, and the chef hat represents the "bakery" identity.
 */
export function HiraLogo({
  size = 40,
  animated = false,
  withWordmark = false,
  className,
}: HiraLogoProps) {
  return (
    <div className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <motion.svg
        viewBox="0 0 80 80"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
        animate={animated ? { y: [0, -2, 0] } : {}}
        transition={animated ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : {}}
        aria-label="HIRA Bakery logo"
        role="img"
      >
        <defs>
          {/* Copper gradient for the H structure */}
          <linearGradient id="hira-copper" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fcd34d" />
            <stop offset="40%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#7c2d12" />
          </linearGradient>
          {/* Amber gradient for wheat grains */}
          <linearGradient id="hira-amber" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
          {/* Cream gradient for chef hat */}
          <linearGradient id="hira-cream" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fffbeb" />
            <stop offset="100%" stopColor="#fde68a" />
          </linearGradient>
          {/* Soft shadow filter */}
          <filter id="hira-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1.2" />
            <feOffset dx="0" dy="1" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.4" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ─── Background rounded square (subtle) ─── */}
        <rect
          x="4" y="4" width="72" height="72" rx="18"
          fill="url(#hira-copper)"
          opacity="0.08"
        />

        {/* ─── Left column of H (wheat stalk) ─── */}
        <g filter="url(#hira-shadow)">
          {/* Central stem - left */}
          <rect x="20" y="22" width="3.5" height="40" rx="1.5" fill="url(#hira-copper)" />
          {/* Wheat grains - left side of stem */}
          {[24, 30, 36, 42, 48, 54].map((y, i) => (
            <g key={`l-${i}`}>
              <ellipse
                cx="16" cy={y} rx="3.5" ry="2"
                fill="url(#hira-amber)"
                transform={`rotate(-35 16 ${y})`}
              />
              <ellipse
                cx="27.5" cy={y} rx="3.5" ry="2"
                fill="url(#hira-amber)"
                transform={`rotate(35 27.5 ${y})`}
              />
            </g>
          ))}
          {/* Top tip - left */}
          <path d="M 21.75 22 L 19 16 L 24.5 16 Z" fill="url(#hira-copper)" />
        </g>

        {/* ─── Right column of H (wheat stalk) └── */}
        <g filter="url(#hira-shadow)">
          {/* Central stem - right */}
          <rect x="56.5" y="22" width="3.5" height="40" rx="1.5" fill="url(#hira-copper)" />
          {/* Wheat grains - right side of stem */}
          {[24, 30, 36, 42, 48, 54].map((y, i) => (
            <g key={`r-${i}`}>
              <ellipse
                cx="52.5" cy={y} rx="3.5" ry="2"
                fill="url(#hira-amber)"
                transform={`rotate(-35 52.5 ${y})`}
              />
              <ellipse
                cx="64" cy={y} rx="3.5" ry="2"
                fill="url(#hira-amber)"
                transform={`rotate(35 64 ${y})`}
              />
            </g>
          ))}
          {/* Top tip - right */}
          <path d="M 58.25 22 L 55.5 16 L 61 16 Z" fill="url(#hira-copper)" />
        </g>

        {/* ─── Crossbar of H (rolling pin with chef hat) ─── */}
        <g filter="url(#hira-shadow)">
          {/* Rolling pin barrel */}
          <rect x="23" y="38" width="34" height="7" rx="3.5" fill="url(#hira-copper)" />
          {/* Rolling pin handles (small caps on each end) */}
          <circle cx="22" cy="41.5" r="2.5" fill="#7c2d12" />
          <circle cx="58" cy="41.5" r="2.5" fill="#7c2d12" />
          {/* Highlight on the barrel */}
          <rect x="25" y="39" width="30" height="1.5" rx="0.75" fill="#fffbeb" opacity="0.6" />

          {/* Chef hat on top of the rolling pin (centered) */}
          {/* Hat brim */}
          <ellipse cx="40" cy="32" rx="9" ry="2" fill="url(#hira-cream)" />
          {/* Hat puff */}
          <ellipse cx="36" cy="28" rx="4" ry="3.5" fill="url(#hira-cream)" />
          <ellipse cx="40" cy="26" rx="4.5" ry="4" fill="url(#hira-cream)" />
          <ellipse cx="44" cy="28" rx="4" ry="3.5" fill="url(#hira-cream)" />
          {/* Hat subtle shadow line */}
          <ellipse cx="40" cy="33" rx="8.5" ry="0.8" fill="#b45309" opacity="0.3" />
        </g>

        {/* ─── Bottom subtle base shadow ─── */}
        <ellipse cx="40" cy="68" rx="22" ry="2" fill="#7c2d12" opacity="0.15" />
      </motion.svg>

      {withWordmark && (
        <div className="flex flex-col leading-none">
          <span
            className="font-bold tracking-tight"
            style={{
              fontSize: size * 0.42,
              color: "#1a1410",
              lineHeight: 1,
            }}
          >
            HIRA
          </span>
          <span
            className="font-semibold tracking-widest uppercase"
            style={{
              fontSize: size * 0.2,
              color: "#b45309",
              letterSpacing: "0.2em",
              marginTop: 2,
            }}
          >
            Bakery
          </span>
        </div>
      )}
    </div>
  )
}

/**
 * Simplified HIRA logo mark — just the icon, no wordmark.
 * Used in tight spaces like the browser favicon.
 */
export function HiraLogoMark({ size = 32 }: { size?: number }) {
  return <HiraLogo size={size} />
}
