/**
 * useAthleteGoals Hook
 *
 * Manages athlete weekly goals using localStorage.
 * Goals are athlete-specific and persist across sessions.
 * SSR-safe: only accesses localStorage on the client.
 */

import { useState } from "react";
import {
  type AthleteGoals,
  DEFAULT_ATHLETE_GOALS,
  GOAL_CONSTRAINTS,
} from "@/shared/types/domain/athlete-goals";

const STORAGE_KEY_PREFIX = "runy:athlete-goals:";

/**
 * Validates and clamps goal values to acceptable ranges
 */
function validateGoals(goals: Partial<AthleteGoals>): AthleteGoals {
  const minutesGoal = Math.max(
    GOAL_CONSTRAINTS.minMinutes,
    Math.min(
      GOAL_CONSTRAINTS.maxMinutes,
      goals.weeklyMinutesGoal ?? DEFAULT_ATHLETE_GOALS.weeklyMinutesGoal,
    ),
  );

  const trainingsGoal = Math.max(
    GOAL_CONSTRAINTS.minTrainings,
    Math.min(
      GOAL_CONSTRAINTS.maxTrainings,
      goals.weeklyTrainingsGoal ?? DEFAULT_ATHLETE_GOALS.weeklyTrainingsGoal,
    ),
  );

  return {
    weeklyMinutesGoal: minutesGoal,
    weeklyTrainingsGoal: trainingsGoal,
  };
}

/**
 * Gets storage key for a specific athlete
 */
function getStorageKey(athleteId: string): string {
  return `${STORAGE_KEY_PREFIX}${athleteId}`;
}

/**
 * Loads goals from localStorage (client-side only)
 */
function loadGoalsFromStorage(athleteId: string): AthleteGoals {
  if (typeof window === "undefined") {
    return DEFAULT_ATHLETE_GOALS;
  }

  try {
    const stored = localStorage.getItem(getStorageKey(athleteId));
    if (!stored) {
      return DEFAULT_ATHLETE_GOALS;
    }

    const parsed = JSON.parse(stored) as Partial<AthleteGoals>;
    return validateGoals(parsed);
  } catch (error) {
    console.warn("Failed to load athlete goals from localStorage:", error);
    return DEFAULT_ATHLETE_GOALS;
  }
}

/**
 * Saves goals to localStorage (client-side only)
 */
function saveGoalsToStorage(athleteId: string, goals: AthleteGoals): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(getStorageKey(athleteId), JSON.stringify(goals));
  } catch (error) {
    console.error("Failed to save athlete goals to localStorage:", error);
    throw error;
  }
}

export interface UseAthleteGoalsReturn {
  /** Current goals for the athlete */
  goals: AthleteGoals;

  /** Whether goals are loaded (client-side only) */
  isLoaded: boolean;

  /** Updates goals and persists to localStorage */
  setGoals: (goals: AthleteGoals) => void;

  /** Resets goals to defaults */
  resetGoals: () => void;
}

/**
 * Hook to manage athlete weekly goals
 *
 * @param athleteId - The athlete's ID
 * @returns Goals state and setter functions
 *
 * @example
 * ```tsx
 * const { goals, isLoaded, setGoals } = useAthleteGoals(athleteId);
 *
 * if (!isLoaded) return null;
 *
 * return (
 *   <div>
 *     <input
 *       value={goals.weeklyMinutesGoal}
 *       onChange={(e) => setGoals({ ...goals, weeklyMinutesGoal: +e.target.value })}
 *     />
 *   </div>
 * );
 * ```
 */
export function useAthleteGoals(athleteId: string): UseAthleteGoalsReturn {
  // SSR-safe: lazy initialization only runs once on client
  const [goals, setGoalsState] = useState<AthleteGoals>(() =>
    loadGoalsFromStorage(athleteId),
  );

  // Track if we're on client side
  const isLoaded = typeof window !== "undefined";

  // Handle athleteId changes by directly updating state
  // This is acceptable as it's driven by prop change, not arbitrary effect
  const [prevAthleteId, setPrevAthleteId] = useState(athleteId);

  if (prevAthleteId !== athleteId) {
    setPrevAthleteId(athleteId);
    const loaded = loadGoalsFromStorage(athleteId);
    setGoalsState(loaded);
  }

  const setGoals = (newGoals: AthleteGoals) => {
    const validated = validateGoals(newGoals);
    setGoalsState(validated);
    saveGoalsToStorage(athleteId, validated);
  };

  const resetGoals = () => {
    setGoalsState(DEFAULT_ATHLETE_GOALS);
    saveGoalsToStorage(athleteId, DEFAULT_ATHLETE_GOALS);
  };

  return {
    goals,
    isLoaded,
    setGoals,
    resetGoals,
  };
}
