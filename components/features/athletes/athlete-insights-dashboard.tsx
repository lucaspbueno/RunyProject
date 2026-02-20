import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AthleteInsightsKpis } from "./athlete-insights-kpis";
import { AthleteInsightsPeriodFilter } from "./athlete-insights-period-filter";
import { AthleteInsightsDistribution } from "./athlete-insights-distribution";
import { AthleteInsightsHighlights } from "./athlete-insights-highlights";
import type { AthleteInsightsResponse } from "@/shared/types/domain/athlete-insights";

interface AthleteInsightsDashboardProps {
  insights: AthleteInsightsResponse;
  filters: {
    period: "7" | "30" | "90" | "custom";
    compare: boolean;
    intensityFilter: "ALL" | "low" | "moderate" | "high";
    trainingTypeFilter: string;
  };
  onFilterChange: (filters: {
    period: "7" | "30" | "90" | "custom";
    compare: boolean;
    intensityFilter: "ALL" | "low" | "moderate" | "high";
    trainingTypeFilter: string;
  }) => void;
}

/**
 * Dashboard principal de insights do atleta
 * Orquestra todos os componentes de visualização
 */
export function AthleteInsightsDashboard({
  insights,
  filters,
  onFilterChange,
}: AthleteInsightsDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Header com Filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Insights do Atleta</h1>
          <p className="text-muted-foreground">
            Análise detalhada do desempenho e padrões de treinamento
          </p>
        </div>
        <AthleteInsightsPeriodFilter
          filters={filters}
          onFilterChange={onFilterChange}
        />
      </div>

      {/* KPIs */}
      <AthleteInsightsKpis kpis={insights.kpis} />

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição dos Treinos</CardTitle>
          </CardHeader>
          <CardContent>
            <AthleteInsightsDistribution distribution={insights.distribution} />
          </CardContent>
        </Card>

        {/* Highlights */}
        <Card>
          <CardHeader>
            <CardTitle>Principais Treinos</CardTitle>
          </CardHeader>
          <CardContent>
            <AthleteInsightsHighlights highlights={insights.highlights} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
