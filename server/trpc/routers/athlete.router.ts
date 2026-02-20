import "server-only";

import { z } from "zod";
import { count, desc, eq, isNull, and, gte, lte } from "drizzle-orm";
import { publicProcedure, t } from "../trpc";
import { athletes, trainings } from "@/server/db/schema";
import {
  createAthleteSchema,
  deleteAthleteSchema,
  getAthleteSchema,
  listAthletesSchema,
  reactivateAthleteSchema,
  updateAthleteSchema,
} from "@/shared/schemas/athlete-schema";
import { athleteInsightsInputSchema } from "@/shared/schemas/athlete-insights-schema";
import type { PaginatedResponse } from "@/shared/types";
import {
  athleteNotFound,
  conflictError,
  databaseConnectionError,
  internalError,
  isConnectionError,
  isTRPCError,
  isUniqueViolation,
} from "@/server/trpc/errors";
import { buildAthleteInsights } from "@/server/services/insights/athlete-insights.service";

/**
 * Normaliza períodos de data para consultas
 */
function normalizePeriods(
  period: string,
  fromDate?: string,
  toDate?: string,
  compare?: boolean
) {
  let currentPeriod: { from: Date; to: Date };
  let comparePeriod: { from: Date; to: Date } | undefined;

  if (period === "custom" && fromDate && toDate) {
    currentPeriod = {
      from: new Date(fromDate),
      to: new Date(toDate),
    };
  } else {
    const days = parseInt(period);
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - days + 1);
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);
    
    currentPeriod = { from, to };
  }

  if (compare && currentPeriod) {
    const periodDays = Math.ceil((currentPeriod.to.getTime() - currentPeriod.from.getTime()) / (1000 * 60 * 60 * 24));
    const compareTo = new Date(currentPeriod.from);
    compareTo.setDate(compareTo.getDate() - 1);
    const compareFrom = new Date(compareTo);
    compareFrom.setDate(compareFrom.getDate() - periodDays + 1);
    
    comparePeriod = {
      from: compareFrom,
      to: compareTo,
    };
  }

  return { currentPeriod, comparePeriod };
}

/**
 * Router tRPC para operações CRUD de atletas.
 * Todos os erros usam TRPCError com códigos semânticos.
 *
 * Regras de ativo/inativo aplicadas via guards de status-policy.ts:
 *  - getById     → retorna independente do status (leitura total)
 *  - create      → sempre cria como ativo
 *  - list        → ativos por padrão; includeDeleted=true mostra todos
 *  - update      → ❌ CONFLICT se atleta inativo
 *  - delete      → ❌ CONFLICT se atleta já inativo
 *  - reactivate  → ❌ CONFLICT se atleta já ativo
 */
export const athleteRouter = t.router({
  /**
   * Buscar atleta por ID.
   * Retorna o atleta independente do status (ativo/inativo) —
   * necessário para telas de detalhe, auditoria e reativação.
   */
  getById: publicProcedure
    .input(getAthleteSchema)
    .query(async ({ input, ctx }) => {
      const [athlete] = await ctx.db
        .select()
        .from(athletes)
        .where(eq(athletes.id, input.id));

      if (!athlete) {
        throw athleteNotFound();
      }

      return athlete;
    }),

  /**
   * Criar novo atleta.
   * Sempre cria com deletedAt = null (ativo).
   */
  create: publicProcedure
    .input(createAthleteSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const [athlete] = await ctx.db
          .insert(athletes)
          .values({
            ...input,
            dateOfBirth: new Date(input.dateOfBirth),
          })
          .returning();

        return { success: true, data: athlete };
      } catch (error) {
        if (isUniqueViolation(error)) {
          throw conflictError(
            "Já existe um atleta cadastrado com este e-mail.",
          );
        }

        if (isConnectionError(error)) {
          throw databaseConnectionError(error);
        }

        throw internalError("criar atleta", error);
      }
    }),

  /**
   * Listar atletas com paginação.
   * Por padrão exibe apenas ativos; inativos visíveis com includeDeleted=true.
   */
  list: publicProcedure
    .input(listAthletesSchema)
    .query(async ({ input, ctx }) => {
      const { page = 1, limit = 10, includeDeleted = false } = input;
      const offset = (page - 1) * limit;

      try {
        const totalCountQuery = ctx.db
          .select({ count: count() })
          .from(athletes);

        const [{ count: totalCount }] = includeDeleted
          ? await totalCountQuery
          : await totalCountQuery.where(isNull(athletes.deletedAt));

        const itemsQuery = ctx.db
          .select()
          .from(athletes)
          .orderBy(desc(athletes.createdAt))
          .limit(limit)
          .offset(offset);

        const items = includeDeleted
          ? await itemsQuery
          : await itemsQuery.where(isNull(athletes.deletedAt));

        const totalPages = Math.ceil(totalCount / limit);

        const response: PaginatedResponse<(typeof items)[0]> = {
          items,
          totalCount,
          currentPage: page,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        };

        return response;
      } catch (error) {
        if (isTRPCError(error)) throw error;

        if (isConnectionError(error)) {
          throw databaseConnectionError(error);
        }

        throw internalError("listar atletas", error);
      }
    }),

  /**
   * Atualizar atleta existente.
   * Regra: atleta inativo não pode ser editado.
   */
  update: publicProcedure
    .input(
      z.object({
        id: z.coerce.number().int().positive(),
        data: updateAthleteSchema,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, data } = input;

      const [athlete] = await ctx.db
        .select()
        .from(athletes)
        .where(eq(athletes.id, id));

      if (!athlete) {
        throw athleteNotFound();
      }

      if (athlete.deletedAt) {
        throw conflictError("Não é possível editar um atleta desativado.");
      }

      try {
        const { dateOfBirth: dateOfBirthStr, ...rest } = data;

        const updateData = {
          ...rest,
          updatedAt: new Date(),
          ...(dateOfBirthStr ? { dateOfBirth: new Date(dateOfBirthStr) } : {}),
        };

        const [athlete] = await ctx.db
          .update(athletes)
          .set(updateData)
          .where(eq(athletes.id, id))
          .returning();

        return { success: true, data: athlete };
      } catch (error) {
        if (isTRPCError(error)) throw error;

        if (isUniqueViolation(error)) {
          throw conflictError(
            "Já existe um atleta cadastrado com este e-mail.",
          );
        }

        throw internalError("atualizar atleta", error);
      }
    }),

  /**
   * Desativar atleta (soft-delete).
   * Regra: atleta já inativo retorna CONFLICT.
   */
  delete: publicProcedure
    .input(deleteAthleteSchema)
    .mutation(async ({ input, ctx }) => {
      const [athlete] = await ctx.db
        .select()
        .from(athletes)
        .where(eq(athletes.id, input.id));

      if (!athlete) {
        throw athleteNotFound();
      }

      if (athlete.deletedAt) {
        throw conflictError("Atleta já está desativado.");
      }

      try {
        const [athlete] = await ctx.db
          .update(athletes)
          .set({
            deletedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(athletes.id, input.id))
          .returning();

        return { success: true, data: athlete };
      } catch (error) {
        if (isTRPCError(error)) throw error;

        throw internalError("desativar atleta", error);
      }
    }),

  /**
   * Reativar atleta (remove soft-delete).
   * Regra: atleta já ativo retorna CONFLICT.
   */
  reactivate: publicProcedure
    .input(reactivateAthleteSchema)
    .mutation(async ({ input, ctx }) => {
      const [athlete] = await ctx.db
        .select()
        .from(athletes)
        .where(eq(athletes.id, input.id));

      if (!athlete) {
        throw athleteNotFound();
      }

      if (athlete.deletedAt) {
        throw conflictError("Atleta já está desativado.");
      }

      try {
        const [athlete] = await ctx.db
          .update(athletes)
          .set({
            deletedAt: null,
            updatedAt: new Date(),
          })
          .where(eq(athletes.id, input.id))
          .returning();

        return { success: true, data: athlete };
      } catch (error) {
        if (isTRPCError(error)) throw error;

        throw internalError("reativar atleta", error);
      }
    }),

  /**
   * Buscar insights de um atleta.
   * Retorna métricas, distribuições, séries temporais e insights inteligentes.
   */
  getInsights: publicProcedure
    .input(athleteInsightsInputSchema)
    .query(async ({ input, ctx }) => {
      const { athleteId, period, fromDate, toDate, compare, intensityFilter, trainingTypeFilter } = input;

      try {
        // 1. Validar que o atleta existe
        const [athlete] = await ctx.db
          .select()
          .from(athletes)
          .where(eq(athletes.id, athleteId));

        if (!athlete) {
          throw athleteNotFound();
        }

        // 2. Normalizar o período
        const { currentPeriod, comparePeriod } = normalizePeriods(period, fromDate, toDate, compare);

        // 3. Buscar treinos do período atual
        const trainingsCurrent = await ctx.db
          .select()
          .from(trainings)
          .where(
            and(
              eq(trainings.athleteId, athleteId),
              gte(trainings.createdAt, currentPeriod.from),
              lte(trainings.createdAt, currentPeriod.to),
              isNull(trainings.deletedAt)
            )
          );

        // 4. Buscar treinos do período de comparação (se aplicável)
        let trainingsCompare: typeof trainingsCurrent = [];
        if (compare && comparePeriod) {
          trainingsCompare = await ctx.db
            .select()
            .from(trainings)
            .where(
              and(
                eq(trainings.athleteId, athleteId),
                gte(trainings.createdAt, comparePeriod.from),
                lte(trainings.createdAt, comparePeriod.to),
                isNull(trainings.deletedAt)
              )
            );
        }

        // 5. Montar e retornar insights
        return buildAthleteInsights({
          trainingsCurrent,
          trainingsCompare: compare ? trainingsCompare : undefined,
          period: currentPeriod,
          comparePeriod: compare ? comparePeriod : undefined,
          intensityFilter,
          trainingTypeFilter,
        });

      } catch (error) {
        if (isTRPCError(error)) throw error;

        if (isConnectionError(error)) {
          throw databaseConnectionError(error);
        }

        throw internalError("buscar insights do atleta", error);
      }
    }),
});
