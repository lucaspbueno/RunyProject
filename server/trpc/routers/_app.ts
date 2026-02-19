import "server-only";

import { t } from "../trpc";
import { athleteRouter } from "./athlete.router";
import { trainingRouter } from "./training.router";

/**
 * Router principal que combina todos os routers da aplicação
 * Organiza as rotas por domínio: athletes, trainings
 */

export const appRouter = t.router({
  athletes: athleteRouter,
  trainings: trainingRouter,
});

export type AppRouter = typeof appRouter;
