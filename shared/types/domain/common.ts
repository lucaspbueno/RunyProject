/**
 * Tipos comuns de domínio compartilhados
 */

// Tipos de resposta paginada
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Tipos de entidade com ID genérico
export interface EntityWithId {
  id: number | string;
}
