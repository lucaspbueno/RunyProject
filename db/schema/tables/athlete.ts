import { type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { date, varchar } from "drizzle-orm/pg-core";
import { withBaseColumns } from "./base";

export const athletes = withBaseColumns("athletes", {
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  dateOfBirth: date("date_of_birth", { mode: "date" }).notNull(),
});

export type Athlete = InferSelectModel<typeof athletes>;
export type NewAthlete = InferInsertModel<typeof athletes>;
