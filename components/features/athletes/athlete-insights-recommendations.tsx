"use client";

import type { AthleteInsightsResponse } from "@/shared/types/domain/athlete-insights";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = { insights: AthleteInsightsResponse };

function normalize(s: string) {
  return s.toLowerCase();
}

export function AthleteInsightsRecommendations({ insights }: Props) {
  const items = insights.insights ?? [];

  const hasSpike = items.some(
    (i) => normalize(i.severity) === "warning" && normalize(i.title).includes("spike")
  );
  const hasMonotony = items.some(
    (i) => normalize(i.severity) === "warning" && normalize(i.title).includes("monotonia")
  );

  const hasDownTrend = items.some((i) => {
    const t = normalize(i.title);
    return t.includes("tendência") && (t.includes("queda") || t.includes("down"));
  });

  const hasGoodConsistency = items.some((i) => {
    const t = normalize(i.title);
    return normalize(i.severity) === "info" && (t.includes("consist") || t.includes("regular"));
  });

  const recs: string[] = [];

  if (hasSpike) {
    recs.push(
      "Você teve um aumento abrupto de carga. Tente evoluir de forma mais gradual na próxima semana (progressão)."
    );
  }
  if (hasMonotony) {
    recs.push(
      "A carga semanal está pouco variada. Considere alternar tipo de treino e intensidade para diversificar estímulos."
    );
  }
  if (hasDownTrend) {
    recs.push(
      "A tendência recente indica queda de volume. Se fizer sentido, ajuste frequência/duração para retomar consistência."
    );
  }
  if (hasGoodConsistency) {
    recs.push("Boa consistência nas últimas semanas. Mantenha o ritmo e monitore variações de carga.");
  }

  if (recs.length === 0) {
    recs.push("Padrão estável no período. Mantenha consistência e acompanhe a variação de carga ao longo das semanas.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recomendações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {recs.slice(0, 3).map((r) => (
          <div key={r} className="text-sm text-muted-foreground">
            • {r}
          </div>
        ))}
        <div className="pt-2 text-xs text-muted-foreground">
          Observação: recomendações informativas, sem caráter médico.
        </div>
      </CardContent>
    </Card>
  );
}
