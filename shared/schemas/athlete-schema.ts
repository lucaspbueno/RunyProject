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
    .datetime("Data de nascimento inválida")
    .refine(
      (date) => {
        const birthDate = new Date(date);
        const today = new Date();
        return birthDate < today;
      },
      "Data de nascimento deve estar no passado"
    ),
});

export const updateAthleteSchema = createAthleteSchema.partial();

export const listAthletesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

export const deleteAthleteSchema = z.object({
  id: z.coerce.number().int().positive("ID deve ser um número positivo"),
});

// Tipos inferidos dos schemas
export type CreateAthleteInput = z.infer<typeof createAthleteSchema>;
export type UpdateAthleteInput = z.infer<typeof updateAthleteSchema>;
export type ListAthletesInput = z.infer<typeof listAthletesSchema>;
export type DeleteAthleteInput = z.infer<typeof deleteAthleteSchema>;
