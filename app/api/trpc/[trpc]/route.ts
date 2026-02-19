import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../../../../server/trpc/routers/_app";
import { createTRPCContext } from "../../../../server/trpc/context";

/**
 * Endpoint Next.js App Router para tRPC
 * Lida com todas as requisições tRPC via HTTP
 * 
 * Rotas disponíveis:
 * - POST /api/trpc/athletes.create
 * - POST /api/trpc/athletes.list
 * - POST /api/trpc/athletes.update
 * - POST /api/trpc/athletes.delete
 * - POST /api/trpc/trainings.create
 * - POST /api/trpc/trainings.listByAthlete
 * - POST /api/trpc/trainings.update
 * - POST /api/trpc/trainings.delete
 */

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ req }),
    onError: ({ error, path }: { error: Error; path?: string }) => {
      console.error(`tRPC error on ${path}:`, error);
    },
  });

export { handler as GET, handler as POST };
