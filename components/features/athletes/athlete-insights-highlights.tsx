import { Trophy, Calendar } from "lucide-react";
import type { TrainingHighlight } from "@/shared/types/domain/athlete-insights";

interface AthleteInsightsHighlightsProps {
  highlights: TrainingHighlight[];
}

/**
 * Lista dos principais treinos por carga
 * Exibe top 5 treinos com maiores valores de carga
 */
export function AthleteInsightsHighlights({
  highlights,
}: AthleteInsightsHighlightsProps) {
  if (highlights.length === 0) {
    return (
      <div className="text-center py-8">
        <Trophy className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          Nenhum treino destacado no período
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {highlights.map((highlight, index) => (
        <div
          key={highlight.id}
          className="flex items-center gap-3 p-3 rounded-lg border bg-card"
        >
          {/* Posição */}
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-medium">
            {index + 1}
          </div>

          {/* Conteúdo */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-medium truncate">
                {highlight.type}
              </h4>
              {index === 0 && (
                <Trophy className="h-4 w-4 text-yellow-500 flex-shrink-0" />
              )}
            </div>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(highlight.date).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                })}
              </div>
              <div>
                Carga: <span className="font-medium text-foreground">{highlight.value}</span> {highlight.unit}
              </div>
            </div>
          </div>

          {/* Valor Principal */}
          <div className="text-right">
            <div className="text-lg font-bold text-primary">
              {highlight.value}
            </div>
            <div className="text-xs text-muted-foreground">
              {highlight.unit}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
