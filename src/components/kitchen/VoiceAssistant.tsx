"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Mic,
  MicOff,
  X,
  Sparkles,
  Thermometer,
  Timer,
  Navigation,
  Power,
  Lightbulb,
  ChevronUp,
} from "lucide-react"
import { useKitchen } from "@/lib/kitchen-store"

interface VoiceAssistantProps {
  open: boolean
  onClose: () => void
}

// Web Speech API typings (browser-only)
type SpeechRecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((e: any) => void) | null
  onerror: ((e: any) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition?: { new (): SpeechRecognitionLike }
    webkitSpeechRecognition?: { new (): SpeechRecognitionLike }
  }
}

// ─── Quick command chips ─────────────────────────────────────────────────
// Pre-defined commands the user can tap to run instantly — no speaking needed.
// This makes the assistant useful even if the user doesn't want to talk.

interface QuickCommand {
  id: string
  label: string
  icon: typeof Navigation
  /** The text command to run through the same parser as voice input */
  command: string
  /** Group for visual organization */
  group: "navigate" | "oven" | "actions"
}

const QUICK_COMMANDS: QuickCommand[] = [
  // Navigate
  { id: "go-kitchen", label: "Kitchen", icon: Navigation, command: "open kitchen", group: "navigate" },
  { id: "go-school", label: "Bake School", icon: Navigation, command: "open school", group: "navigate" },
  { id: "go-pantry", label: "Pantry", icon: Navigation, command: "open pantry", group: "navigate" },
  { id: "go-mixing", label: "Mixing", icon: Navigation, command: "open mixing", group: "navigate" },
  { id: "go-oven", label: "Oven", icon: Navigation, command: "open oven", group: "navigate" },
  { id: "go-toppings", label: "Decorating", icon: Navigation, command: "open toppings", group: "navigate" },
  { id: "go-showcase", label: "Showcase", icon: Navigation, command: "open showcase", group: "navigate" },
  // Oven presets
  { id: "temp-180", label: "180°C", icon: Thermometer, command: "set oven to 180 degrees", group: "oven" },
  { id: "temp-200", label: "200°C", icon: Thermometer, command: "set oven to 200 degrees", group: "oven" },
  { id: "temp-220", label: "220°C", icon: Thermometer, command: "set oven to 220 degrees", group: "oven" },
  { id: "timer-15", label: "15 min", icon: Timer, command: "set timer for 15 minutes", group: "oven" },
  { id: "timer-25", label: "25 min", icon: Timer, command: "set timer for 25 minutes", group: "oven" },
  { id: "timer-45", label: "45 min", icon: Timer, command: "set timer for 45 minutes", group: "oven" },
  // Actions
  { id: "oven-on", label: "Oven On", icon: Power, command: "turn oven on", group: "actions" },
  { id: "oven-off", label: "Oven Off", icon: Power, command: "turn oven off", group: "actions" },
  { id: "oven-light", label: "Light", icon: Lightbulb, command: "toggle oven light", group: "actions" },
  { id: "mode-bake", label: "Bake", icon: Sparkles, command: "switch to bake mode", group: "actions" },
  { id: "mode-fan", label: "Fan", icon: Sparkles, command: "switch to fan mode", group: "actions" },
  { id: "mode-broil", label: "Broil", icon: Sparkles, command: "switch to broil mode", group: "actions" },
]

const COMMAND_GROUPS: { id: QuickCommand["group"]; label: string }[] = [
  { id: "navigate", label: "Go to" },
  { id: "oven", label: "Oven presets" },
  { id: "actions", label: "Quick actions" },
]

export function VoiceAssistant({ open, onClose }: VoiceAssistantProps) {
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [response, setResponse] = useState("")
  const [supported, setSupported] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const handleCommandRef = useRef<(text: string) => void>(() => {})

  const {
    setActiveStation,
    setOvenTemp,
    setOvenMode,
    setOvenOn,
    toggleOvenLight,
    setOvenTimer,
    pushLog,
    ovenTempC,
  } = useKitchen()

  const handleCommand = (text: string) => {
    pushLog(`Voice: "${text}"`, "voice")

    // Station navigation
    if (text.includes("kitchen") || text.includes("home")) {
      setActiveStation("bench")
      setResponse("Going to the Kitchen.")
      return
    }
    if (text.includes("school") || text.includes("lesson")) {
      setActiveStation("school")
      setResponse("Opening Bake School.")
      return
    }
    if (text.includes("pantry")) {
      setActiveStation("pantry")
      setResponse("Opening the Pantry.")
      return
    }
    if (text.includes("topping") || text.includes("decorat")) {
      setActiveStation("toppings")
      setResponse("Opening the Decorating Station.")
      return
    }
    if (text.includes("showcase") || text.includes("customer")) {
      setActiveStation("showcase")
      setResponse("Opening the Showcase.")
      return
    }
    if (text.includes("mix") && (text.includes("station") || text.includes("bowl"))) {
      setActiveStation("mixing")
      setResponse("Moving to the Mixing Station.")
      return
    }
    if (text.includes("mixer") || text.includes("stand mixer")) {
      setActiveStation("mixer")
      setResponse("Engaging the Stand Mixer.")
      return
    }
    if (text.includes("oven")) {
      setActiveStation("oven")
      setResponse("Opening the Smart Oven.")
      return
    }
    if (text.includes("sink") || text.includes("wash")) {
      setActiveStation("sink")
      setResponse("Heading to the Sink.")
      return
    }
    if (text.includes("recipe") || text.includes("export")) {
      setActiveStation("recipe")
      setResponse("Opening the Recipe Exporter.")
      return
    }

    // Oven temp
    const tempMatch = text.match(/(\d+)\s*(degree|celsius|°c|c)/)
    if (tempMatch) {
      const t = parseInt(tempMatch[1])
      setOvenTemp(t)
      setResponse(`Oven temperature set to ${t}°C.`)
      return
    }

    // Timer
    const timerMatch = text.match(/(\d+)\s*min/)
    if (timerMatch) {
      const m = parseInt(timerMatch[1])
      setOvenTimer(m * 60)
      setResponse(`Timer set to ${m} minutes.`)
      return
    }

    // Oven mode
    if (text.includes("broil")) { setOvenMode("broil"); setResponse("Switched to broil mode."); return }
    if (text.includes("fan") || text.includes("convection")) { setOvenMode("fan"); setResponse("Switched to fan mode."); return }
    if (text.includes("proof")) { setOvenMode("proof"); setResponse("Switched to proof mode."); return }
    if (text.includes("bake mode")) { setOvenMode("bake"); setResponse("Switched to bake mode."); return }

    // Oven on/off
    if ((text.includes("turn") || text.includes("switch")) && text.includes("oven") && (text.includes("on") || text.includes("off"))) {
      const on = text.includes("on")
      setOvenOn(on)
      setResponse(`Oven turned ${on ? "on" : "off"}.`)
      return
    }

    // Oven light
    if (text.includes("light")) {
      toggleOvenLight()
      setResponse("Toggled oven light.")
      return
    }

    setResponse(`Sorry, I didn't catch that. Try a quick command below, or say "open pantry", "set oven to 180 degrees", "set timer for 25 minutes".`)
  }

  // Keep the ref pointing at the latest handleCommand (which closes over latest store actions)
  useEffect(() => {
    handleCommandRef.current = handleCommand
  })

  useEffect(() => {
    if (typeof window === "undefined") return
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSupported(false)
      return
    }
    const rec = new SR()
    rec.lang = "en-US"
    rec.continuous = false
    rec.interimResults = false
    rec.onstart = () => {
      setListening(true)
      setResponse("")
    }
    rec.onresult = (e: any) => {
      const text = e.results[0][0].transcript.toLowerCase().trim()
      setTranscript(text)
      handleCommandRef.current(text)
    }
    rec.onerror = (e: any) => {
      setResponse(`Error: ${e.error ?? "unknown"}`)
      setListening(false)
    }
    rec.onend = () => {
      setListening(false)
    }
    recognitionRef.current = rec
    return () => {
      try {
        rec.abort()
      } catch {}
    }
  }, [])

  const startListening = () => {
    if (!recognitionRef.current) return
    setTranscript("")
    setResponse("")
    try {
      recognitionRef.current.start()
    } catch {}
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setListening(false)
  }

  const runQuickCommand = (cmd: QuickCommand) => {
    setTranscript(cmd.command)
    handleCommand(cmd.command)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.92 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-w-md print:hidden"
        >
          <div
            className="rounded-3xl overflow-hidden shadow-2xl border border-border/60"
            style={{
              background: "linear-gradient(180deg, #1a1410 0%, #2a1f17 100%)",
              boxShadow: "0 20px 50px -10px rgba(0,0,0,0.6), 0 0 0 1px rgba(252, 211, 77, 0.15)",
            }}
          >
            {/* ─── Top: mic + waveform area ─── */}
            <div className="relative p-5 pb-4">
              {/* Subtle amber glow background */}
              <div
                className="absolute inset-0 opacity-50 pointer-events-none"
                style={{
                  background: listening
                    ? "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(252, 211, 77, 0.25), transparent 70%)"
                    : "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(252, 211, 77, 0.08), transparent 70%)",
                }}
              />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
                aria-label="Close voice assistant"
              >
                <X className="w-4 h-4 text-amber-100" />
              </button>

              {/* Title */}
              <div className="relative flex items-center gap-2 mb-4">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #fcd34d, #b8602b)" }}
                >
                  <Mic className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-amber-50 leading-tight">HIRA Voice</div>
                  <div className="text-[10px] text-amber-200/60 leading-tight">
                    {listening ? "Listening..." : supported ? "Tap mic or use quick commands" : "Voice not supported"}
                  </div>
                </div>
              </div>

              {/* Mic button + waveform */}
              <div className="relative flex items-center justify-center gap-3 mb-3">
                {/* Waveform bars (visible while listening) */}
                <div className="flex items-center gap-0.5 h-12">
                  {listening &&
                    Array.from({ length: 5 }).map((_, i) => (
                      <motion.span
                        key={i}
                        className="w-1 rounded-full"
                        style={{
                          background: "linear-gradient(180deg, #fcd34d, #b8602b)",
                        }}
                        animate={{
                          height: [8, 24 + (i % 3) * 8, 8],
                        }}
                        transition={{
                          duration: 0.6 + (i % 3) * 0.15,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.08,
                        }}
                      />
                    ))}
                </div>

                {/* Mic button */}
                <button
                  onClick={listening ? stopListening : startListening}
                  disabled={!supported}
                  className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-95 ${
                    !supported ? "opacity-40 cursor-not-allowed" : ""
                  }`}
                  style={{
                    background: listening
                      ? "linear-gradient(135deg, #dc2626, #991b1b)"
                      : "linear-gradient(135deg, #fcd34d, #b8602b)",
                    boxShadow: listening
                      ? "0 0 24px rgba(220, 38, 38, 0.6), 0 4px 12px rgba(0,0,0,0.4)"
                      : "0 0 24px rgba(252, 211, 77, 0.4), 0 4px 12px rgba(0,0,0,0.4)",
                  }}
                  aria-label={listening ? "Stop listening" : "Start listening"}
                >
                  {listening ? (
                    <MicOff className="w-7 h-7 text-white" />
                  ) : (
                    <Mic className="w-7 h-7 text-white" />
                  )}
                  {/* Pulse rings while listening */}
                  {listening && (
                    <>
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-red-400"
                        animate={{ scale: [1, 1.5], opacity: [0.7, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                      />
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-red-400"
                        animate={{ scale: [1, 1.5], opacity: [0.7, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                      />
                    </>
                  )}
                </button>

                {/* Right waveform (mirrored) */}
                <div className="flex items-center gap-0.5 h-12">
                  {listening &&
                    Array.from({ length: 5 }).map((_, i) => (
                      <motion.span
                        key={i}
                        className="w-1 rounded-full"
                        style={{
                          background: "linear-gradient(180deg, #fcd34d, #b8602b)",
                        }}
                        animate={{
                          height: [8, 24 + ((4 - i) % 3) * 8, 8],
                        }}
                        transition={{
                          duration: 0.6 + ((4 - i) % 3) * 0.15,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.08,
                        }}
                      />
                    ))}
                </div>
              </div>

              {/* Transcript + response */}
              <AnimatePresence>
                {transcript && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-center mb-2"
                  >
                    <div className="text-[10px] uppercase tracking-wider text-amber-200/60 mb-0.5">You said</div>
                    <div className="text-sm italic text-amber-100">"{transcript}"</div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {response && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-center"
                  >
                    <div className="text-[10px] uppercase tracking-wider text-amber-300 mb-0.5">HIRA</div>
                    <div className="text-sm text-amber-50">{response}</div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!supported && (
                <p className="text-xs text-red-300 text-center mt-2">
                  Voice recognition needs Chrome or Edge. But you can still use the quick commands below!
                </p>
              )}
            </div>

            {/* ─── Quick commands (always visible — easier than talking) ─── */}
            <div
              className="px-4 pb-4 pt-1"
              style={{
                background: "rgba(0,0,0,0.25)",
                borderTop: "1px solid rgba(252, 211, 77, 0.15)",
              }}
            >
              {/* Quick command groups */}
              {COMMAND_GROUPS.map((group) => {
                const cmds = QUICK_COMMANDS.filter((c) => c.group === group.id)
                return (
                  <div key={group.id} className={expanded ? "" : "first:"}>
                    {/* Always show first group; collapse the rest until expanded */}
                    {(expanded || group.id === "navigate" || group.id === "oven") && (
                      <div className="mb-2 last:mb-0">
                        <div className="text-[10px] uppercase tracking-wider text-amber-200/50 font-semibold mb-1.5">
                          {group.label}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {cmds.map((cmd) => {
                            const Icon = cmd.icon
                            return (
                              <motion.button
                                key={cmd.id}
                                onClick={() => runQuickCommand(cmd)}
                                whileTap={{ scale: 0.94 }}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-all"
                                style={{
                                  background: "rgba(252, 211, 77, 0.12)",
                                  color: "#fef3c7",
                                  border: "1px solid rgba(252, 211, 77, 0.25)",
                                }}
                              >
                                <Icon className="w-3 h-3 opacity-80" />
                                {cmd.label}
                              </motion.button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Expand / collapse toggle */}
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-2 w-full flex items-center justify-center gap-1 text-[11px] text-amber-200/70 hover:text-amber-100 transition py-1"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="w-3 h-3" /> Show less
                  </>
                ) : (
                  <>
                    More commands
                    <motion.span
                      animate={{ rotate: expanded ? 180 : 0 }}
                    >
                      <ChevronUp className="w-3 h-3 rotate-180" />
                    </motion.span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
