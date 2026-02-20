import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Loader2 } from "lucide-react";
import type { DeleteButtonProps } from "@/shared/types/ui/actions";

/**
 * Botão de exclusão genérico com confirmação e loading state
 */
export function DeleteButton({
  entity,
  onDelete,
  deletingId = null,
  disabled = false,
  title = "Confirmar desativação",
  description = `Tem certeza que deseja desativar ${entity.name ? `o item "${entity.name}"` : "este item"}? O item será desativado mas seus dados serão preservados.`,
  confirmText = "Desativar",
  cancelText = "Cancelar",
  size = "sm",
  variant = "outline",
}: DeleteButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isLoading = deletingId === entity.id;

  const handleDelete = () => {
    onDelete(entity.id);
    setIsOpen(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant={variant} size={size} disabled={disabled || isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Desativando..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
