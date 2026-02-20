import type { AthleteInsightsResponse } from "@/shared/types/domain/athlete-insights";
import type { AthleteInsightKpi, AthleteInsight } from "@/shared/types/domain/athlete-insights";
import type { Training } from "@/server/db/schema/tables/training";
import {
  calculateTrainingLoad,
  calculateAverageIntensityScore,
  calculateWeeklyTimeSeries,
  calculateIntensityDistribution,
  calculateTypeDistribution,
  getTopTrainingsByLoad,
  computeMonotonyIndex,
  detectSpike,
  computeConsistency,
  computeTrend,
  type WeeklyAggregate,
  type TrainingDTO,
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

  // Converter para DTO para desacoplar do Drizzle
  const currentDTO = trainingsToDTO(trainingsCurrent);
  const compareDTO = trainingsCompare ? trainingsToDTO(trainingsCompare) : [];

  // Aplicar filtros nos treinos atuais
  const filteredCurrent = currentDTO.filter(training => {
    const matchesIntensity = intensityFilter === "ALL" || training.intensity === intensityFilter;
    const matchesType = trainingTypeFilter === "ALL" || training.type === trainingTypeFilter;
    return matchesIntensity && matchesType;
  });

  // Aplicar filtros nos treinos de comparação (se existirem)
  const filteredCompare = compareDTO.filter(training => {
    const matchesIntensity = intensityFilter === "ALL" || training.intensity === intensityFilter;
    const matchesType = trainingTypeFilter === "ALL" || training.type === trainingTypeFilter;
    return matchesIntensity && matchesType;
  });

  // Gerar agregados semanais para cálculos inteligentes
  const weeklyTimeSeries = calculateWeeklyTimeSeries(filteredCurrent);
  const weeklyAggregates = weeklyTimeSeries.map(week => ({
    weekStart: week.weekStart,
    totalMinutes: week.minutes,
    totalLoad: week.load,
    trainingCount: week.trainingsCount,
  }));

  // Calcular KPIs básicos
  const kpis = buildKPIs(filteredCurrent, filteredCompare);

  // Calcular distribuições
  const distribution = {
    byType: calculateTypeDistribution(filteredCurrent),
    byIntensity: calculateIntensityDistribution(filteredCurrent),
  };

  // Gerar insights inteligentes
  const insights = buildIntelligentInsights(filteredCurrent, weeklyAggregates);

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
    timeSeries: calculateWeeklyTimeSeries(filteredCurrent),
    insights,
    highlights: buildHighlights(filteredCurrent),
  };
}

/**
 * Gera insights inteligentes
 */
function buildIntelligentInsights(trainings: TrainingDTO[], weeklyAggregates: WeeklyAggregate[]): AthleteInsight[] {
  const insights: AthleteInsight[] = [];

  // Insights V1 existentes
  if (trainings.length === 0) {
    insights.push({
      id: "no-data",
      severity: "info",
      title: "Sem dados no período",
      description: "Não há treinos registrados para o período selecionado.",
      type: "trend",
    });
    return insights;
  }

  const intensityDist = calculateIntensityDistribution(trainings);
  const typeDist = calculateTypeDistribution(trainings);
  const weeklyLoads = weeklyAggregates.map(w => w.totalLoad);

  // 1. Monotonia Alta (warning)
  const monotonyIndex = computeMonotonyIndex(weeklyLoads);
  if (monotonyIndex !== null && monotonyIndex >= 2.0) {
    insights.push({
      id: "high-monotony",
      severity: "warning",
      title: "Alta Monotonia",
      description: "Baixa variação de carga semanal pode indicar treino repetitivo e risco de sobrecarga.",
      evidence: `Índice de monotonia: ${monotonyIndex.toFixed(2)}`,
      type: "monotony",
    });
  }

  // 2. Spike de Carga (warning)
  const spikeResult = detectSpike(weeklyLoads);
  if (spikeResult.isSpike) {
    const spikeWeek = weeklyAggregates[spikeResult.spikeWeekIndex!];
    insights.push({
      id: "load-spike",
      severity: "warning",
      title: "Spike de Carga",
      description: "Aumento significativo de carga na última semana em relação à média anterior.",
      evidence: `Semana ${spikeWeek.weekStart}: ${spikeResult.ratio?.toFixed(1)}x a média anterior`,
      type: "spike",
    });
  }

  // 3. Consistência (success/info)
  const consistency = computeConsistency(weeklyAggregates);
  if (consistency.activeWeeks >= 3) {
    insights.push({
      id: "good-consistency",
      severity: "info",
      title: "Boa Consistência",
      description: `Treinos consistentes nas últimas ${consistency.activeWeeks} semanas com streak de ${consistency.streak}.`,
      evidence: `${consistency.activeWeeks} semanas ativas (${(consistency.consistencyRate).toFixed(0)}%)`,
      type: "consistency",
    });
  } else if (consistency.activeWeeks === 0) {
    insights.push({
      id: "no-consistency",
      severity: "info",
      title: "Sem Consistência",
      description: "Nenhuma semana com frequência mínima de treinos registrada.",
      evidence: "Considere aumentar a frequência para melhores resultados.",
      type: "consistency",
    });
  }

  // 4. Tendência (info)
  const trend = computeTrend(weeklyLoads);
  if (trend !== "UNKNOWN") {
    const trendText = trend === "UP" ? "crescente" : trend === "DOWN" ? "decrescente" : "estável";
    insights.push({
      id: "load-trend",
      severity: "info",
      title: "Tendência de Carga",
      description: `Tendência ${trendText} da carga de treino nas últimas semanas.`,
      evidence: `Baseado na comparação das médias semanais`,
      type: "trend",
    });
  }

  // Insight V1: Maior concentração de intensidade
  const highestIntensity = intensityDist.reduce((max, curr) => curr.count > max.count ? curr : max);
  if (highestIntensity.intensity !== "low") {
    insights.push({
      id: "high-intensity-focus",
      severity: highestIntensity.intensity === "high" ? "warning" : "info",
      title: "Foco em Intensidade",
      description: `${Math.round(highestIntensity.percentage)}% dos treinos foram com intensidade ${highestIntensity.intensity}.`,
      evidence: `${highestIntensity.count} de ${trainings.length} treinos`,
      type: "trend",
    });
  }

  // Insight V1: Tipo de treino mais frequente
  const mostFrequentType = typeDist.reduce((max, curr) => curr.count > max.count ? curr : max);
  insights.push({
    id: "frequent-training-type",
    severity: "info",
    title: "Tipo Predominante",
    description: `${mostFrequentType.type} é o tipo mais realizado (${Math.round(mostFrequentType.percentage)}% do total).`,
    evidence: `${mostFrequentType.count} sessões`,
    type: "trend",
  });

  return insights;
}

/**
 * Constrói os KPIs básicos com deltas quando houver comparação
 */
function buildKPIs(current: TrainingDTO[], compare: TrainingDTO[]): AthleteInsightKpi[] {
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
 * Gera highlights com os top treinos por carga
 */
function buildHighlights(trainings: TrainingDTO[]) {
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
 * Determina a tendência com base nos valores atuais vs anteriores (PROTEGIDO contra divisão por zero)
 */
function getTrend(current: number, previous: number): "up" | "down" | "stable" {
  // Proteger contra divisão por zero
  if (previous === 0) {
    if (current === 0) return "stable";
    return "up";
  }
  
  const threshold = 0.05; // 5% de tolerância
  const change = (current - previous) / previous;
  
  if (Math.abs(change) < threshold) return "stable";
  return change > 0 ? "up" : "down";
}

/**
 * Converte Training do Drizzle para TrainingDTO (desacoplamento)
 */
function trainingsToDTO(trainings: Training[]): TrainingDTO[] {
  return trainings.map(training => ({
    id: training.id,
    athleteId: training.athleteId,
    type: training.type,
    durationMinutes: training.durationMinutes,
    intensity: training.intensity,
    notes: training.notes,
    createdAt: training.createdAt,
    updatedAt: training.updatedAt,
    deletedAt: training.deletedAt,
  }));
}
