/**
 * Athlete Goals Domain Types
 *
 * Defines the structure for athlete weekly goals.
 * Goals are stored in localStorage and are athlete-specific.
 */

/**
 * Weekly goals for an athlete
 */
export interface AthleteGoals {
  /** Target total minutes of training per week */
  weeklyMinutesGoal: number;

  /** Target number of training sessions per week */
  weeklyTrainingsGoal: number;
}

/**
 * Default values for athlete goals
 */
export const DEFAULT_ATHLETE_GOALS: AthleteGoals = {
  weeklyMinutesGoal: 150,  // WHO recommendation for adults
  weeklyTrainingsGoal: 3,   // Sensible default for consistency
};

/**
 * Validation constraints for goals
 */
export const GOAL_CONSTRAINTS = {
  minMinutes: 0,
  maxMinutes: 2000,
  minTrainings: 0,
  maxTrainings: 14,
} as const;

/**
 * Progress towards weekly goals
 */
export interface WeeklyProgress {
  /** Current minutes completed this week */
  currentMinutes: number;

  /** Current number of trainings completed this week */
  currentTrainings: number;

  /** Target minutes for the week */
  goalMinutes: number;

  /** Target trainings for the week */
  goalTrainings: number;

  /** Progress percentage for minutes (0-100+) */
  minutesProgress: number;

  /** Progress percentage for trainings (0-100+) */
  trainingsProgress: number;

  /** Whether both goals are met */
  isComplete: boolean;
}
