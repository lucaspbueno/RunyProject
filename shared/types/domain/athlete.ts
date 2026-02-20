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

// Tipos de insights específicos de atleta
export interface AthleteInsightKpi {
  label: string;
  value: number;
  delta?: number;
  unit: string;
  trend?: "up" | "down" | "stable";
}

export interface AthleteInsight {
  id: string;
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  evidence?: string;
  type: "monotony" | "spike" | "consistency" | "trend";
}
