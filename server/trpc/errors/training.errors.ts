import "server-only";

import { TRPCError } from "@trpc/server";

/**
 * Retorna TRPCError NOT_FOUND padronizado para treino.
 */
export function trainingNotFound(): TRPCError {
  return new TRPCError({
    code: "NOT_FOUND",
    message: "Treino não encontrado.",
  });
}
