import { z } from "zod";
import { TRAINING_INTENSITY_VALUES } from "../constants/training-intensity";

/**
 * Schema Zod para validação de dados de treino
 * Define regras de negócio e tipos para criação/atualização
 */

export const createTrainingSchema = z.object({
  athleteId: z.coerce.number().int().positive("ID do atleta deve ser um número positivo"),
  type: z
    .string()
    .min(3, "Tipo deve ter pelo menos 3 caracteres")
    .max(100, "Tipo deve ter no máximo 100 caracteres"),
  durationMinutes: z.coerce
    .number()
    .int()
    .positive("Duração deve ser um número positivo")
    .max(480, "Duração máxima é de 8 horas (480 minutos)"),
  intensity: z.enum(TRAINING_INTENSITY_VALUES),
  notes: z.string().max(1000, "Observações devem ter no máximo 1000 caracteres").optional(),
});

export const updateTrainingSchema = createTrainingSchema.partial();

export const listTrainingsByAthleteSchema = z.object({
  athleteId: z.coerce.number().int().positive("ID do atleta deve ser um número positivo"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  includeDeleted: z.boolean().default(false),
});

export const deleteTrainingSchema = z.object({
  id: z.coerce.number().int().positive("ID deve ser um número positivo"),
});

export const getTrainingSchema = z.object({
  id: z.coerce.number().int().positive("ID deve ser um número positivo"),
});

export const reactivateTrainingSchema = z.object({
  id: z.coerce.number().int().positive("ID deve ser um número positivo"),
});

// Tipos inferidos dos schemas
export type CreateTrainingInput = z.infer<typeof createTrainingSchema>;
export type UpdateTrainingInput = z.infer<typeof updateTrainingSchema>;
export type ListTrainingsByAthleteInput = z.infer<typeof listTrainingsByAthleteSchema>;
export type DeleteTrainingInput = z.infer<typeof deleteTrainingSchema>;
export type GetTrainingInput = z.infer<typeof getTrainingSchema>;
export type ReactivateTrainingInput = z.infer<typeof reactivateTrainingSchema>;
