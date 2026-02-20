/**
 * Tipos de formulário para Athlete
 */

// Tipos para formulário de criação
export interface CreateAthleteForm {
  name: string;
  email: string;
  dateOfBirth: string;
}

// Tipos para formulário de atualização
export interface UpdateAthleteForm {
  name: string;
  email: string;
  dateOfBirth: string;
}
