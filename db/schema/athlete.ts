import {
  type InferInsertModel,
  type InferSelectModel,
  relations,
} from "drizzle-orm";
import {
  date,
  integer,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { trainings } from "./training";

export const athletes = pgTable("athletes", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  dateOfBirth: date("date_of_birth", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const athletesRelations = relations(athletes, ({ many }) => ({
  trainings: many(trainings),
}));

export type Athlete = InferSelectModel<typeof athletes>;
export type NewAthlete = InferInsertModel<typeof athletes>;
