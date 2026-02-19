/**
 * Tipos compartilhados entre frontend e backend
 * Exporta todos os tipos inferidos dos schemas Zod
 */

export * from "../schemas/athlete-schema";
export * from "../schemas/training-schema";

// Tipos de resposta paginada
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Tipos de erro da API
export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

// Tipos de sucesso da API
export interface ApiSuccess<T = void> {
  success: true;
  data?: T;
}
