import type { Athlete as AthleteType, NewAthlete as NewAthleteType } from "@/server/db/schema/tables/athlete";

// Re-exportar tipos do backend (fonte da verdade)
export type Athlete = AthleteType;
export type NewAthlete = NewAthleteType;

// Tipos para listas e filtros
export type AthleteFilter = {
  name?: string;
  email?: string;
  includeDeleted?: boolean;
};
