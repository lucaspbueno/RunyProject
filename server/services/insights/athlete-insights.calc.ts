import { TRAINING_INTENSITY_VALUES } from "@/shared/constants/training-intensity";
import { startOfISOWeek, format } from "date-fns";

/**
 * Tipo DTO mínimo para treinos (desacoplado do Drizzle)
 */
export type TrainingDTO = {
  id: number;
  athleteId: number;
  type: string;
  durationMinutes: number;
  intensity: "low" | "moderate" | "high";
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

/**
 * Tipos para agregação semanal
 */
export type WeeklyAggregate = {
  weekStart: string; // YYYY-MM-DD
  totalMinutes: number;
  totalLoad: number;
  trainingCount: number;
};

/**
 * Tipos para detecção de spikes
 */
export type SpikeResult = {
  isSpike: boolean;
  spikeWeekIndex?: number;
  ratio?: number;
};

/**
 * Helpers para cálculos de insights
 * Funções puras para facilitar testes e reutilização
 */

// Mapeamento de scores de intensidade
export const INTENSITY_SCORES: Record<string, number> = {
  low: 1,
  moderate: 2,
  high: 3,
} as const;

/**
 * Calcula a carga de um treino (duração * intensidade)
 */
export function calculateTrainingLoad(training: TrainingDTO): number {
  const intensityScore = INTENSITY_SCORES[training.intensity] || 1;
  return training.durationMinutes * intensityScore;
}

/**
 * Calcula o score médio de intensidade ponderado pela duração
 */
export function calculateAverageIntensityScore(trainings: TrainingDTO[]): number {
  if (trainings.length === 0) return 0;
  
  const totalMinutes = trainings.reduce((sum, t) => sum + t.durationMinutes, 0);
  const weightedSum = trainings.reduce((sum, t) => {
    const intensityScore = INTENSITY_SCORES[t.intensity] || 1;
    return sum + (t.durationMinutes * intensityScore);
  }, 0);
  
  return weightedSum / totalMinutes;
}

/**
 * Agrupa treinos por semana ISO (YYYY-WW) - Wrapper de calculateWeeklyTimeSeries
 */
export function groupTrainingsByISOWeek(trainings: TrainingDTO[]): WeeklyAggregate[] {
  const timeSeries = calculateWeeklyTimeSeries(trainings);
  return timeSeries.map(week => ({
    weekStart: week.weekStart,
    totalMinutes: week.minutes,
    totalLoad: week.load,
    trainingCount: week.trainingsCount,
  }));
}

/**
 * Calcula índice de monotonia (mean / stdDev)
 * Retorna null se dados insuficientes (< 3 semanas)
 */
export function computeMonotonyIndex(weeklyLoads: number[]): number | null {
  if (weeklyLoads.length < 3) return null;
  
  const mean = weeklyLoads.reduce((sum, load) => sum + load, 0) / weeklyLoads.length;
  const variance = weeklyLoads.reduce((sum, load) => sum + Math.pow(load - mean, 2), 0) / weeklyLoads.length;
  const stdDev = Math.sqrt(variance);
  
  // Se stdDev é muito próximo de zero, monotonia é muito alta
  if (stdDev < 0.1) return 999;
  
  return mean / stdDev;
}

/**
 * Detecta spikes de carga semanal
 * Compara última semana com média das anteriores
 */
export function detectSpike(weeklyLoads: number[]): SpikeResult {
  if (weeklyLoads.length < 2) {
    return { isSpike: false, ratio: 0 };
  }
  
  const lastWeek = weeklyLoads[weeklyLoads.length - 1];
  const previousWeeks = weeklyLoads.slice(0, -1);
  const avgPrevious = previousWeeks.length > 0 
    ? previousWeeks.reduce((sum, load) => sum + load, 0) / previousWeeks.length 
    : 0;
  
  const ratio = avgPrevious > 0 ? lastWeek / avgPrevious : 0;
  const isSpike = ratio >= 1.5; // Fator configurável
  
  return {
    isSpike,
    spikeWeekIndex: isSpike ? weeklyLoads.length - 1 : undefined,
    ratio: Number(ratio.toFixed(2)),
  };
}

/**
 * Calcula consistência de treinos
 * Conta semanas ativas e streak atual
 */
export function computeConsistency(
  weeklyAggregates: WeeklyAggregate[], 
  minTrainingsPerWeek: number = 2
): {
  activeWeeks: number;
  streak: number;
  consistencyRate: number;
} {
  const activeWeeks = weeklyAggregates.filter(week => 
    week.trainingCount >= minTrainingsPerWeek
  ).length;
  
  // Calcular streak (sequência de semanas ativas do final para o início)
  let streak = 0;
  for (let i = weeklyAggregates.length - 1; i >= 0; i--) {
    if (weeklyAggregates[i].trainingCount >= minTrainingsPerWeek) {
      streak++;
    } else {
      break;
    }
  }
  
  const consistencyRate = weeklyAggregates.length > 0 
    ? (activeWeeks / weeklyAggregates.length) * 100 
    : 0;
  
  return {
    activeWeeks,
    streak,
    consistencyRate,
  };
}

/**
 * Calcula tendência de carga semanal
 */
export function computeTrend(weeklyLoads: number[]): "UP" | "DOWN" | "FLAT" | "UNKNOWN" {
  if (weeklyLoads.length < 3) return "UNKNOWN";
  
  // Comparar média das últimas 2 semanas com as 2 anteriores
  const recent = weeklyLoads.slice(-2);
  const previous = weeklyLoads.slice(-4, -2);
  
  if (previous.length === 0) return "UNKNOWN";
  
  const recentAvg = recent.reduce((sum, load) => sum + load, 0) / recent.length;
  const previousAvg = previous.reduce((sum, load) => sum + load, 0) / previous.length;
  
  // Proteger contra divisão por zero
  if (previousAvg === 0) return "UNKNOWN";
  
  const threshold = 0.05; // 5% de tolerância
  const change = (recentAvg - previousAvg) / previousAvg;
  
  if (Math.abs(change) < threshold) return "FLAT";
  return change > 0 ? "UP" : "DOWN";
}

/**
 * Helper para obter número da semana ISO
 */
function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}


/**
 * Calcula dados agregados por semana (CORRIGIDO com date-fns)
 */
export function calculateWeeklyTimeSeries(trainings: TrainingDTO[]): Array<{
  weekStart: string;
  weekEnd: string;
  minutes: number;
  load: number;
  trainingsCount: number;
}> {
  // Agrupar treinos por semana ISO internamente
  const weeksMap = new Map<string, TrainingDTO[]>();
  
  trainings.forEach(training => {
    const date = new Date(training.createdAt);
    const year = date.getFullYear();
    const week = getISOWeek(date);
    const weekKey = `${year}-W${week.toString().padStart(2, '0')}`;
    
    if (!weeksMap.has(weekKey)) {
      weeksMap.set(weekKey, []);
    }
    weeksMap.get(weekKey)!.push(training);
  });
  
  const result: Array<{
    weekStart: string;
    weekEnd: string;
    minutes: number;
    load: number;
    trainingsCount: number;
  }> = [];
  
  Array.from(weeksMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([weekKey, weekTrainings]) => {
      // Usar o primeiro treino da semana como referência para calcular o início da semana ISO
      const firstTraining = weekTrainings[0];
      const weekStart = startOfISOWeek(new Date(firstTraining.createdAt));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const minutes = weekTrainings.reduce((sum: number, t: TrainingDTO) => sum + t.durationMinutes, 0);
      const load = weekTrainings.reduce((sum: number, t: TrainingDTO) => sum + calculateTrainingLoad(t), 0);
      
      result.push({
        weekStart: format(weekStart, 'yyyy-MM-dd'),
        weekEnd: format(weekEnd, 'yyyy-MM-dd'),
        minutes,
        load,
        trainingsCount: weekTrainings.length,
      });
    });
  
  return result;
}

/**
 * Calcula distribuição por intensidade
 */
export function calculateIntensityDistribution(trainings: TrainingDTO[]): Array<{
  intensity: "low" | "moderate" | "high";
  count: number;
  percentage: number;
}> {
  const distribution = new Map<string, number>();
  
  // Inicializar com todas as intensidades
  TRAINING_INTENSITY_VALUES.forEach(intensity => {
    distribution.set(intensity, 0);
  });
  
  // Contar treinos por intensidade
  trainings.forEach(training => {
    const current = distribution.get(training.intensity) || 0;
    distribution.set(training.intensity, current + 1);
  });
  
  const total = trainings.length;
  
  return Array.from(distribution.entries()).map(([intensity, count]) => ({
    intensity: intensity as "low" | "moderate" | "high",
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0,
  }));
}

/**
 * Calcula distribuição por tipo de treino
 */
export function calculateTypeDistribution(trainings: TrainingDTO[]): Array<{
  type: string;
  count: number;
  percentage: number;
}> {
  const distribution = new Map<string, number>();
  
  // Contar treinos por tipo
  trainings.forEach(training => {
    const current = distribution.get(training.type) || 0;
    distribution.set(training.type, current + 1);
  });
  
  const total = trainings.length;
  
  return Array.from(distribution.entries()).map(([type, count]) => ({
    type,
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0,
  }));
}

/**
 * Retorna os top N treinos por carga
 */
export function getTopTrainingsByLoad(trainings: TrainingDTO[], limit: number = 5): TrainingDTO[] {
  return [...trainings]
    .sort((a, b) => calculateTrainingLoad(b) - calculateTrainingLoad(a))
    .slice(0, limit);
}
