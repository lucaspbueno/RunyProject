import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Edit } from "lucide-react";

interface EntityWithId {
  id: number | string;
}

interface EditButtonProps {
  entity: EntityWithId;
  href: string;
  disabled?: boolean;
  title?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
}

/**
 * Botão de edição genérico com link dinâmico
 */
export function EditButton({ 
  entity, 
  href, 
  disabled = false, 
  title = "Editar",
  size = "sm",
  variant = "outline"
}: EditButtonProps) {
  const editHref = href.replace(":id", String(entity.id));

  return (
    <Button 
      variant={variant} 
      size={size} 
      asChild 
      disabled={disabled}
      title={title}
    >
      <Link href={editHref}>
        <Edit className="h-4 w-4" />
      </Link>
    </Button>
  );
}
