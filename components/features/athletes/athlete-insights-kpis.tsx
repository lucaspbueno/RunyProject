"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AthleteInsightKpi } from "@/shared/types/domain/athlete-insights";

interface AthleteInsightsKpisProps {
  kpis: AthleteInsightKpi[];
  compare?: boolean;
}

function getDeltaColor(delta?: number) {
  if (delta === undefined) return "text-muted-foreground";
  if (delta === 0) return "text-muted-foreground";
  return delta > 0 ? "text-green-600" : "text-red-600";
}

function formatPercent(p?: number) {
  if (p === undefined || !Number.isFinite(p)) return "";
  const sign = p > 0 ? "+" : "";
  return `${sign}${p.toFixed(0)}%`;
}

function getDeltaPercent(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Grid de KPIs com deltas e tendências
 * Exibe 4 métricas principais com indicadores de variação
 */
export function AthleteInsightsKpis({ kpis, compare = false }: AthleteInsightsKpisProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => {
        const deltaValue = kpi.delta;
        const deltaPercent = deltaValue !== undefined && kpi.value !== 0 
          ? getDeltaPercent(kpi.value, kpi.value - deltaValue)
          : undefined;

        const showDelta = compare && deltaValue !== undefined;
        const arrow = deltaValue !== undefined ? (deltaValue > 0 ? "↑" : deltaValue < 0 ? "↓" : "→") : "→";

        const labelTitle =
          kpi.label.toLowerCase().includes("carga")
            ? "Carga = duração (min) × intensidade (score)"
            : undefined;

        return (
          <Card key={kpi.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium" title={labelTitle}>
                {kpi.label}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-1">
              <div className="text-2xl font-semibold">
                {kpi.value.toLocaleString("pt-BR")} <span className="text-sm font-normal text-muted-foreground">{kpi.unit}</span>
              </div>

              {showDelta ? (
                <div className={`text-sm ${getDeltaColor(deltaValue)}`}>
                  {arrow}{" "}
                  <span className="font-medium">
                    {deltaValue !== undefined ? `${Math.abs(deltaValue)}` : ""}
                    {deltaPercent !== undefined ? ` (${formatPercent(deltaPercent)})` : ""}
                  </span>{" "}
                  <span className="text-muted-foreground">vs período anterior</span>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">—</div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
