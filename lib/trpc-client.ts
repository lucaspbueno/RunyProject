import "client-only";

import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "../server/trpc/routers/_app";

/**
 * Cliente tRPC para comunicação com o backend
 * Configurado para usar batch requests e superjson
 */

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
    }),
  ],
});
