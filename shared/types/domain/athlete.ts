// Tipos de domínio de atleta (shape estável do contrato)
export interface Athlete {
  id: number;
  name: string;
  email: string;
  dateOfBirth: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export type NewAthlete = Omit<Athlete, "id" | "createdAt" | "updatedAt" | "deletedAt">;

// Tipos para listas e filtros
export type AthleteFilter = {
  name?: string;
  email?: string;
  includeDeleted?: boolean;
};
