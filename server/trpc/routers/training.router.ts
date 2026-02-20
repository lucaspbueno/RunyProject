import "server-only";

import { z } from "zod";
import { and, count, desc, eq, isNull } from "drizzle-orm";
import { publicProcedure, t } from "../trpc";
import { athletes, trainings } from "@/server/db/schema";
import {
  createTrainingSchema,
  deleteTrainingSchema,
  getTrainingSchema,
  listTrainingsByAthleteSchema,
  reactivateTrainingSchema,
  updateTrainingSchema,
} from "@/shared/schemas/training-schema";
import type { PaginatedResponse } from "@/shared/types";
import {
  athleteNotFound,
  conflictError,
  internalError,
  isTRPCError,
  trainingNotFound,
} from "@/server/trpc/errors";

/**
 * Router tRPC para operações CRUD de treinos.
 * Todos os erros usam TRPCError com códigos semânticos.

 * Regras de ativo/inativo aplicadas via guards de status-policy.ts:
 *  - getById       → retorna independente do status (leitura total)
 *  - create        → ❌ CONFLICT se atleta inativo
 *  - listByAthlete → leitura histórica permitida para qualquer atleta;
 *                    treinos inativos visíveis apenas com includeDeleted=true
 *  - update        → ❌ CONFLICT se treino inativo
 *                  → ❌ CONFLICT se atleta inativo
 *  - delete        → ❌ CONFLICT se treino já inativo
 *  - reactivate    → ❌ CONFLICT se treino já ativo
 *                  → ❌ CONFLICT se atleta inativo
 */
export const trainingRouter = t.router({
  /**
   * Buscar treino por ID.
   * Retorna o treino independente do status (ativo/inativo) —
   * necessário para telas de detalhe, auditoria e reativação.
   */
  getById: publicProcedure
    .input(getTrainingSchema)
    .query(async ({ input, ctx }) => {
      const [training] = await ctx.db
        .select()
        .from(trainings)
        .where(eq(trainings.id, input.id));

      if (!training) {
        throw trainingNotFound();
      }

      return training;
    }),

  /**
   * Criar novo treino.
   * Regra: atleta deve estar ativo.
   * Treino é sempre criado com deletedAt = null (ativo).
   */
  create: publicProcedure
    .input(createTrainingSchema)
    .mutation(async ({ input, ctx }) => {
      const [athlete] = await ctx.db
        .select()
        .from(athletes)
        .where(eq(athletes.id, input.athleteId));

      if (!athlete) {
        throw athleteNotFound();
      }

      if (athlete.deletedAt) {
        throw conflictError(
          "Não é possível realizar esta operação em treinos de um atleta desativado.",
        );
      }

      try {
        const [training] = await ctx.db
          .insert(trainings)
          .values(input)
          .returning();

        return { success: true, data: training };
      } catch (error) {
        if (isTRPCError(error)) throw error;

        throw internalError("criar treino", error);
      }
    }),

  /**
   * Listar treinos de um atleta com paginação.
   * Leitura histórica: permitida mesmo que o atleta esteja inativo.
   * Apenas a existência do atleta é verificada (404 se não encontrado).
   * Treinos inativos são incluídos somente com includeDeleted=true.
   */
  listByAthlete: publicProcedure
    .input(listTrainingsByAthleteSchema)
    .query(async ({ input, ctx }) => {
      const { athleteId, page = 1, limit = 10, includeDeleted = false } = input;
      const offset = (page - 1) * limit;

      const [athlete] = await ctx.db
        .select()
        .from(athletes)
        .where(eq(athletes.id, athleteId));

      if (!athlete) {
        throw athleteNotFound();
      }

      try {
        const baseCondition = eq(trainings.athleteId, athleteId);
        const whereCondition = includeDeleted
          ? baseCondition
          : and(baseCondition, isNull(trainings.deletedAt));

        const [{ count: totalCount }] = await ctx.db
          .select({ count: count() })
          .from(trainings)
          .where(whereCondition);

        const items = await ctx.db
          .select()
          .from(trainings)
          .where(whereCondition)
          .orderBy(desc(trainings.createdAt))
          .limit(limit)
          .offset(offset);

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

        throw internalError("listar treinos", error);
      }
    }),

  /**
   * Atualizar treino existente.
   * Regra: treino inativo não pode ser editado.
   * Regra: atleta inativo não pode ter treinos editados.
   */
  update: publicProcedure
    .input(
      z.object({
        id: z.coerce.number().int().positive(),
        data: updateTrainingSchema,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, data } = input;

      const [training] = await ctx.db
        .select()
        .from(trainings)
        .where(eq(trainings.id, id));

      if (!training) {
        throw trainingNotFound();
      }

      if (training.deletedAt) {
        throw conflictError("Não é possível editar um treino desativado.");
      }

      const [athlete] = await ctx.db
        .select()
        .from(athletes)
        .where(eq(athletes.id, training.athleteId));

      if (!athlete) {
        throw athleteNotFound();
      }

      if (athlete.deletedAt) {
        throw conflictError(
          "Não é possível realizar esta operação em treinos de um atleta desativado.",
        );
      }

      try {
        const [training] = await ctx.db
          .update(trainings)
          .set({
            ...data,
            updatedAt: new Date(),
          })
          .where(eq(trainings.id, id))
          .returning();

        return { success: true, data: training };
      } catch (error) {
        if (isTRPCError(error)) throw error;

        throw internalError("atualizar treino", error);
      }
    }),

  /**
   * Desativar treino (soft-delete).
   * Regra: treino já inativo retorna CONFLICT.
   * Nota: desativar treino de atleta inativo é permitido (reduz inconsistência de dados).
   */
  delete: publicProcedure
    .input(deleteTrainingSchema)
    .mutation(async ({ input, ctx }) => {
      const [training] = await ctx.db
        .select()
        .from(trainings)
        .where(eq(trainings.id, input.id));

      if (!training) {
        throw trainingNotFound();
      }

      if (training.deletedAt) {
        throw conflictError("Treino já está desativado.");
      }

      try {
        const [training] = await ctx.db
          .update(trainings)
          .set({
            deletedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(trainings.id, input.id))
          .returning();

        return { success: true, data: training };
      } catch (error) {
        if (isTRPCError(error)) throw error;

        throw internalError("desativar treino", error);
      }
    }),

  /**
   * Reativar treino (remove soft-delete).
   * Regra: treino já ativo retorna CONFLICT.
   * Regra: atleta inativo não pode ter treinos reativados.
   *        (reativar criaria um treino ativo para um atleta inativo, violando a regra de domínio)
   */
  reactivate: publicProcedure
    .input(reactivateTrainingSchema)
    .mutation(async ({ input, ctx }) => {
      const [training] = await ctx.db
        .select()
        .from(trainings)
        .where(eq(trainings.id, input.id));

      if (!training) {
        throw trainingNotFound();
      }

      if (!training.deletedAt) {
        throw conflictError("Treino já está ativo.");
      }

      const [athlete] = await ctx.db
        .select()
        .from(athletes)
        .where(eq(athletes.id, training.athleteId));

      if (!athlete) {
        throw athleteNotFound();
      }

      if (athlete.deletedAt) {
        throw conflictError(
          "Não é possível realizar esta operação em treinos de um atleta desativado.",
        );
      }

      try {
        const [training] = await ctx.db
          .update(trainings)
          .set({
            deletedAt: null,
            updatedAt: new Date(),
          })
          .where(eq(trainings.id, input.id))
          .returning();

        return { success: true, data: training };
      } catch (error) {
        if (isTRPCError(error)) throw error;

        throw internalError("reativar treino", error);
      }
    }),
});
