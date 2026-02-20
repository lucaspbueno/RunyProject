import type { Training as TrainingType, NewTraining as NewTrainingType } from "@/server/db/schema/tables/training";

// Re-exportar tipos do backend (fonte da verdade)
export type Training = TrainingType;
export type NewTraining = NewTrainingType;


// Tipos para listas e filtros
export type TrainingFilter = {
  athleteId?: number;
  type?: string;
  intensity?: string;
  dateFrom?: Date;
  dateTo?: Date;
  includeDeleted?: boolean;
};
