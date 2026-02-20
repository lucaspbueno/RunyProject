import "server-only";

import { z } from "zod";
import { eq, desc, count, isNull, and } from "drizzle-orm";
import { publicProcedure, t } from "../trpc";
import { trainings, athletes } from "@/server/db/schema";
import {
  createTrainingSchema,
  updateTrainingSchema,
  listTrainingsByAthleteSchema,
  deleteTrainingSchema,
  getTrainingSchema,
  reactivateTrainingSchema,
} from "../../../shared/schemas/training-schema";
import type { PaginatedResponse } from "../../../shared/types";
import {
  athleteNotFound,
  trainingNotFound,
  conflictError,
  internalError,
  isTRPCError,
} from "../errors";

/**
 * Router tRPC para operações CRUD de treinos.
 * Todos os erros usam TRPCError com códigos semânticos.
 *
 * Regras P0.2 aplicadas:
 *  - Treino só pode ser criado para atleta ativo.
 *  - Treino inativo não pode ser editado.
 *  - Listagens são explícitas sobre incluir ou não inativos.
 *  - delete/reactivate validam estado atual antes de agir.
 */
export const trainingRouter = t.router({
  /**
   * Criar novo treino.
   * Regra P0.2: atleta deve estar ativo.
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
          "Não é possível criar treinos para um atleta desativado.",
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
   * Regra P0.2: verifica existência do atleta; inativos incluídos apenas se solicitado.
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
   * Buscar treino por ID.
   * Retorna o treino independente de status (ativo/inativo).
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
   * Atualizar treino existente.
   * Regra P0.2: treino inativo não pode ser editado.
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

      const [existing] = await ctx.db
        .select()
        .from(trainings)
        .where(eq(trainings.id, id));

      if (!existing) {
        throw trainingNotFound();
      }

      if (existing.deletedAt) {
        throw conflictError("Não é possível editar um treino desativado.");
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
   * Regra P0.2: treino já inativo retorna CONFLICT.
   */
  delete: publicProcedure
    .input(deleteTrainingSchema)
    .mutation(async ({ input, ctx }) => {
      const [existing] = await ctx.db
        .select()
        .from(trainings)
        .where(eq(trainings.id, input.id));

      if (!existing) {
        throw trainingNotFound();
      }

      if (existing.deletedAt) {
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
   * Regra P0.2: treino já ativo retorna CONFLICT.
   */
  reactivate: publicProcedure
    .input(reactivateTrainingSchema)
    .mutation(async ({ input, ctx }) => {
      const [existing] = await ctx.db
        .select()
        .from(trainings)
        .where(eq(trainings.id, input.id));

      if (!existing) {
        throw trainingNotFound();
      }

      if (!existing.deletedAt) {
        throw conflictError("Treino já está ativo.");
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
