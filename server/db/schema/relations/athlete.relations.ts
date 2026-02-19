import "server-only";

import { relations } from "drizzle-orm";
import { athletes, trainings } from "../tables";

export const athletesRelations = relations(athletes, ({ many }) => ({
  trainings: many(trainings),
}));
