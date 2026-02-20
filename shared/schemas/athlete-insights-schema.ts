import { z } from "zod";
import { TRAINING_INTENSITY_VALUES } from "../constants/training-intensity";

/**
 * Schema Zod para validação de dados de insights de atleta
 * Define regras de negócio e tipos para consulta de insights
 */

export const athleteInsightsInputSchema = z.object({
  athleteId: z.coerce.number().int().positive("ID do atleta deve ser um número positivo"),
  period: z.enum(["7", "30", "90", "custom"]).default("30"),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  compare: z.coerce.boolean().default(false),
  intensityFilter: z.enum(["ALL", ...TRAINING_INTENSITY_VALUES]).default("ALL"),
  trainingTypeFilter: z.string().default("ALL"),
}).refine(
  (data) => {
    if (data.period === "custom") {
      return data.fromDate && data.toDate;
    }
    return true;
  },
  {
    message: "Datas 'fromDate' e 'toDate' são obrigatórias quando period='custom'",
    path: ["fromDate"],
  }
).refine(
  (data) => {
    if (data.period === "custom" && data.fromDate && data.toDate) {
      // Validar formato ISO ou YYYY-MM-DD
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      const datetimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
      
      const fromDateValid = dateRegex.test(data.fromDate) || datetimeRegex.test(data.fromDate);
      const toDateValid = dateRegex.test(data.toDate) || datetimeRegex.test(data.toDate);
      
      if (!fromDateValid || !toDateValid) {
        return false;
      }
      
      // Validar que fromDate <= toDate
      const fromDate = new Date(data.fromDate);
      const toDate = new Date(data.toDate);
      
      return fromDate <= toDate;
    }
    return true;
  },
  {
    message: "Datas devem estar em formato válido (YYYY-MM-DD ou ISO) e fromDate deve ser <= toDate",
    path: ["fromDate"],
  }
);

// Tipos inferidos dos schemas
export type AthleteInsightsInput = z.infer<typeof athleteInsightsInputSchema>;
