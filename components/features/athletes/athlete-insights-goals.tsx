/**
 * AthleteInsightsGoals Component
 *
 * Displays and manages weekly goals for an athlete, including:
 * - Goal setting (minutes/week and trainings/week)
 * - Current week progress with visual indicators
 * - Status messages (goal met, remaining, etc.)
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAthleteGoals } from "@/hooks/athletes/use-athlete-goals";
import type { WeeklyTimeSeries } from "@/shared/types/domain/athlete-insights";
import { Target, TrendingUp, CheckCircle2 } from "lucide-react";

interface AthleteInsightsGoalsProps {
  athleteId: string;
  timeSeries: WeeklyTimeSeries[];
}

/**
 * Gets the current week's data from time series
 */
function getCurrentWeekData(
  timeSeries: WeeklyTimeSeries[],
): WeeklyTimeSeries | null {
  if (timeSeries.length === 0) return null;

  // The last entry in timeSeries is typically the current/most recent week
  return timeSeries[timeSeries.length - 1];
}

/**
 * Calculates progress percentage (capped at 100 for display purposes)
 */
function calculateProgress(current: number, goal: number): number {
  if (goal === 0) return 0;
  return Math.min(100, Math.round((current / goal) * 100));
}

export function AthleteInsightsGoals({
  athleteId,
  timeSeries,
}: AthleteInsightsGoalsProps) {
  const { goals, isLoaded, setGoals } = useAthleteGoals(athleteId);
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    weeklyMinutesGoal: goals.weeklyMinutesGoal,
    weeklyTrainingsGoal: goals.weeklyTrainingsGoal,
  });

  // Get current week's progress
  const currentWeek = getCurrentWeekData(timeSeries);
  const currentMinutes = currentWeek?.minutes ?? 0;
  const currentTrainings = currentWeek?.trainingsCount ?? 0;

  const minutesProgress = calculateProgress(
    currentMinutes,
    goals.weeklyMinutesGoal,
  );
  const trainingsProgress = calculateProgress(
    currentTrainings,
    goals.weeklyTrainingsGoal,
  );

  const minutesRemaining = Math.max(
    0,
    goals.weeklyMinutesGoal - currentMinutes,
  );
  const trainingsRemaining = Math.max(
    0,
    goals.weeklyTrainingsGoal - currentTrainings,
  );

  const isMinutesGoalMet = currentMinutes >= goals.weeklyMinutesGoal;
  const isTrainingsGoalMet = currentTrainings >= goals.weeklyTrainingsGoal;
  const allGoalsMet = isMinutesGoalMet && isTrainingsGoalMet;

  const handleSaveGoals = () => {
    try {
      setGoals({
        weeklyMinutesGoal: editValues.weeklyMinutesGoal,
        weeklyTrainingsGoal: editValues.weeklyTrainingsGoal,
      });
      setIsEditing(false);
      toast({
        title: "Metas atualizadas",
        description: "Suas metas semanais foram salvas com sucesso.",
      });
    } catch {
      toast({
        title: "Erro ao salvar metas",
        description: "Não foi possível salvar as metas. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditValues({
      weeklyMinutesGoal: goals.weeklyMinutesGoal,
      weeklyTrainingsGoal: goals.weeklyTrainingsGoal,
    });
    setIsEditing(false);
  };

  if (!isLoaded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Metas da Semana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Carregando metas...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Metas da Semana
          </CardTitle>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Editar Metas
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Goal Status Summary */}
        {!isEditing && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            {allGoalsMet ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <p className="text-sm font-medium text-green-700">
                  Parabéns! Você atingiu todas as suas metas esta semana.
                </p>
              </>
            ) : (
              <>
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <p className="text-sm font-medium text-blue-700">
                  Continue assim! Você está progredindo em direção às suas
                  metas.
                </p>
              </>
            )}
          </div>
        )}

        {/* Minutes Goal */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="minutes-goal" className="text-sm font-medium">
              Minutos por Semana
            </Label>
            {!isEditing && (
              <span className="text-sm text-muted-foreground">
                {currentMinutes} / {goals.weeklyMinutesGoal} min
              </span>
            )}
          </div>

          {isEditing ? (
            <Input
              id="minutes-goal"
              type="number"
              min="0"
              max="2000"
              value={editValues.weeklyMinutesGoal}
              onChange={(e) =>
                setEditValues({
                  ...editValues,
                  weeklyMinutesGoal: Math.max(
                    0,
                    Math.min(2000, +e.target.value),
                  ),
                })
              }
            />
          ) : (
            <>
              <Progress value={minutesProgress} className="h-2" />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {minutesProgress}% completo
                </span>
                {minutesRemaining > 0 ? (
                  <span className="text-muted-foreground">
                    Faltam {minutesRemaining} min
                  </span>
                ) : (
                  <span className="text-green-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Meta atingida
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Trainings Goal */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="trainings-goal" className="text-sm font-medium">
              Treinos por Semana
            </Label>
            {!isEditing && (
              <span className="text-sm text-muted-foreground">
                {currentTrainings} / {goals.weeklyTrainingsGoal} treinos
              </span>
            )}
          </div>

          {isEditing ? (
            <Input
              id="trainings-goal"
              type="number"
              min="0"
              max="14"
              value={editValues.weeklyTrainingsGoal}
              onChange={(e) =>
                setEditValues({
                  ...editValues,
                  weeklyTrainingsGoal: Math.max(
                    0,
                    Math.min(14, +e.target.value),
                  ),
                })
              }
            />
          ) : (
            <>
              <Progress value={trainingsProgress} className="h-2" />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {trainingsProgress}% completo
                </span>
                {trainingsRemaining > 0 ? (
                  <span className="text-muted-foreground">
                    Faltam {trainingsRemaining} treinos
                  </span>
                ) : (
                  <span className="text-green-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Meta atingida
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Edit Actions */}
        {isEditing && (
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSaveGoals} className="flex-1">
              Salvar Metas
            </Button>
            <Button
              variant="outline"
              onClick={handleCancelEdit}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        )}

        {/* Current Week Info */}
        {!isEditing && currentWeek && (
          <div className="pt-4 border-t text-xs text-muted-foreground">
            <p>
              Semana atual:{" "}
              {new Date(currentWeek.weekStart).toLocaleDateString("pt-BR")} -{" "}
              {new Date(currentWeek.weekEnd).toLocaleDateString("pt-BR")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
