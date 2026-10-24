"use client"

import { useEffect, useRef } from "react"
import { useKitchen, type BowlIngredient, type AppliedTopping, type BakingState } from "@/lib/kitchen-store"
import { getLesson, type LessonCheckContext } from "@/lib/lessons"

/**
 * Watches the kitchen store and:
 *  1. Advances the active lesson when the current step's check predicate passes.
 *  2. Auto-unlocks achievement badges based on store state changes.
 *
 * This hook is mounted once at the top of KitchenApp and runs forever.
 */
export function useLessonTracker() {
  const bowl = useKitchen((s) => s.bowl)
  const mixLevel = useKitchen((s) => s.mixLevel)
  const kneadLevel = useKitchen((s) => s.kneadLevel)
  const ovenOn = useKitchen((s) => s.ovenOn)
  const ovenTempC = useKitchen((s) => s.ovenTempC)
  const baking = useKitchen((s) => s.baking)
  const appliedToppings = useKitchen((s) => s.appliedToppings)
  const servedToCustomer = useKitchen((s) => s.servedToCustomer)
  const customerRating = useKitchen((s) => s.customerRating)
  const sliceCount = useKitchen((s) => s.sliceCount)
  const activeLessonId = useKitchen((s) => s.activeLessonId)
  const activeLessonStep = useKitchen((s) => s.activeLessonStep)
  const advanceLessonStep = useKitchen((s) => s.advanceLessonStep)
  const unlockBadge = useKitchen((s) => s.unlockBadge)
  const unlockedBadges = useKitchen((s) => s.unlockedBadges)

  // Track previous values to detect first-time achievements
  const prevBowlLen = useRef(0)
  const prevMixLevel = useRef(0)
  const prevKneadLevel = useRef(0)
  const prevBakingStatus = useRef<string>("idle")
  const prevBrownLevel = useRef(0)
  const prevToppingCount = useRef(0)
  const prevServed = useRef(false)
  const prevRating = useRef(0)

  // ─── Lesson step advancement ───
  useEffect(() => {
    if (!activeLessonId) return
    const lesson = getLesson(activeLessonId)
    if (!lesson) return
    const step = lesson.steps[activeLessonStep]
    if (!step) return

    const ctx: LessonCheckContext = {
      bowl,
      mixLevel,
      kneadLevel,
      ovenOn,
      ovenTempC,
      baking,
      appliedToppings,
      servedToCustomer,
      customerRating,
      sliceCount,
    }

    if (step.check(ctx)) {
      // Small delay so the kid sees their action register
      const t = setTimeout(() => advanceLessonStep(), 800)
      return () => clearTimeout(t)
    }
  }, [
    activeLessonId,
    activeLessonStep,
    bowl,
    mixLevel,
    kneadLevel,
    ovenOn,
    ovenTempC,
    baking,
    appliedToppings,
    servedToCustomer,
    customerRating,
    sliceCount,
    advanceLessonStep,
  ])

  // ─── Auto-unlock achievement badges ───
  useEffect(() => {
    // First ingredient added
    if (bowl.length > 0 && prevBowlLen.current === 0 && !unlockedBadges.includes("first-ingredient")) {
      unlockBadge("first-ingredient")
    }
    prevBowlLen.current = bowl.length

    // First mix to 50%
    if (mixLevel >= 0.5 && prevMixLevel.current < 0.5 && !unlockedBadges.includes("first-mix")) {
      unlockBadge("first-mix")
    }
    prevMixLevel.current = mixLevel

    // Gluten development to 50%
    if (kneadLevel >= 0.5 && prevKneadLevel.current < 0.5 && !unlockedBadges.includes("gluten-builder")) {
      unlockBadge("gluten-builder")
    }
    prevKneadLevel.current = kneadLevel

    // First bake completed (status transitions to "done")
    if (baking.status === "done" && prevBakingStatus.current !== "done" && !unlockedBadges.includes("first-bake")) {
      unlockBadge("first-bake")
    }
    prevBakingStatus.current = baking.status

    // Golden crust (0.5 - 0.85)
    if (
      baking.brownLevel >= 0.5 &&
      baking.brownLevel <= 0.85 &&
      prevBrownLevel.current < 0.5 &&
      !unlockedBadges.includes("golden-crust")
    ) {
      unlockBadge("golden-crust")
    }
    prevBrownLevel.current = baking.brownLevel

    // Decorator: 3+ toppings
    if (appliedToppings.length >= 3 && prevToppingCount.current < 3 && !unlockedBadges.includes("decorator")) {
      unlockBadge("decorator")
    }
    prevToppingCount.current = appliedToppings.length

    // First customer served
    if (servedToCustomer && !prevServed.current && !unlockedBadges.includes("first-customer")) {
      unlockBadge("first-customer")
    }
    prevServed.current = servedToCustomer

    // Five-star rating
    if (customerRating >= 5 && prevRating.current < 5 && !unlockedBadges.includes("five-stars")) {
      unlockBadge("five-stars")
    }
    prevRating.current = customerRating
  }, [
    bowl.length,
    mixLevel,
    kneadLevel,
    baking.status,
    baking.brownLevel,
    appliedToppings.length,
    servedToCustomer,
    customerRating,
    unlockedBadges,
    unlockBadge,
  ])
}
