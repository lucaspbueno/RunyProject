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
 * Middleware para logging de requisições
 */
const loggerMiddleware = t.middleware(async ({ path, type, next }) => {
  const start = Date.now();
  const result = await next();
  const durationMs = Date.now() - start;
  
  console.log(`[tRPC] ${type.toUpperCase()} ${path} - ${durationMs}ms`);
  
  return result;
});

/**
 * Procedimento pública com middleware de logging
 */
export const publicProcedure = t.procedure.use(loggerMiddleware);

/**
 * Exporta o t para uso nos routers
 */
export { t };
