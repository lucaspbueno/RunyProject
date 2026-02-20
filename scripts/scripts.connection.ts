import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/server/db/schema/drizzle";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL não está definida nas variáveis de ambiente");
}

const client = postgres(connectionString, { prepare: false });

export const dbScripts = drizzle(client, { schema });