import { Button } from "./button";
import { LucideIcon } from "lucide-react";
import type { EmptyStateProps } from "@/shared/types/ui/components";

/**
 * Componente reutilizável para estado vazio
 * Padroniza o visual quando não há dados para exibir
 */
export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionText, 
  actionHref, 
  onAction 
}: EmptyStateProps) {
  return (
    <div className="text-center py-8">
      <div className="text-muted-foreground">
        <Icon className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="mb-4">{description}</p>
        {actionText && (actionHref || onAction) && (
          <Button 
            asChild={!!actionHref}
            onClick={onAction}
          >
            {actionHref ? (
              <a href={actionHref}>{actionText}</a>
            ) : (
              actionText
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
