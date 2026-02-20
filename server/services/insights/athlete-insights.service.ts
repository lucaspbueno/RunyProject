import type { AthleteInsightsResponse } from "@/shared/types/domain/athlete-insights";
import type { AthleteInsightKpi, AthleteInsight } from "@/shared/types/domain/athlete";
import type { Training } from "@/server/db/schema/tables/training";
import {
  calculateTrainingLoad,
  calculateAverageIntensityScore,
  calculateWeeklyTimeSeries,
  calculateIntensityDistribution,
  calculateTypeDistribution,
  getTopTrainingsByLoad,
} from "./athlete-insights.calc";

/**
 * Monta o payload completo de insights de um atleta
 * Orquestra todos os cálculos e retorna a estrutura esperada pela UI
 */
export function buildAthleteInsights(params: {
  trainingsCurrent: Training[];
  trainingsCompare?: Training[];
  period: { from: Date; to: Date };
  comparePeriod?: { from: Date; to: Date };
  intensityFilter: string;
  trainingTypeFilter: string;
}): AthleteInsightsResponse {
  const { trainingsCurrent, trainingsCompare, period, comparePeriod, intensityFilter, trainingTypeFilter } = params;

  // Aplicar filtros nos treinos atuais
  const filteredCurrent = trainingsCurrent.filter(training => {
    const matchesIntensity = intensityFilter === "ALL" || training.intensity === intensityFilter;
    const matchesType = trainingTypeFilter === "ALL" || training.type === trainingTypeFilter;
    return matchesIntensity && matchesType;
  });

  // Aplicar filtros nos treinos de comparação (se existirem)
  const filteredCompare = trainingsCompare ? trainingsCompare.filter(training => {
    const matchesIntensity = intensityFilter === "ALL" || training.intensity === intensityFilter;
    const matchesType = trainingTypeFilter === "ALL" || training.type === trainingTypeFilter;
    return matchesIntensity && matchesType;
  }) : [];

  // Calcular KPIs básicos
  const kpis = buildKPIs(filteredCurrent, filteredCompare);

  // Calcular distribuições
  const distribution = {
    byType: calculateTypeDistribution(filteredCurrent),
    byIntensity: calculateIntensityDistribution(filteredCurrent),
  };

  // Calcular séries temporais semanais
  const timeSeries = calculateWeeklyTimeSeries(filteredCurrent);

  // Gerar insights simples V1
  const insights = buildSimpleInsights(filteredCurrent);

  // Gerar highlights (top treinos por carga)
  const highlights = buildHighlights(filteredCurrent);

  return {
    period: {
      from: period.from.toISOString().split('T')[0],
      to: period.to.toISOString().split('T')[0],
      ...(comparePeriod && {
        compareFrom: comparePeriod.from.toISOString().split('T')[0],
        compareTo: comparePeriod.to.toISOString().split('T')[0],
      }),
    },
    kpis,
    distribution,
    timeSeries,
    insights,
    highlights,
  };
}

/**
 * Constrói os KPIs básicos com deltas quando houver comparação
 */
function buildKPIs(current: Training[], compare: Training[]): AthleteInsightKpi[] {
  const totalTrainings = current.length;
  const totalMinutes = current.reduce((sum, t) => sum + t.durationMinutes, 0);
  const totalLoad = current.reduce((sum, t) => sum + calculateTrainingLoad(t), 0);
  const avgIntensityScore = calculateAverageIntensityScore(current);

  const kpis: AthleteInsightKpi[] = [
    {
      label: "Total de Treinos",
      value: totalTrainings,
      delta: compare.length > 0 ? totalTrainings - compare.length : undefined,
      unit: "treinos",
      trend: compare.length > 0 ? getTrend(totalTrainings, compare.length) : undefined,
    },
    {
      label: "Minutos Totais",
      value: totalMinutes,
      delta: compare.length > 0 ? totalMinutes - compare.reduce((sum, t) => sum + t.durationMinutes, 0) : undefined,
      unit: "min",
      trend: compare.length > 0 ? getTrend(totalMinutes, compare.reduce((sum, t) => sum + t.durationMinutes, 0)) : undefined,
    },
    {
      label: "Carga Total",
      value: totalLoad,
      delta: compare.length > 0 ? totalLoad - compare.reduce((sum, t) => sum + calculateTrainingLoad(t), 0) : undefined,
      unit: "unidades",
      trend: compare.length > 0 ? getTrend(totalLoad, compare.reduce((sum, t) => sum + calculateTrainingLoad(t), 0)) : undefined,
    },
    {
      label: "Intensidade Média",
      value: Math.round(avgIntensityScore * 10) / 10,
      delta: compare.length > 0 ? avgIntensityScore - calculateAverageIntensityScore(compare) : undefined,
      unit: "score",
      trend: compare.length > 0 ? getTrend(avgIntensityScore, calculateAverageIntensityScore(compare)) : undefined,
    },
  ];

  return kpis;
}

/**
 * Gera insights simples V1 sem estatística pesada
 */
function buildSimpleInsights(trainings: Training[]): AthleteInsight[] {
  if (trainings.length === 0) {
    return [
      {
        id: "no-data",
        severity: "info",
        title: "Sem dados no período",
        description: "Não há treinos registrados para o período selecionado.",
        type: "trend",
      },
    ];
  }

  const insights: AthleteInsight[] = [];

  // Insight 1: Maior concentração de intensidade
  const intensityDist = calculateIntensityDistribution(trainings);
  const highestIntensity = intensityDist.reduce((max, curr) => curr.count > max.count ? curr : max);
  if (highestIntensity.intensity !== "low") {
    insights.push({
      id: "high-intensity-focus",
      severity: highestIntensity.intensity === "high" ? "warning" : "info",
      title: "Foco em intensidade",
      description: `${Math.round(highestIntensity.percentage)}% dos treinos foram com intensidade ${highestIntensity.intensity}.`,
      evidence: `${highestIntensity.count} de ${trainings.length} treinos`,
      type: "trend",
    });
  }

  // Insight 2: Tipo de treino mais frequente
  const typeDist = calculateTypeDistribution(trainings);
  const mostFrequentType = typeDist.reduce((max, curr) => curr.count > max.count ? curr : max);
  insights.push({
    id: "frequent-training-type",
    severity: "info",
    title: "Tipo de treino predominante",
    description: `${mostFrequentType.type} é o tipo mais realizado (${Math.round(mostFrequentType.percentage)}% do total).`,
    evidence: `${mostFrequentType.count} sessões`,
    type: "trend",
  });

  // Insight 3: Semana mais ativa
  const weeklySeries = calculateWeeklyTimeSeries(trainings);
  if (weeklySeries.length > 1) {
    const mostActiveWeek = weeklySeries.reduce((max, curr) => curr.minutes > max.minutes ? curr : max);
    insights.push({
      id: "most-active-week",
      severity: "info",
      title: "Semana mais ativa",
      description: `Semana de ${mostActiveWeek.weekStart} teve maior volume: ${mostActiveWeek.minutes} minutos.`,
      evidence: `${mostActiveWeek.trainingsCount} treinos na semana`,
      type: "trend",
    });
  }

  return insights;
}

/**
 * Gera highlights com os top treinos por carga
 */
function buildHighlights(trainings: Training[]) {
  const topTrainings = getTopTrainingsByLoad(trainings, 5);

  return topTrainings.map((training, index) => ({
    id: `top-load-${index + 1}`,
    trainingId: training.id,
    type: training.type,
    reason: "highest_load" as const,
    value: calculateTrainingLoad(training),
    unit: "unidades",
    date: new Date(training.createdAt).toISOString().split('T')[0],
  }));
}

/**
 * Determina a tendência com base nos valores atuais vs anteriores
 */
function getTrend(current: number, previous: number): "up" | "down" | "stable" {
  const threshold = 0.05; // 5% de tolerância
  const change = (current - previous) / previous;
  
  if (Math.abs(change) < threshold) return "stable";
  return change > 0 ? "up" : "down";
}
