import { cn } from "@/lib/utils";
import type { WrapperProps } from "@/shared/types/ui/components";

export function Wrapper({ children, className }: WrapperProps) {
  return (
    <div className={cn("container mx-auto px-4 py-8", className)}>
      {children}
    </div>
  );
}
