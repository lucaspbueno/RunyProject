/**
 * Tipos de formulário para Training
 */

// Tipos para formulário de criação
export interface CreateTrainingForm {
  type: string;
  durationMinutes: string;
  intensity: "low" | "moderate" | "high";
  notes?: string;
}

// Tipos para formulário de atualização
export interface UpdateTrainingForm {
  type: string;
  durationMinutes: string;
  intensity: "low" | "moderate" | "high";
  notes?: string;
}
