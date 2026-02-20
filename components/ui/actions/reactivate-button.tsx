import { Button } from "@/components/ui/button";
import { RotateCcw, Loader2 } from "lucide-react";
import type { ReactivateButtonProps } from "@/shared/types/ui/actions";

/**
 * Botão de reativação genérico com loading state
 */
export function ReactivateButton({
  entity,
  onReactivate,
  reactivatingId = null,
  disabled = false,
  text = "Reativar",
  loadingText = "Reativando...",
  title = "Reativar item",
  size = "sm",
  variant = "outline",
}: ReactivateButtonProps) {
  const isLoading = reactivatingId === entity.id;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => onReactivate(entity.id)}
      disabled={disabled || isLoading}
      title={title}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        <>
          <RotateCcw className="mr-2 h-4 w-4" />
          {text}
        </>
      )}
    </Button>
  );
}
