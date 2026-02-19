import { z } from "zod";

/**
 * Schema Zod para validação de dados de atleta
 * Define regras de negócio e tipos para criação/atualização
 */

export const createAthleteSchema = z.object({
  name: z
    .string()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(255, "Nome deve ter no máximo 255 caracteres"),
  email: z
    .string()
    .email("Email inválido")
    .max(255, "Email deve ter no máximo 255 caracteres"),
  dateOfBirth: z
    .string()
    .min(1, "Data de nascimento é obrigatória")
    .refine(
      (date) => {
        // Aceita tanto formato datetime (ISO) quanto formato de data (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        const datetimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
        
        if (!dateRegex.test(date) && !datetimeRegex.test(date)) {
          return false;
        }
        
        const birthDate = new Date(date);
        const today = new Date();
        return !isNaN(birthDate.getTime()) && birthDate < today;
      },
      "Data de nascimento inválida ou deve estar no passado"
    ),
});

export const updateAthleteSchema = createAthleteSchema.partial();

export const listAthletesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  includeDeleted: z.coerce.boolean().default(false),
});

export const deleteAthleteSchema = z.object({
  id: z.coerce.number().int().positive("ID deve ser um número positivo"),
});

export const reactivateAthleteSchema = z.object({
  id: z.coerce.number().int().positive("ID deve ser um número positivo"),
});

// Tipos inferidos dos schemas
export type CreateAthleteInput = z.infer<typeof createAthleteSchema>;
export type UpdateAthleteInput = z.infer<typeof updateAthleteSchema>;
export type ListAthletesInput = z.infer<typeof listAthletesSchema>;
export type DeleteAthleteInput = z.infer<typeof deleteAthleteSchema>;
export type ReactivateAthleteInput = z.infer<typeof reactivateAthleteSchema>;
