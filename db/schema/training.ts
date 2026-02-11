import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

import { athletes } from "./athlete";

export const trainingIntensityEnum = pgEnum("training_intensity", ["leve", "moderado", "intenso"]);

export const trainings = pgTable("trainings", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  athleteId: integer("athlete_id")
    .notNull()
    .references(() => athletes.id, { onDelete: "cascade", onUpdate: "cascade" }),
  type: varchar("type", { length: 100 }).notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  intensity: trainingIntensityEnum("intensity").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const trainingRelations = relations(trainings, ({ one }) => ({
  athlete: one(athletes, {
    fields: [trainings.athleteId],
    references: [athletes.id],
  }),
}));

export type Training = typeof trainings.$inferSelect;
export type NewTraining = typeof trainings.$inferInsert;
