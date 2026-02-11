import {
  type InferInsertModel,
  type InferSelectModel,
  relations
} from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar
} from "drizzle-orm/pg-core";
import { athletes } from "./athlete";

export const trainingIntensity = pgEnum("training_intensity", [
  "low",
  "moderate",
  "high",
]);

export const trainings = pgTable("trainings", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  athleteId: integer("athlete_id")
    .notNull()
    .references(() => athletes.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 100 }).notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  intensity: trainingIntensity("intensity").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const trainingsRelations = relations(trainings, ({ one }) => ({
  athlete: one(athletes, {
    fields: [trainings.athleteId],
    references: [athletes.id],
  }),
}));

export type Training = InferSelectModel<typeof trainings>;
export type NewTraining = InferInsertModel<typeof trainings>;
