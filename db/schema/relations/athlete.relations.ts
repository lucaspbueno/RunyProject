import { relations } from "drizzle-orm";
import { athletes, trainings } from "../index";

export const athletesRelations = relations(athletes, ({ many }) => ({
  trainings: many(trainings),
}));
