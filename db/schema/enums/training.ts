import { pgEnum } from "drizzle-orm/pg-core";

export const trainingIntensity = pgEnum("training_intensity", [
  "low",
  "moderate",
  "high",
]);
