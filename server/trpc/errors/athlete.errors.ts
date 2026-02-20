import "server-only";

import { TRPCError } from "@trpc/server";

/**
 * Retorna TRPCError NOT_FOUND padronizado para a entidade Athlete.
 */
export function athleteNotFound(): TRPCError {
  return new TRPCError({
    code: "NOT_FOUND",
    message: "Atleta não encontrado.",
  });
}
