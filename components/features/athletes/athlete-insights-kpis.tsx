import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { AthleteInsightKpi } from "@/shared/types/domain/athlete-insights";

interface AthleteInsightsKpisProps {
  kpis: AthleteInsightKpi[];
}

/**
 * Grid de KPIs com deltas e tendências
 * Exibe 4 métricas principais com indicadores de variação
 */
export function AthleteInsightsKpis({ kpis }: AthleteInsightsKpisProps) {
  const getTrendIcon = (trend?: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case "stable":
        return <Minus className="h-4 w-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const getDeltaColor = (delta?: number) => {
    if (delta === undefined) return "text-gray-500";
    return delta > 0 ? "text-green-600" : delta < 0 ? "text-red-600" : "text-gray-500";
  };

  const formatDelta = (delta?: number) => {
    if (delta === undefined) return "";
    const sign = delta > 0 ? "+" : "";
    return `${sign}${delta}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {kpi.label}
                </p>
                <p className="text-2xl font-bold">
                  {kpi.value.toLocaleString("pt-BR")}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    {kpi.unit}
                  </span>
                </p>
                
                {/* Delta e Trend */}
                {kpi.delta !== undefined && (
                  <div className="flex items-center gap-1 mt-1">
                    {getTrendIcon(kpi.trend)}
                    <span className={`text-sm font-medium ${getDeltaColor(kpi.delta)}`}>
                      {formatDelta(kpi.delta)} {kpi.unit}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
