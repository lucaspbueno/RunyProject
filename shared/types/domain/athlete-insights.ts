// Tipos de insights específicos de atleta
export interface AthleteInsightKpi {
  label: string;
  value: number;
  delta?: number;
  unit: string;
  trend?: "up" | "down" | "stable";
}

export interface AthleteInsight {
  id: string;
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  evidence?: string;
  type: "monotony" | "spike" | "consistency" | "trend";
}

// Tipos de distribuição (usados em insights de atleta)
export interface TrainingTypeDistribution {
  type: string;
  count: number;
  percentage: number;
}

export interface TrainingIntensityDistribution {
  intensity: "low" | "moderate" | "high";
  count: number;
  percentage: number;
}

export interface WeeklyTimeSeries {
  weekStart: string;
  weekEnd: string;
  minutes: number;
  load: number;
  trainingsCount: number;
}

export interface TrainingHighlight {
  id: string;
  trainingId: number;
  type: string;
  reason: "highest_load" | "longest_duration" | "highest_intensity";
  value: number;
  unit: string;
  date: string;
}

// Tipo principal de resposta de insights de atleta
export interface AthleteInsightsResponse {
  period: {
    from: string;
    to: string;
    compareFrom?: string;
    compareTo?: string;
  };
  kpis: AthleteInsightKpi[];
  distribution: {
    byType: TrainingTypeDistribution[];
    byIntensity: TrainingIntensityDistribution[];
  };
  timeSeries: WeeklyTimeSeries[];
  insights: AthleteInsight[];
  highlights: TrainingHighlight[];
}
