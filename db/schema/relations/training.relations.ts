import { relations } from "drizzle-orm";
import { athletes, trainings } from "../index";

export const trainingsRelations = relations(trainings, ({ one }) => ({
  athlete: one(athletes, {
    fields: [trainings.athleteId],
    references: [athletes.id],
  }),
}));
