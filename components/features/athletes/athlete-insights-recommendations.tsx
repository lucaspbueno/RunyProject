/**
 * AthleteInsightsRecommendations Component
 *
 * Displays non-medical recommendations based on athlete insights.
 * Uses simple, explainable rules derived from:
 * - Monotony patterns
 * - Load spikes
 * - Training trends
 * - Consistency metrics
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AthleteInsight } from "@/shared/types/domain/athlete-insights";
import { Lightbulb, TrendingUp, TrendingDown, Activity, CheckCircle2 } from "lucide-react";

interface AthleteInsightsRecommendationsProps {
  insights: AthleteInsight[];
}

interface Recommendation {
  id: string;
  type: "warning" | "info" | "success";
  title: string;
  description: string;
  icon: React.ReactNode;
}

/**
 * Generates recommendations based on insights
 */
function generateRecommendations(insights: AthleteInsight[]): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Check for spike warnings
  const spikeInsight = insights.find(
    (i) => i.severity === "warning" && i.type === "spike"
  );
  if (spikeInsight) {
    recommendations.push({
      id: "spike-warning",
      type: "warning",
      title: "Evite variações bruscas",
      description:
        "Foi detectado um aumento abrupto na carga de treino. Para a próxima semana, considere manter ou reduzir levemente a intensidade para dar tempo ao corpo de se adaptar.",
      icon: <TrendingUp className="h-5 w-5 text-orange-600" />,
    });
  }

  // Check for high monotony
  const monotonyInsight = insights.find(
    (i) => i.type === "monotony" && i.severity !== "info"
  );
  if (monotonyInsight) {
    recommendations.push({
      id: "monotony-warning",
      type: "info",
      title: "Varie seus treinos",
      description:
        "Seus treinos têm seguido um padrão muito similar. Considere variar a intensidade, duração ou tipo de atividade para estimular diferentes aspectos físicos e manter a motivação.",
      icon: <Activity className="h-5 w-5 text-blue-600" />,
    });
  }

  // Check for downward trend
  const trendDownInsight = insights.find(
    (i) => i.type === "trend" && i.description.toLowerCase().includes("decrescente")
  );
  if (trendDownInsight) {
    recommendations.push({
      id: "trend-down",
      type: "info",
      title: "Revise sua frequência",
      description:
        "Há uma tendência de redução no volume de treinos. Se isso não for intencional, revise sua rotina para identificar possíveis barreiras à consistência.",
      icon: <TrendingDown className="h-5 w-5 text-amber-600" />,
    });
  }

  // Check for good consistency
  const consistencyInsight = insights.find(
    (i) => i.type === "consistency" && i.severity === "info"
  );
  if (consistencyInsight && recommendations.length === 0) {
    // Only show if no warnings
    recommendations.push({
      id: "consistency-good",
      type: "success",
      title: "Mantenha o ritmo",
      description:
        "Você está mantendo uma boa consistência nos treinos. Continue assim! A regularidade é um dos principais fatores para progresso sustentável.",
      icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
    });
  }

  // If no specific recommendations, provide a general one
  if (recommendations.length === 0) {
    recommendations.push({
      id: "general",
      type: "info",
      title: "Continue acompanhando",
      description:
        "Seus treinos estão dentro de padrões normais. Continue registrando suas atividades para obter insights mais detalhados ao longo do tempo.",
      icon: <Lightbulb className="h-5 w-5 text-blue-600" />,
    });
  }

  return recommendations;
}

/**
 * Gets background color based on recommendation type
 */
function getRecommendationBgColor(type: Recommendation["type"]): string {
  switch (type) {
    case "warning":
      return "bg-orange-50 border-orange-200";
    case "success":
      return "bg-green-50 border-green-200";
    case "info":
    default:
      return "bg-blue-50 border-blue-200";
  }
}

export function AthleteInsightsRecommendations({
  insights,
}: AthleteInsightsRecommendationsProps) {
  const recommendations = generateRecommendations(insights);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Recomendações
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className={`p-4 rounded-lg border ${getRecommendationBgColor(rec.type)}`}
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">{rec.icon}</div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-medium text-sm">{rec.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {rec.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            <strong>Importante:</strong> Estas são sugestões gerais baseadas em
            padrões de treinamento. Não constituem aconselhamento médico ou
            profissional. Consulte um profissional qualificado para orientação
            personalizada.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
