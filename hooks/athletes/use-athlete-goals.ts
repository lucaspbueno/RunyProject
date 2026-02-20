"use client";

import { useCallback, useMemo, useState } from "react";
import type { AthleteGoals } from "@/shared/types/domain/athlete-goals";

const DEFAULT_GOALS: AthleteGoals = {
  weeklyMinutesGoal: 150,
  weeklyTrainingsGoal: 3,
};

const clampInt = (value: number, min: number, max: number) => {
  if (Number.isNaN(value)) return min;
  return Math.max(min, Math.min(max, Math.trunc(value)));
};

const normalizeGoals = (
  goals: Partial<AthleteGoals> | null | undefined,
): AthleteGoals => {
  const weeklyMinutesGoal = clampInt(
    Number(goals?.weeklyMinutesGoal ?? DEFAULT_GOALS.weeklyMinutesGoal),
    0,
    2000,
  );
  const weeklyTrainingsGoal = clampInt(
    Number(goals?.weeklyTrainingsGoal ?? DEFAULT_GOALS.weeklyTrainingsGoal),
    0,
    14,
  );

  return { weeklyMinutesGoal, weeklyTrainingsGoal };
};

const makeStorageKey = (athleteId: string) => `runy:athlete-goals:${athleteId}`;

function loadFromStorage(athleteId: string): AthleteGoals {
  if (typeof window === "undefined") return DEFAULT_GOALS;

  try {
    const raw = window.localStorage.getItem(makeStorageKey(athleteId));
    if (!raw) return DEFAULT_GOALS;
    const parsed = JSON.parse(raw) as Partial<AthleteGoals>;
    return normalizeGoals(parsed);
  } catch {
    return DEFAULT_GOALS;
  }
}

export function useAthleteGoals(athleteId: string) {
  const storageKey = useMemo(() => makeStorageKey(athleteId), [athleteId]);

  // Lazy initialization - only runs once on mount, client-safe
  const [goals, setGoalsState] = useState<AthleteGoals>(() =>
    loadFromStorage(athleteId),
  );

  const isLoaded = typeof window !== "undefined";

  // Track previous athleteId to detect changes
  const [prevAthleteId, setPrevAthleteId] = useState(athleteId);

  // Derived state pattern: update when athleteId changes
  if (prevAthleteId !== athleteId) {
    setPrevAthleteId(athleteId);
    setGoalsState(loadFromStorage(athleteId));
  }

  const saveGoals = useCallback(
    (next: Partial<AthleteGoals>) => {
      const normalized = normalizeGoals({ ...goals, ...next });
      setGoalsState(normalized);
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(normalized));
        return { ok: true as const };
      } catch {
        return {
          ok: false as const,
          error: "Não foi possível salvar as metas no navegador.",
        };
      }
    },
    [goals, storageKey],
  );

  const resetGoals = useCallback(() => {
    setGoalsState(DEFAULT_GOALS);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(DEFAULT_GOALS));
      return { ok: true as const };
    } catch {
      return {
        ok: false as const,
        error: "Não foi possível resetar as metas no navegador.",
      };
    }
  }, [storageKey]);

  return { goals, saveGoals, resetGoals, isLoaded };
}
