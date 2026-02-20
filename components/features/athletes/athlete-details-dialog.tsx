import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDateBR, calculateAge } from "@/lib/date";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { User, Mail, RotateCcw, Loader2 } from "lucide-react";

interface Athlete {
  id: number;
  name: string;
  email: string;
  dateOfBirth: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt?: Date | string | null;
}

interface AthleteDetailsDialogProps {
  athlete: Athlete | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReactivate?: (id: number) => void;
  reactivatingId?: number | null;
}

/**
 * Modal para visualizar detalhes completos de um atleta
 */
export function AthleteDetailsDialog({
  athlete,
  open,
  onOpenChange,
  onReactivate,
  reactivatingId
}: AthleteDetailsDialogProps) {
  if (!athlete) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            Detalhes do Atleta
          </DialogTitle>
          <DialogDescription>
            Informações completas do atleta selecionado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Nome</label>
            <p className="text-base font-semibold">{athlete.name}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <p className="text-base flex items-center">
              <Mail className="mr-1 h-4 w-4 text-muted-foreground" />
              {athlete.email}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Idade</label>
              <p className="text-base">
                {calculateAge(athlete.dateOfBirth)} anos
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Data de nascimento</label>
              <p className="text-base">
                {formatDateBR(athlete.dateOfBirth)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Cadastrado em</label>
              <p className="text-base">
                {format(new Date(athlete.createdAt), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">
                {athlete.deletedAt ? (
                  <Badge variant="warning">Desativado</Badge>
                ) : (
                  <Badge variant="success">Ativo</Badge>
                )}
              </div>
            </div>
          </div>

          {athlete.deletedAt && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Data de desativação</label>
              <p className="text-base">
                {format(new Date(athlete.deletedAt), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" asChild>
            <Link href={`/treinos/atleta/${athlete.id}?permitir_desativado=1`}>
              Ver treinos
            </Link>
          </Button>

          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>

          {athlete.deletedAt && onReactivate && (
            <Button
              onClick={() => onReactivate(athlete.id)}
              disabled={reactivatingId === athlete.id}
            >
              {reactivatingId === athlete.id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Reativando...
                </>
              ) : (
                <>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reativar
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
