"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { Wrapper } from "@/components/wrapper";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { AthleteInsightsDashboard } from "@/components/features/athletes/athlete-insights-dashboard";
import { AthleteInsightsSkeleton } from "@/components/features/athletes/athlete-insights-skeleton";
import { trpcClient } from "@/lib/trpc-client";
import { useToast } from "@/hooks/use-toast";
import { BarChart3 } from "lucide-react";
import type { AthleteInsightsResponse } from "@/shared/types/domain/athlete-insights";

export default function AthleteInsightsPage() {
  const params = useParams();
  const athleteId = Number(params.id);
  const { toast } = useToast();

  const [insights, setInsights] = useState<AthleteInsightsResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado para filtros
  const [period, setPeriod] = useState<"7" | "30" | "90" | "custom">("30");
  const [compare, setCompare] = useState(false);
  const [intensityFilter, setIntensityFilter] = useState<
    "ALL" | "low" | "moderate" | "high"
  >("ALL");
  const [trainingTypeFilter, setTrainingTypeFilter] = useState("ALL");

  const loadInsights = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await trpcClient.athletes.getInsights.query({
        athleteId,
        period,
        compare,
        intensityFilter,
        trainingTypeFilter,
      });

      setInsights(result);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao carregar insights";
      setError(errorMessage);

      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [athleteId, period, compare, intensityFilter, trainingTypeFilter, toast]);

  useEffect(() => {
    if (athleteId) {
      loadInsights();
    }
  }, [
    athleteId,
    period,
    compare,
    intensityFilter,
    trainingTypeFilter,
    loadInsights,
  ]);

  const handleRetry = () => {
    loadInsights();
  };

  const handleFilterChange = (filters: {
    period: "7" | "30" | "90" | "custom";
    compare: boolean;
    intensityFilter: "ALL" | "low" | "moderate" | "high";
    trainingTypeFilter: string;
  }) => {
    setPeriod(filters.period);
    setCompare(filters.compare);
    setIntensityFilter(filters.intensityFilter);
    setTrainingTypeFilter(filters.trainingTypeFilter);
  };

  // Verificação determinística de empty state
  const totalTrainingsKpi = insights?.kpis.find((k) =>
    k.label.toLowerCase().includes("treino"),
  );
  const isEmpty =
    !insights || !totalTrainingsKpi || totalTrainingsKpi.value === 0;

  if (loading) {
    return (
      <>
        <Navigation />
        <Wrapper>
          <AthleteInsightsSkeleton />
        </Wrapper>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigation />
        <Wrapper>
          <ErrorState
            title="Erro ao carregar insights"
            description="Não foi possível carregar os dados de insights do atleta. Tente novamente."
            onRetry={handleRetry}
          />
        </Wrapper>
      </>
    );
  }

  if (isEmpty) {
    return (
      <>
        <Navigation />
        <Wrapper>
          <EmptyState
            icon={BarChart3}
            title="Nenhum dado encontrado"
            description="Não há treinos registrados para este atleta no período selecionado."
            actionText="Ver todos os treinos"
            actionHref={`/treinos/atleta/${athleteId}`}
          />
        </Wrapper>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <Wrapper>
        <AthleteInsightsDashboard
          athleteId={String(athleteId)}
          insights={insights}
          filters={{
            period,
            compare,
            intensityFilter,
            trainingTypeFilter,
          }}
          onFilterChange={handleFilterChange}
        />
      </Wrapper>
    </>
  );
}
