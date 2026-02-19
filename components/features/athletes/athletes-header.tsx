import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Plus } from "lucide-react";

interface AthletesHeaderProps {
  mostrarDesativados: boolean;
  onMostrarDesativadosChange: (value: boolean) => void;
}

/**
 * Cabeçalho da página de atletas com título e controles
 */
export function AthletesHeader({ 
  mostrarDesativados, 
  onMostrarDesativadosChange 
}: AthletesHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">Atletas</h1>
        <p className="text-muted-foreground">
          Gerencie o cadastro de atletas e suas informações
        </p>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Label htmlFor="mostrar-desativados" className="text-sm">
            Mostrar desativados
          </Label>
          <Switch
            id="mostrar-desativados"
            checked={mostrarDesativados}
            onCheckedChange={onMostrarDesativadosChange}
          />
        </div>
        <Button asChild>
          <Link href="/atletas/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Atleta
          </Link>
        </Button>
      </div>
    </div>
  );
}
