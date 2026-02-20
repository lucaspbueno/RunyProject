"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

const navigation = [
  { name: "Atletas", href: "/atletas" },
  { name: "Treinos", href: "/treinos" },
];

export function Navigation() {
  const pathname = usePathname();

  const isActiveRoute = (href: string) => {
    if (pathname === href) return true;
    
    // Considera rotas filhas como ativas
    if (pathname.startsWith(href) && href !== '/') {
      return true;
    }
    
    return false;
  };

  return (
    <Card className="mb-6 p-4">
      <nav className="flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold">
          Runy
        </Link>

        <div className="flex items-center space-x-4">
          {navigation.map((item) => (
            <Button
              key={item.href}
              variant={isActiveRoute(item.href) ? "default" : "ghost"}
              asChild
            >
              <Link href={item.href}>{item.name}</Link>
            </Button>
          ))}
          <ThemeToggle />
        </div>
      </nav>
    </Card>
  );
}
