"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, MicOff, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useKitchen, type StationId } from "@/lib/kitchen-store"

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

export function VoiceAssistant({ open, onClose }: VoiceAssistantProps) {
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [response, setResponse] = useState("")
  const [supported, setSupported] = useState(true)
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
    if (text.includes("pantry")) {
      setActiveStation("pantry")
      setResponse("Opening the Pantry.")
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

    setResponse(`Sorry, I didn't catch that. Try: "set oven to 180 degrees", "open pantry", "set timer for 25 minutes".`)
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
      setResponse("Listening…")
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

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 right-6 z-50 w-80 rounded-2xl border-2 border-primary/40 bg-card shadow-2xl overflow-hidden print:hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-primary text-primary-foreground px-4 py-2.5">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4" />
              <span className="text-sm font-semibold">Voice Assistant</span>
            </div>
            <button onClick={onClose} aria-label="Close voice assistant">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mic visualization */}
          <div className="relative p-6 flex flex-col items-center gap-3">
            <div className="relative w-20 h-20">
              {listening && (
                <>
                  <div className="voice-pulse" />
                  <div className="voice-pulse" style={{ animationDelay: "0.5s" }} />
                </>
              )}
              <button
                onClick={listening ? stopListening : startListening}
                disabled={!supported}
                className={`absolute inset-0 rounded-full flex items-center justify-center transition ${
                  listening
                    ? "bg-destructive text-destructive-foreground"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                } ${!supported ? "opacity-50 cursor-not-allowed" : ""}`}
                aria-label={listening ? "Stop listening" : "Start listening"}
              >
                {listening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>
            </div>

            {!supported && (
              <p className="text-xs text-destructive text-center">
                Voice recognition not supported in this browser. Try Chrome or Edge.
              </p>
            )}

            {transcript && (
              <div className="w-full rounded-md bg-muted/50 p-2 text-xs">
                <div className="text-[10px] uppercase text-muted-foreground mb-0.5">You said</div>
                <div className="italic">"{transcript}"</div>
              </div>
            )}

            {response && (
              <div className="w-full rounded-md bg-primary/10 border border-primary/30 p-2 text-xs">
                <div className="text-[10px] uppercase text-primary mb-0.5">Assistant</div>
                <div>{response}</div>
              </div>
            )}

            <div className="w-full text-[10px] text-muted-foreground text-center mt-1">
              Try: "open pantry", "set oven to 180", "set timer for 25 minutes", "switch to broil"
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
