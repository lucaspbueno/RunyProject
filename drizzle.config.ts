import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("ERROR: Variable DATABASE_URL not defined in .env file");
}

export default defineConfig({
  out: "./server/db/migrations",
  schema: "./server/db/schema/drizzle.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  strict: true,
  verbose: true,
});
