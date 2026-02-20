import "server-only";

import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import type { Context } from "./context";

/**
 * Inicialização do tRPC com configurações padrão
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

/**
 * Middleware para logging de requisições.
 *
 * Em caso de sucesso registra método, caminho e duração.
 * Em caso de falha registra, adicionalmente, o código TRPCError,
 * a mensagem e a causa original — preservando o contexto completo
 * para fins de observabilidade e depuração.
 */
const loggerMiddleware = t.middleware(async ({ path, type, next }) => {
  const start = Date.now();
  const result = await next();
  const durationMs = Date.now() - start;

  let label = `[tRPC] ${type.toUpperCase()} ${path} - ${durationMs}ms`;

  if (result.ok) {
    console.log(label);
    return result;
  }

  const { error } = result;
  const cause = error?.cause ? { cause: error.cause } : undefined;

  label = `${label} - ERROR [${error.code}]: ${error.message}`;

  console.error(label, cause);
  return result;
});

/**
 * Procedimento público com middleware de logging
 */
export const publicProcedure = t.procedure.use(loggerMiddleware);

/**
 * Exporta o t para uso nos routers
 */
export { t };
