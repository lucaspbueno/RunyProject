"use client";

import { useMemo, useState } from "react";
import type { AthleteInsightsResponse } from "@/shared/types/domain/athlete-insights";
import { useAthleteGoals } from "@/hooks/athletes/use-athlete-goals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type Props = {
  athleteId: string;
  insights: AthleteInsightsResponse;
};

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * Semana ISO (segunda) em yyyy-mm-dd, compatível com o weekStart do backend.
 * Implementação sem date-fns para não depender de libs.
 */
function getCurrentIsoWeekStart(): string {
  const now = new Date();
  const day = now.getDay(); // 0=Dom, 1=Seg, ...
  const diff = (day === 0 ? -6 : 1) - day; // volta até segunda
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split("T")[0]!;
}

export function AthleteInsightsGoals({ athleteId, insights }: Props) {
  const { toast } = useToast();
  const { goals, isLoaded, saveGoals, resetGoals } = useAthleteGoals(athleteId);

  const weekStart = useMemo(() => getCurrentIsoWeekStart(), []);
  const currentWeek = useMemo(() => {
    // Esperado: timeSeries contém weekStart, totalMinutes, totalLoad, trainingCount
    return insights.timeSeries.find((w) => w.weekStart === weekStart);
  }, [insights.timeSeries, weekStart]);

  const minutesDone = currentWeek?.minutes ?? 0;
  const trainingsDone = currentWeek?.trainingsCount ?? 0;

  const minutesPct = clampPercent((minutesDone / Math.max(1, goals.weeklyMinutesGoal)) * 100);
  const trainingsPct = clampPercent((trainingsDone / Math.max(1, goals.weeklyTrainingsGoal)) * 100);

  // Controlled inputs simples sem sincronização automática
  const [tempMinutesInput, setTempMinutesInput] = useState(String(goals.weeklyMinutesGoal));
  const [tempTrainingsInput, setTempTrainingsInput] = useState(String(goals.weeklyTrainingsGoal));

  // Key para forçar reset dos inputs quando goals mudam
  const inputKey = `${goals.weeklyMinutesGoal}-${goals.weeklyTrainingsGoal}-${isLoaded}`;

  const onSave = () => {
    const result = saveGoals({
      weeklyMinutesGoal: Number(tempMinutesInput),
      weeklyTrainingsGoal: Number(tempTrainingsInput),
    });

    if (result.ok) {
      toast({ title: "Metas salvas", description: "Metas atualizadas para este atleta." });
    } else {
      toast({ title: "Erro ao salvar", description: result.error, variant: "destructive" });
    }
  };

  const onReset = () => {
    const result = resetGoals();
    if (result.ok) {
      toast({ title: "Metas resetadas", description: "Voltamos para os valores padrão." });
    } else {
      toast({ title: "Erro ao resetar", description: result.error, variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">Metas da Semana</CardTitle>
        <Badge variant="secondary">{weekStart}</Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        {!isLoaded ? (
          <div className="text-sm text-muted-foreground">Carregando metas…</div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Minutos/semana</span>
                  <span className="text-sm text-muted-foreground">
                    {minutesDone}/{goals.weeklyMinutesGoal}
                  </span>
                </div>

                <div className="h-2 w-full rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary/70" style={{ width: `${minutesPct}%` }} />
                </div>

                <Input
                  key={`minutes-${inputKey}`}
                  inputMode="numeric"
                  value={tempMinutesInput}
                  onChange={(e) => setTempMinutesInput(e.target.value)}
                  placeholder="Ex.: 150"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Treinos/semana</span>
                  <span className="text-sm text-muted-foreground">
                    {trainingsDone}/{goals.weeklyTrainingsGoal}
                  </span>
                </div>

                <div className="h-2 w-full rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary/70" style={{ width: `${trainingsPct}%` }} />
                </div>

                <Input
                  key={`trainings-${inputKey}`}
                  inputMode="numeric"
                  value={tempTrainingsInput}
                  onChange={(e) => setTempTrainingsInput(e.target.value)}
                  placeholder="Ex.: 3"
                />
              </div>
            </div>

            <Separator />

            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={onSave}>Salvar</Button>
              <Button variant="outline" onClick={onReset}>
                Resetar
              </Button>
              <span className="text-xs text-muted-foreground">Salvo no navegador (por atleta).</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
