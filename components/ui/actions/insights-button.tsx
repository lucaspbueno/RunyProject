import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BarChart3 } from "lucide-react";
import type { InsightsButtonProps } from "@/shared/types/ui/actions";

/**
 * Botão de insights genérico com link dinâmico
 */
export function InsightsButton({
  entity,
  href,
  disabled = false,
  title = "Ver insights",
  size = "sm",
  variant = "outline",
}: InsightsButtonProps) {
  const insightsHref = href.replace(":id", String(entity.id));

  return (
    <Button
      variant={variant}
      size={size}
      asChild
      disabled={disabled}
      title={title}
    >
      <Link href={insightsHref}>
        <BarChart3 className="h-4 w-4" />
        Insights
      </Link>
    </Button>
  );
}
