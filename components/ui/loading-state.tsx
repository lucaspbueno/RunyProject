import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Componente reutilizável para estado de carregamento
 * Padroniza o visual de loading em toda aplicação
 */
export function LoadingState({ message = "Carregando...", size = "md" }: LoadingStateProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  return (
    <div className="text-center py-8">
      <Loader2 className={`animate-spin ${sizeClasses[size]} border-b-2 border-primary mx-auto`} />
      <p className="mt-2 text-muted-foreground">{message}</p>
    </div>
  );
}
