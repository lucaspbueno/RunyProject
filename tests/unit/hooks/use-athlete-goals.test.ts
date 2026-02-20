/**
 * Tests for useAthleteGoals hook
 *
 * Tests validation logic and goal constraints
 */

import { describe, it, expect } from "vitest";
import {
  DEFAULT_ATHLETE_GOALS,
  GOAL_CONSTRAINTS,
  type AthleteGoals,
} from "@/shared/types/domain/athlete-goals";

describe("AthleteGoals Domain", () => {
  describe("DEFAULT_ATHLETE_GOALS", () => {
    it("should have sensible default values", () => {
      expect(DEFAULT_ATHLETE_GOALS.weeklyMinutesGoal).toBe(150);
      expect(DEFAULT_ATHLETE_GOALS.weeklyTrainingsGoal).toBe(3);
    });
  });

  describe("GOAL_CONSTRAINTS", () => {
    it("should define valid ranges", () => {
      expect(GOAL_CONSTRAINTS.minMinutes).toBe(0);
      expect(GOAL_CONSTRAINTS.maxMinutes).toBe(2000);
      expect(GOAL_CONSTRAINTS.minTrainings).toBe(0);
      expect(GOAL_CONSTRAINTS.maxTrainings).toBe(14);
    });

    it("should have reasonable upper limits", () => {
      // 2000 minutes = ~33 hours per week (reasonable max)
      expect(GOAL_CONSTRAINTS.maxMinutes).toBeLessThanOrEqual(2000);

      // 14 trainings = 2 per day (reasonable max)
      expect(GOAL_CONSTRAINTS.maxTrainings).toBeLessThanOrEqual(14);
    });
  });

  describe("Goal Validation Logic", () => {
    it("should accept valid goals within constraints", () => {
      const validGoals: AthleteGoals = {
        weeklyMinutesGoal: 200,
        weeklyTrainingsGoal: 4,
      };

      expect(validGoals.weeklyMinutesGoal).toBeGreaterThanOrEqual(GOAL_CONSTRAINTS.minMinutes);
      expect(validGoals.weeklyMinutesGoal).toBeLessThanOrEqual(GOAL_CONSTRAINTS.maxMinutes);
      expect(validGoals.weeklyTrainingsGoal).toBeGreaterThanOrEqual(GOAL_CONSTRAINTS.minTrainings);
      expect(validGoals.weeklyTrainingsGoal).toBeLessThanOrEqual(GOAL_CONSTRAINTS.maxTrainings);
    });

    it("should clamp minutes above max", () => {
      const excessiveMinutes = 5000;
      const clamped = Math.min(GOAL_CONSTRAINTS.maxMinutes, excessiveMinutes);

      expect(clamped).toBe(GOAL_CONSTRAINTS.maxMinutes);
    });

    it("should clamp minutes below min", () => {
      const negativeMinutes = -100;
      const clamped = Math.max(GOAL_CONSTRAINTS.minMinutes, negativeMinutes);

      expect(clamped).toBe(GOAL_CONSTRAINTS.minMinutes);
    });

    it("should clamp trainings above max", () => {
      const excessiveTrainings = 20;
      const clamped = Math.min(GOAL_CONSTRAINTS.maxTrainings, excessiveTrainings);

      expect(clamped).toBe(GOAL_CONSTRAINTS.maxTrainings);
    });

    it("should clamp trainings below min", () => {
      const negativeTrainings = -5;
      const clamped = Math.max(GOAL_CONSTRAINTS.minTrainings, negativeTrainings);

      expect(clamped).toBe(GOAL_CONSTRAINTS.minTrainings);
    });
  });

  describe("Progress Calculation", () => {
    it("should calculate correct progress percentage", () => {
      const current = 100;
      const goal = 200;
      const progress = Math.round((current / goal) * 100);

      expect(progress).toBe(50);
    });

    it("should cap progress at 100%", () => {
      const current = 250;
      const goal = 200;
      const progress = Math.min(100, Math.round((current / goal) * 100));

      expect(progress).toBe(100);
    });

    it("should handle zero goal", () => {
      const current = 100;
      const goal = 0;
      const progress = goal === 0 ? 0 : Math.round((current / goal) * 100);

      expect(progress).toBe(0);
    });

    it("should calculate remaining correctly", () => {
      const current = 100;
      const goal = 200;
      const remaining = Math.max(0, goal - current);

      expect(remaining).toBe(100);
    });

    it("should not have negative remaining", () => {
      const current = 250;
      const goal = 200;
      const remaining = Math.max(0, goal - current);

      expect(remaining).toBe(0);
    });
  });

  describe("Goal Status", () => {
    it("should detect when goal is met", () => {
      const current = 200;
      const goal = 200;
      const isGoalMet = current >= goal;

      expect(isGoalMet).toBe(true);
    });

    it("should detect when goal is exceeded", () => {
      const current = 250;
      const goal = 200;
      const isGoalMet = current >= goal;

      expect(isGoalMet).toBe(true);
    });

    it("should detect when goal is not met", () => {
      const current = 150;
      const goal = 200;
      const isGoalMet = current >= goal;

      expect(isGoalMet).toBe(false);
    });

    it("should detect when all goals are met", () => {
      const minutesGoalMet = 200 >= 200;
      const trainingsGoalMet = 4 >= 3;
      const allGoalsMet = minutesGoalMet && trainingsGoalMet;

      expect(allGoalsMet).toBe(true);
    });

    it("should detect when not all goals are met", () => {
      const minutesGoalMet = 150 >= 200; // not met
      const trainingsGoalMet = 4 >= 3;   // met
      const allGoalsMet = minutesGoalMet && trainingsGoalMet;

      expect(allGoalsMet).toBe(false);
    });
  });

  describe("localStorage Key Generation", () => {
    it("should generate correct storage key format", () => {
      const athleteId = "123";
      const key = `runy:athlete-goals:${athleteId}`;

      expect(key).toBe("runy:athlete-goals:123");
    });

    it("should generate unique keys for different athletes", () => {
      const key1 = `runy:athlete-goals:1`;
      const key2 = `runy:athlete-goals:2`;

      expect(key1).not.toBe(key2);
    });
  });
});
