import type { ReactNode } from "react";

/**
 * Tipos de UI para botões de ação
 */

// Entidade nomeada com ID — usada nos botões de ação
// (diferente de EntityWithId em domain/common, que é genérica e sem name)
export interface NamedEntity {
  id: number | string;
  name?: string;
}

// Tipos para botão de edição
export interface EditButtonProps {
  entity: NamedEntity;
  href: string;
  disabled?: boolean;
  title?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
}

// Tipos para botão de exclusão
export interface DeleteButtonProps {
  entity: NamedEntity;
  onDelete: (id: number | string) => void;
  deletingId?: number | string | null;
  disabled?: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
}

// Tipos para botão de reativação
export interface ReactivateButtonProps {
  entity: NamedEntity;
  onReactivate: (id: number | string) => void;
  reactivatingId?: number | string | null;
  disabled?: boolean;
  text?: string;
  loadingText?: string;
  title?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
}

// Tipos para grupo de ações
export interface ActionGroupProps {
  children: ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}
