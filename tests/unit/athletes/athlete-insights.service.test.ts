import { describe, it, expect } from "vitest";
import { buildAthleteInsights } from "@/server/services/insights/athlete-insights.service";
import type { Training } from "@/server/db/schema/tables/training";

describe("AthleteInsightsService", () => {
  const mockTraining: Training = {
    id: 1,
    athleteId: 1,
    type: "Corrida",
    durationMinutes: 30,
    intensity: "moderate",
    notes: null,
    createdAt: new Date("2024-01-15T10:00:00Z"),
    updatedAt: new Date("2024-01-15T10:00:00Z"),
    deletedAt: null,
  };

  describe("buildAthleteInsights", () => {
    it("deve retornar payload vazio coerente quando não há treinos", () => {
      const result = buildAthleteInsights({
        trainingsCurrent: [],
        trainingsCompare: undefined,
        period: {
          from: new Date("2024-01-01"),
          to: new Date("2024-01-31"),
        },
        intensityFilter: "ALL",
        trainingTypeFilter: "ALL",
      });

      expect(result.kpis).toHaveLength(4);
      expect(result.kpis[0].value).toBe(0);
      expect(result.distribution.byType).toEqual([]);
      expect(result.distribution.byIntensity).toEqual([
        { intensity: "low", count: 0, percentage: 0 },
        { intensity: "moderate", count: 0, percentage: 0 },
        { intensity: "high", count: 0, percentage: 0 },
      ]);
      expect(result.timeSeries).toEqual([]);
      expect(result.insights).toHaveLength(1);
      expect(result.insights[0].title).toBe("Sem dados no período");
      expect(result.highlights).toEqual([]);
    });

    it("deve calcular KPIs corretamente com treinos", () => {
      const trainings: Training[] = [
        mockTraining,
        {
          ...mockTraining,
          id: 2,
          type: "Natação",
          durationMinutes: 45,
          intensity: "high",
          createdAt: new Date("2024-01-20T14:00:00Z"),
          updatedAt: new Date("2024-01-20T14:00:00Z"),
        },
      ];

      const result = buildAthleteInsights({
        trainingsCurrent: trainings,
        trainingsCompare: undefined,
        period: {
          from: new Date("2024-01-01"),
          to: new Date("2024-01-31"),
        },
        intensityFilter: "ALL",
        trainingTypeFilter: "ALL",
      });

      expect(result.kpis[0].value).toBe(2); // Total de Treinos
      expect(result.kpis[1].value).toBe(75); // Minutos Totais
      expect(result.kpis[2].value).toBe(195); // Carga Total (30*2 + 45*3 = 60 + 135)
      expect(result.distribution.byType).toHaveLength(2);
      expect(result.timeSeries).toHaveLength(1);
      expect(result.highlights).toHaveLength(2);
    });

    it("deve aplicar filtros de intensidade e tipo corretamente", () => {
      const trainings: Training[] = [
        mockTraining,
        {
          ...mockTraining,
          id: 2,
          type: "Natação",
          intensity: "high",
          createdAt: new Date("2024-01-20T14:00:00Z"),
          updatedAt: new Date("2024-01-20T14:00:00Z"),
        },
      ];

      const result = buildAthleteInsights({
        trainingsCurrent: trainings,
        trainingsCompare: undefined,
        period: {
          from: new Date("2024-01-01"),
          to: new Date("2024-01-31"),
        },
        intensityFilter: "moderate",
        trainingTypeFilter: "Corrida",
      });

      expect(result.kpis[0].value).toBe(1); // Apenas 1 treino corresponde aos filtros
      expect(result.distribution.byType).toHaveLength(1);
      expect(result.distribution.byType[0].type).toBe("Corrida");
      expect(result.distribution.byIntensity).toHaveLength(3);
      expect(result.distribution.byIntensity[1].count).toBe(1); // moderate
      expect(result.distribution.byIntensity[2].count).toBe(0); // high (filtrado)
    });
  });
});
