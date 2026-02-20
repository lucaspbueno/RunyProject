import { BarChart3, Activity } from "lucide-react";
import type { TrainingTypeDistribution, TrainingIntensityDistribution } from "@/shared/types/domain/athlete-insights";

interface AthleteInsightsDistributionProps {
  distribution: {
    byType: TrainingTypeDistribution[];
    byIntensity: TrainingIntensityDistribution[];
  };
}

/**
 * Visualização de distribuição de treinos
 * Gráficos de barras simples para tipo e intensidade
 */
export function AthleteInsightsDistribution({
  distribution,
}: AthleteInsightsDistributionProps) {
  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case "high":
        return "bg-destructive/60";
      case "moderate":
        return "bg-amber-500/60";
      case "low":
        return "bg-emerald-500/60";
      default:
        return "bg-muted";
    }
  };

  const getTypeColor = (index: number) => {
    const colors = [
      "bg-blue-500/60",
      "bg-purple-500/60",
      "bg-pink-500/60",
      "bg-indigo-500/60",
      "bg-teal-500/60",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6">
      {/* Distribuição por Intensidade */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Por Intensidade</h3>
        </div>
        
        {distribution.byIntensity.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem dados de intensidade</p>
        ) : (
          <div className="space-y-2">
            {distribution.byIntensity.map((item) => (
              <div key={item.intensity} className="flex items-center gap-3">
                <div className="w-16 text-sm font-medium capitalize">
                  {item.intensity === "high" ? "Alta" : 
                   item.intensity === "moderate" ? "Moderada" : "Baixa"}
                </div>
                <div className="flex-1 bg-muted rounded-full h-6 relative">
                  <div
                    className={`h-full rounded-full ${getIntensityColor(item.intensity)}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <div className="w-12 text-sm text-right">
                  {item.count}
                </div>
                <div className="w-12 text-sm text-muted-foreground text-right">
                  {item.percentage}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Distribuição por Tipo */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Por Tipo</h3>
        </div>
        
        {distribution.byType.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem dados de tipo</p>
        ) : (
          <div className="space-y-2">
            {distribution.byType.map((item, index) => (
              <div key={item.type} className="flex items-center gap-3">
                <div className="w-16 text-sm font-medium truncate">
                  {item.type}
                </div>
                <div className="flex-1 bg-muted rounded-full h-6 relative">
                  <div
                    className={`h-full rounded-full ${getTypeColor(index)}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <div className="w-12 text-sm text-right">
                  {item.count}
                </div>
                <div className="w-12 text-sm text-muted-foreground text-right">
                  {item.percentage}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
