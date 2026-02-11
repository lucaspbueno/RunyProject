import { pgTable, timestamp, integer } from "drizzle-orm/pg-core";

/**
 * Helper para criar tabelas com colunas base padronizadas:
 * - id (integer, identity, PK)
 * - created_at (timestamp with time zone, default now)
 * - updated_at (timestamp with time zone, default now)
 * - deleted_at (timestamp with time zone, nullable) para soft-delete
 */
export function withBaseColumns<TColumns extends Record<string, any>>(
  tableName: string,
  columns: TColumns,
) {
  return pgTable(tableName, {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    ...columns,
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }).nullable(),
  });
}
