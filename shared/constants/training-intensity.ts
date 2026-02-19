/**
 * Constantes compartilhadas para intensidade de treino
 * Fonte única da verdade para valores do enum usados em frontend e backend
 */

export const TRAINING_INTENSITY_VALUES = ["low", "moderate", "high"] as const;

export type TrainingIntensity = typeof TRAINING_INTENSITY_VALUES[number];
