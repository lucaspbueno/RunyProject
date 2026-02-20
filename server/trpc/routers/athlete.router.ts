import "server-only";

import { z } from "zod";
import { eq, desc, count, isNull } from "drizzle-orm";
import { publicProcedure, t } from "../trpc";
import { athletes } from "@/server/db/schema";
import {
  createAthleteSchema,
  updateAthleteSchema,
  listAthletesSchema,
  getAthleteSchema,
  deleteAthleteSchema,
  reactivateAthleteSchema,
} from "../../../shared/schemas/athlete-schema";
import type { PaginatedResponse } from "../../../shared/types";
import {
  athleteNotFound,
  conflictError,
  databaseConnectionError,
  internalError,
  isConnectionError,
  isTRPCError,
  isUniqueViolation,
} from "../errors";

/**
 * Router tRPC para operações CRUD de atletas.
 * Todos os erros usam TRPCError com códigos semânticos.
 */
export const athleteRouter = t.router({
  /**
   * Buscar atleta por ID.
   * Retorna o atleta independente de status (ativo/inativo).
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
   * Regra P0.2: atleta inativo não pode ser editado.
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

      const [existing] = await ctx.db
        .select()
        .from(athletes)
        .where(eq(athletes.id, id));

      if (!existing) {
        throw athleteNotFound();
      }

      if (existing.deletedAt) {
        throw conflictError("Não é possível editar um atleta desativado.");
      }

      try {
        // Separar dateOfBirth para conversão de string → Date sem usar any
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
   * Regra P0.2: atleta já inativo retorna CONFLICT.
   */
  delete: publicProcedure
    .input(deleteAthleteSchema)
    .mutation(async ({ input, ctx }) => {
      const [existing] = await ctx.db
        .select()
        .from(athletes)
        .where(eq(athletes.id, input.id));

      if (!existing) {
        throw athleteNotFound();
      }

      if (existing.deletedAt) {
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
   * Regra P0.2: atleta já ativo retorna CONFLICT.
   */
  reactivate: publicProcedure
    .input(reactivateAthleteSchema)
    .mutation(async ({ input, ctx }) => {
      const [existing] = await ctx.db
        .select()
        .from(athletes)
        .where(eq(athletes.id, input.id));

      if (!existing) {
        throw athleteNotFound();
      }

      if (!existing.deletedAt) {
        throw conflictError("Atleta já está ativo.");
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
});
