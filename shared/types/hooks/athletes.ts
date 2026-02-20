/**
 * Tipos de hooks para Athlete
 */

import type { Athlete } from "../domain/athlete";
import type { PaginatedResponse } from "../domain/common";

// Tipos para opções do hook de lista de atletas
export interface UseAthletesListOptions {
  includeDeleted?: boolean;
  initialPage?: number;
  limit?: number;
}

// Tipos para retorno do hook de lista de atletas
export interface UseAthletesListReturn {
  athletes: PaginatedResponse<Athlete> | null;
  loading: boolean;
  error: Error | null;
  currentPage: number;
  loadAthletes: (page?: number) => Promise<void>;
  refetch: () => Promise<void>;
  setCurrentPage: (page: number) => void;
}
