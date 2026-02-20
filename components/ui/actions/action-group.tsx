import { ReactNode } from "react";

interface ActionGroupProps {
  children: ReactNode;
  className?: string;
}

/**
 * Container para grupo de ações com espaçamento consistente
 */
export function ActionGroup({ children, className = "" }: ActionGroupProps) {
  return (
    <div className={`flex justify-end space-x-2 ${className}`}>
      {children}
    </div>
  );
}
