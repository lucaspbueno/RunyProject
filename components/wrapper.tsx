import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface WrapperProps {
  children: ReactNode;
  className?: string;
}

export function Wrapper({ children, className }: WrapperProps) {
  return <div className={cn("container mx-auto px-4 py-8", className)}>{children}</div>;
}
