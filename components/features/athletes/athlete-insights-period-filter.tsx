import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar, TrendingUp } from "lucide-react";

interface AthleteInsightsPeriodFilterProps {
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
 * Filtros de período para insights
 * Presets: 7d, 30d, 90d + toggle de comparação
 */
export function AthleteInsightsPeriodFilter({
  filters,
  onFilterChange,
}: AthleteInsightsPeriodFilterProps) {
  const handlePeriodChange = (period: "7" | "30" | "90" | "custom") => {
    onFilterChange({ ...filters, period });
  };

  const handleCompareChange = (compare: boolean) => {
    onFilterChange({ ...filters, compare });
  };

  const periodOptions = [
    { value: "7" as const, label: "7 dias" },
    { value: "30" as const, label: "30 dias" },
    { value: "90" as const, label: "90 dias" },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      {/* Presets de Período */}
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <div className="flex gap-1">
          {periodOptions.map((option) => (
            <Button
              key={option.value}
              variant={filters.period === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => handlePeriodChange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Toggle de Comparação */}
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
        <div className="flex items-center space-x-2">
          <Switch
            id="compare-toggle"
            checked={filters.compare}
            onCheckedChange={handleCompareChange}
          />
          <Label htmlFor="compare-toggle" className="text-sm">
            Comparar período anterior
          </Label>
        </div>
      </div>
    </div>
  );
}
