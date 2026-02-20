import "server-only";

import { TRPCError } from "@trpc/server";

/**
 * Verifica se o erro já é um TRPCError (evita importar TRPCError nos routers).
 */
export function isTRPCError(error: unknown): error is TRPCError {
  return error instanceof TRPCError;
}

/**
 * Verifica se o erro é uma violação de constraint unique do PostgreSQL (code 23505).
 */
export function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}

/**
 * Verifica se o erro é uma falha de conexão com o banco de dados.
 */
export function isConnectionError(error: unknown): boolean {
  return error instanceof Error && error.message.includes("ECONNREFUSED");
}

/**
 * Retorna TRPCError CONFLICT para violação de regra de negócio ou estado inválido.
 */
export function conflictError(message: string): TRPCError {
  return new TRPCError({
    code: "CONFLICT",
    message,
  });
}

/**
 * Retorna TRPCError INTERNAL_SERVER_ERROR genérico para operações com falha.
 * @param operation - descrição curta da operação (ex: "criar atleta")
 */
export function internalError(operation: string, cause?: unknown): TRPCError {
  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: `Falha ao ${operation}.`,
    cause,
  });
}

/**
 * Retorna TRPCError INTERNAL_SERVER_ERROR para falha de conexão com o banco.
 */
export function databaseConnectionError(cause?: unknown): TRPCError {
  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message:
      "Não foi possível conectar ao banco de dados. Verifique se o serviço está disponível.",
    cause,
  });
}
