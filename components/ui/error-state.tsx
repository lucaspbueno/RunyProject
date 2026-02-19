import { Button } from "./button";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryText?: string;
}

/**
 * Componente reutilizável para estado de erro
 * Padroniza o visual de erro com opção de retry
 */
export function ErrorState({ 
  title = "Ocorreu um erro", 
  description = "Não foi possível carregar os dados. Tente novamente.",
  onRetry,
  retryText = "Tentar novamente"
}: ErrorStateProps) {
  return (
    <div className="text-center py-8">
      <div className="text-destructive">
        <AlertTriangle className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="mb-4 text-muted-foreground">{description}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" />
            {retryText}
          </Button>
        )}
      </div>
    </div>
  );
}
