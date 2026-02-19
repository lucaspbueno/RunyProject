import "server-only";

import { z } from "zod";
import { eq, desc, count, ilike } from "drizzle-orm";
import { publicProcedure, t } from "../trpc";
import { athletes } from "@/server/db/schema";
import {
  createAthleteSchema,
  updateAthleteSchema,
  listAthletesSchema,
  deleteAthleteSchema,
  type CreateAthleteInput,
  type UpdateAthleteInput,
  type ListAthletesInput,
  type DeleteAthleteInput,
} from "../../../shared/schemas/athlete-schema";
import type { PaginatedResponse } from "../../../shared/types";

/**
 * Router tRPC para operações CRUD de atletas
 * Inclui validação Zod e paginação
 */

export const athleteRouter = t.router({
  /**
   * Criar novo atleta
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

        return {
          success: true,
          data: athlete,
        };
      } catch (error) {
        console.error("Erro ao criar atleta:", error);
        throw new Error("Falha ao criar atleta");
      }
    }),

  /**
   * Listar atletas com paginação e busca
   */
  list: publicProcedure
    .input(listAthletesSchema)
    .query(async ({ input, ctx }) => {
      const { page = 1, limit = 10 } = input;
      const offset = (page - 1) * limit;

      try {
        // Buscar total de registros
        const [{ count: totalCount }] = await ctx.db
          .select({ count: count() })
          .from(athletes);

        // Buscar registros paginados
        const items = await ctx.db
          .select()
          .from(athletes)
          .orderBy(desc(athletes.createdAt))
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
        console.error("Erro ao listar atletas:", error);
        throw new Error("Falha ao listar atletas");
      }
    }),

  /**
   * Atualizar atleta existente
   */
  update: publicProcedure
    .input(z.object({
      id: z.coerce.number().int().positive(),
      data: updateAthleteSchema,
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, data } = input;

      try {
        const updateData: any = {
          ...data,
          updatedAt: new Date(),
        };
        
        if (data.dateOfBirth) {
          updateData.dateOfBirth = new Date(data.dateOfBirth);
        }

        const [athlete] = await ctx.db
          .update(athletes)
          .set(updateData)
          .where(eq(athletes.id, id))
          .returning();

        if (!athlete) {
          throw new Error("Atleta não encontrado");
        }

        return {
          success: true,
          data: athlete,
        };
      } catch (error) {
        console.error("Erro ao atualizar atleta:", error);
        throw new Error("Falha ao atualizar atleta");
      }
    }),

  /**
   * Excluir atleta
   */
  delete: publicProcedure
    .input(deleteAthleteSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const [athlete] = await ctx.db
          .delete(athletes)
          .where(eq(athletes.id, input.id))
          .returning();

        if (!athlete) {
          throw new Error("Atleta não encontrado");
        }

        return {
          success: true,
          data: athlete,
        };
      } catch (error) {
        console.error("Erro ao excluir atleta:", error);
        throw new Error("Falha ao excluir atleta");
      }
    }),
});
