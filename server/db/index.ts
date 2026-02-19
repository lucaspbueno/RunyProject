import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Conexão com o banco de dados PostgreSQL usando Drizzle ORM
 * Configurada para ambiente de produção/contêiner
 */

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL não está definida nas variáveis de ambiente");
}

// Configuração do cliente postgres para produção
const client = postgres(connectionString, {
  prepare: false,
});

// Export da instância do Drizzle com todos os schemas
export const db = drizzle(client, { schema });

// Export dos schemas para uso em toda aplicação
export * from "./schema";
