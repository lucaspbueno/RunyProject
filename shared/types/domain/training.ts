// Tipos de domínio de treino (shape estável do contrato)
export interface Training {
  id: number;
  athleteId: number;
  type: string;
  durationMinutes: number;
  intensity: "low" | "moderate" | "high";
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export type NewTraining = Omit<Training, "id" | "createdAt" | "updatedAt" | "deletedAt">;

// Tipos para listas e filtros
export type TrainingFilter = {
  athleteId?: number;
  type?: string;
  intensity?: string;
  dateFrom?: Date;
  dateTo?: Date;
  includeDeleted?: boolean;
};
