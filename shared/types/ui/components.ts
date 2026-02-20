/**
 * Tipos de UI para componentes genéricos
 */

import type { ReactNode, ComponentType } from "react";

// Tipos para componentes de estado
export interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryText?: string;
}

export interface EmptyStateProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
}

// Tipos para componentes de layout
export interface WrapperProps {
  children: ReactNode;
  className?: string;
}
