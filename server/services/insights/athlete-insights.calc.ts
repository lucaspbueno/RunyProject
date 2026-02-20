import { TRAINING_INTENSITY_VALUES } from "@/shared/constants/training-intensity";
import type { Training } from "@/server/db/schema/tables/training";

/**
 * Helpers para cálculos de insights de atleta
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
export function calculateTrainingLoad(training: Training): number {
  const intensityScore = INTENSITY_SCORES[training.intensity] || 1;
  return training.durationMinutes * intensityScore;
}

/**
 * Calcula o score médio de intensidade ponderado pela duração
 */
export function calculateAverageIntensityScore(trainings: Training[]): number {
  if (trainings.length === 0) return 0;
  
  const totalMinutes = trainings.reduce((sum, t) => sum + t.durationMinutes, 0);
  const totalWeightedScore = trainings.reduce((sum, t) => {
    const intensityScore = INTENSITY_SCORES[t.intensity] || 1;
    return sum + (t.durationMinutes * intensityScore);
  }, 0);
  
  return totalWeightedScore / totalMinutes;
}

/**
 * Agrupa treinos por semana (ISO week)
 */
export function groupTrainingsByWeek(trainings: Training[]): Map<string, Training[]> {
  const weeksMap = new Map<string, Training[]>();
  
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
  
  return weeksMap;
}

/**
 * Calcula dados agregados por semana
 */
export function calculateWeeklyTimeSeries(trainings: Training[]): Array<{
  weekStart: string;
  weekEnd: string;
  minutes: number;
  load: number;
  trainingsCount: number;
}> {
  const weeksMap = groupTrainingsByWeek(trainings);
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
      const [year, weekStr] = weekKey.split('-W');
      const week = parseInt(weekStr);
      
      const weekStart = startOfWeek(new Date(parseInt(year), week - 1), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      
      const minutes = weekTrainings.reduce((sum, t) => sum + t.durationMinutes, 0);
      const load = weekTrainings.reduce((sum, t) => sum + calculateTrainingLoad(t), 0);
      
      result.push({
        weekStart: weekStart.toISOString().split('T')[0],
        weekEnd: weekEnd.toISOString().split('T')[0],
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
export function calculateIntensityDistribution(trainings: Training[]): Array<{
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
export function calculateTypeDistribution(trainings: Training[]): Array<{
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
export function getTopTrainingsByLoad(trainings: Training[], limit: number = 5): Training[] {
  return [...trainings]
    .sort((a, b) => calculateTrainingLoad(b) - calculateTrainingLoad(a))
    .slice(0, limit);
}

// Funções auxiliares de data (simplificadas para não depender de date-fns no service)
function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function startOfWeek(date: Date, options: { weekStartsOn: number }): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day < options.weekStartsOn ? 7 : 0) + day - options.weekStartsOn;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfWeek(date: Date, options: { weekStartsOn: number }): Date {
  const d = startOfWeek(date, options);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}
