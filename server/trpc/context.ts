import "server-only";

import { db } from "../db/index";

/**
 * Opções para criação do contexto tRPC
 */
export interface CreateContextOptions {
  req: Request;
}

/**
 * Contexto tRPC disponível em todos os procedures
 */
export interface Context {
  db: typeof db;
  req: Request;
}

/**
 * Criação do contexto tRPC para cada requisição
 * Inclui conexão com banco e outras dependências
 */
export const createTRPCContext = async (opts: CreateContextOptions): Promise<Context> => {
  return {
    db,
    req: opts.req,
  };
};
