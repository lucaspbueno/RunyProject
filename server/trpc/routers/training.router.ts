import "server-only";

import { z } from "zod";
import { eq, desc, count } from "drizzle-orm";
import { publicProcedure, t } from "../trpc";
import { trainings, athletes } from "@/server/db/schema";
import {
  createTrainingSchema,
  updateTrainingSchema,
  listTrainingsByAthleteSchema,
  deleteTrainingSchema,
  type CreateTrainingInput,
  type UpdateTrainingInput,
  type ListTrainingsByAthleteInput,
  type DeleteTrainingInput,
} from "../../../shared/schemas/training-schema";
import type { PaginatedResponse } from "../../../shared/types";

/**
 * Router tRPC para operações CRUD de treinos
 * Inclui validação Zod e paginação por atleta
 */

export const trainingRouter = t.router({
  /**
   * Criar novo treino
   */
  create: publicProcedure
    .input(createTrainingSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Verificar se atleta existe
        const [athlete] = await ctx.db
          .select()
          .from(athletes)
          .where(eq(athletes.id, input.athleteId));

        if (!athlete) {
          throw new Error("Atleta não encontrado");
        }

        const [training] = await ctx.db
          .insert(trainings)
          .values(input)
          .returning();

        return {
          success: true,
          data: training,
        };
      } catch (error) {
        console.error("Erro ao criar treino:", error);
        throw new Error("Falha ao criar treino");
      }
    }),

  /**
   * Listar treinos de um atleta com paginação
   */
  listByAthlete: publicProcedure
    .input(listTrainingsByAthleteSchema)
    .query(async ({ input, ctx }) => {
      const { athleteId, page = 1, limit = 10 } = input;
      const offset = (page - 1) * limit;

      try {
        // Verificar se atleta existe
        const [athlete] = await ctx.db
          .select()
          .from(athletes)
          .where(eq(athletes.id, athleteId));

        if (!athlete) {
          throw new Error("Atleta não encontrado");
        }

        // Buscar total de registros
        const [{ count: totalCount }] = await ctx.db
          .select({ count: count() })
          .from(trainings)
          .where(eq(trainings.athleteId, athleteId));

        // Buscar registros paginados
        const items = await ctx.db
          .select()
          .from(trainings)
          .where(eq(trainings.athleteId, athleteId))
          .orderBy(desc(trainings.createdAt))
          .limit(limit)
          .offset(offset);

        const totalPages = Math.ceil(totalCount / limit);

        const response: PaginatedResponse<typeof items[0]> = {
          items,
          totalCount,
          currentPage: page,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        };

        return response;
      } catch (error) {
        console.error("Erro ao listar treinos:", error);
        throw new Error("Falha ao listar treinos");
      }
    }),

  /**
   * Atualizar treino existente
   */
  update: publicProcedure
    .input(z.object({
      id: z.coerce.number().int().positive(),
      data: updateTrainingSchema,
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, data } = input;

      try {
        const [training] = await ctx.db
          .update(trainings)
          .set({
            ...data,
            updatedAt: new Date(),
          })
          .where(eq(trainings.id, id))
          .returning();

        if (!training) {
          throw new Error("Treino não encontrado");
        }

        return {
          success: true,
          data: training,
        };
      } catch (error) {
        console.error("Erro ao atualizar treino:", error);
        throw new Error("Falha ao atualizar treino");
      }
    }),

  /**
   * Excluir treino
   */
  delete: publicProcedure
    .input(deleteTrainingSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const [training] = await ctx.db
          .delete(trainings)
          .where(eq(trainings.id, input.id))
          .returning();

        if (!training) {
          throw new Error("Treino não encontrado");
        }

        return {
          success: true,
          data: training,
        };
      } catch (error) {
        console.error("Erro ao excluir treino:", error);
        throw new Error("Falha ao excluir treino");
      }
    }),
});
