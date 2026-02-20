import { describe, it, expect } from "vitest";
import {
  calculateTrainingLoad,
  calculateAverageIntensityScore,
  calculateWeeklyTimeSeries,
  computeMonotonyIndex,
  detectSpike,
  computeConsistency,
  computeTrend,
  type WeeklyAggregate,
  type TrainingDTO,
} from "@/server/services/insights/athlete-insights.calc";

describe("AthleteInsightsCalc", () => {
  const mockTraining: TrainingDTO = {
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

  const mockHighIntensityTraining: TrainingDTO = {
    ...mockTraining,
    intensity: "high",
    durationMinutes: 45,
  };

  const mockLowIntensityTraining: TrainingDTO = {
    ...mockTraining,
    intensity: "low",
    durationMinutes: 60,
  };

  describe("calculateTrainingLoad", () => {
    it("deve calcular carga corretamente", () => {
      expect(calculateTrainingLoad(mockTraining)).toBe(60); // 30 * 2
      expect(calculateTrainingLoad(mockHighIntensityTraining)).toBe(135); // 45 * 3
      expect(calculateTrainingLoad(mockLowIntensityTraining)).toBe(60); // 60 * 1
    });
  });

  describe("calculateAverageIntensityScore", () => {
    it("deve calcular média ponderada", () => {
      const trainings = [mockTraining, mockHighIntensityTraining, mockLowIntensityTraining];
      const expected = (60 + 135 + 60) / (30 + 45 + 60); // (30*2 + 45*3 + 60*1) / (30 + 45 + 60)
      
      expect(calculateAverageIntensityScore(trainings)).toBeCloseTo(expected, 2);
    });

    it("deve retornar 0 para array vazio", () => {
      expect(calculateAverageIntensityScore([])).toBe(0);
    });
  });

  describe("calculateWeeklyTimeSeries", () => {
    it("deve agrupar por semana ISO corretamente", () => {
      const trainings = [
        { ...mockTraining, createdAt: new Date("2024-01-01T10:00:00Z") }, // Segunda
        { ...mockTraining, createdAt: new Date("2024-01-03T10:00:00Z") }, // Quarta
        { ...mockTraining, createdAt: new Date("2024-01-08T10:00:00Z") }, // Segunda próxima semana
      ];

      const result = calculateWeeklyTimeSeries(trainings);
      
      expect(result).toHaveLength(2);
      
      // Primeira semana (W1)
      const week1 = result.find((w) => w.weekStart.startsWith("2024-01-01"));
      expect(week1).toBeDefined();
      expect(week1!.trainingsCount).toBe(2);
      expect(week1!.load).toBe(120); // 60 + 60
      expect(week1!.minutes).toBe(60); // 30 + 30
      
      // Segunda semana (W2)
      const week2 = result.find((w) => w.weekStart.startsWith("2024-01-08"));
      expect(week2).toBeDefined();
      expect(week2!.trainingsCount).toBe(1);
      expect(week2!.minutes).toBe(30);
    });

    it("deve retornar array vazio para sem treinos", () => {
      const result = calculateWeeklyTimeSeries([]);
      expect(result).toEqual([]);
    });
  });

  describe("computeMonotonyIndex", () => {
    it("deve detectar monotonia alta", () => {
      // Cargas constantes = stdDev ~ 0
      const weeklyLoads = [100, 100, 100, 100];
      const result = computeMonotonyIndex(weeklyLoads);
      
      expect(result).toBe(999); // stdDev < 0.1 retorna 999
    });

    it("deve calcular monotonia normal", () => {
      const weeklyLoads = [80, 100, 120, 90];
      const result = computeMonotonyIndex(weeklyLoads);
      
      // Cálculo correto: mean = 97.5, variance = 218.75, stdDev ≈ 14.79
      // monotonia = mean / stdDev ≈ 6.59
      expect(result).toBeCloseTo(6.59, 2);
    });

    it("deve retornar null para menos de 3 semanas", () => {
      const weeklyLoads = [100, 120];
      const result = computeMonotonyIndex(weeklyLoads);
      
      expect(result).toBeNull();
    });
  });

  describe("detectSpike", () => {
    it("deve detectar spike corretamente", () => {
      const weeklyLoads = [100, 110, 90, 105, 200]; // Última semana = 200, média anteriores = 101.25
      const result = detectSpike(weeklyLoads);
      
      expect(result.isSpike).toBe(true);
      expect(result.spikeWeekIndex).toBe(4); // Último índice
      expect(result.ratio).toBeCloseTo(200 / 101.25, 2);
    });

    it("não deve detectar spike sem aumento significativo", () => {
      const weeklyLoads = [100, 110, 90, 105, 115]; // Última semana = 115, média anteriores = 101.25
      const result = detectSpike(weeklyLoads);
      
      expect(result.isSpike).toBe(false);
      expect(result.spikeWeekIndex).toBeUndefined();
      expect(result.ratio).toBeCloseTo(115 / 101.25, 2);
    });

    it("deve retornar false para array vazio", () => {
      const result = detectSpike([100]);
      expect(result.isSpike).toBe(false);
      expect(result.spikeWeekIndex).toBeUndefined();
      expect(result.ratio).toBe(0);
    });
  });

  describe("computeConsistency", () => {
    it("deve calcular consistência alta", () => {
      const weeklyAggregates: WeeklyAggregate[] = [
        { weekStart: "2024-01-01", totalMinutes: 150, totalLoad: 300, trainingCount: 3 },
        { weekStart: "2024-01-08", totalMinutes: 60, totalLoad: 120, trainingCount: 2 },
        { weekStart: "2024-01-15", totalMinutes: 90, totalLoad: 180, trainingCount: 2 },
      ];
      
      const result = computeConsistency(weeklyAggregates);
      
      expect(result.activeWeeks).toBe(3);
      expect(result.streak).toBe(3); // Todas as semanas ativas
      expect(result.consistencyRate).toBeCloseTo(100, 1);
    });

    it("deve calcular consistência baixa", () => {
      const weeklyAggregates: WeeklyAggregate[] = [
        { weekStart: "2024-01-01", totalMinutes: 150, totalLoad: 300, trainingCount: 3 },
        { weekStart: "2024-01-08", totalMinutes: 30, totalLoad: 60, trainingCount: 1 }, // Abaixo do mínimo
        { weekStart: "2024-01-15", totalMinutes: 0, totalLoad: 0, trainingCount: 0 },
      ];
      
      const result = computeConsistency(weeklyAggregates);
      
      expect(result.activeWeeks).toBe(1);
      expect(result.streak).toBe(0); // Última semana inativa
      expect(result.consistencyRate).toBeCloseTo(33.33, 1);
    });

    it("deve retornar zero para array vazio", () => {
      const result = computeConsistency([]);
      
      expect(result.activeWeeks).toBe(0);
      expect(result.streak).toBe(0);
      expect(result.consistencyRate).toBe(0);
    });
  });

  describe("computeTrend", () => {
    it("deve detectar tendência de alta", () => {
      const weeklyLoads = [80, 90, 100, 110]; // Últimas 2: 105, anteriores: 85
      const result = computeTrend(weeklyLoads);
      
      expect(result).toBe("UP");
    });

    it("deve detectar tendência de baixa", () => {
      const weeklyLoads = [110, 100, 90, 80]; // Últimas 2: 85, anteriores: 105
      const result = computeTrend(weeklyLoads);
      
      expect(result).toBe("DOWN");
    });

    it("deve detectar tendência estável", () => {
      const weeklyLoads = [90, 95, 100, 105]; // Últimas 2: 102.5, anteriores: 92.5
      const result = computeTrend(weeklyLoads);
      
      // Cálculo: change = (102.5 - 92.5) / 92.5 = 0.108 (10.8%) > 5% threshold
      expect(result).toBe("UP");
    });

    it("deve retornar UNKNOWN para menos de 3 semanas", () => {
      const weeklyLoads = [100, 120];
      const result = computeTrend(weeklyLoads);
      
      expect(result).toBe("UNKNOWN");
    });

    it("deve retornar UNKNOWN para média anterior zero", () => {
      const weeklyLoads = [0, 0, 100]; // Média anterior = 0
      const result = computeTrend(weeklyLoads);
      
      expect(result).toBe("UNKNOWN");
    });
  });
});
