import { type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { integer, text, varchar } from "drizzle-orm/pg-core";
import { trainingIntensity } from "../enums/training";
import { athletes, withBaseColumns } from "./index";

export const trainings = withBaseColumns("trainings", {
  athleteId: integer("athlete_id")
    .notNull()
    .references(() => athletes.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 100 }).notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  intensity: trainingIntensity("intensity").notNull(),
  notes: text("notes"),
});

export type Training = InferSelectModel<typeof trainings>;
export type NewTraining = InferInsertModel<typeof trainings>;
