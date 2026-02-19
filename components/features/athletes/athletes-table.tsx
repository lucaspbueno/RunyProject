import { type MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { formatDateBR, calculateAge } from "@/lib/date";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { Edit, Trash2, Calendar, Mail } from "lucide-react";

interface Athlete {
  id: number;
  name: string;
  email: string;
  dateOfBirth: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt?: Date | string | null;
}

interface AthletesTableProps {
  athletes: Athlete[];
  deletingId: number | null;
  confirmacaoDesativarId: number | null;
  onRowClick: (athlete: Athlete, event: MouseEvent) => void;
  onDelete: (id: number) => void;
  onConfirmacaoDesativarChange: (id: number | null) => void;
}

/**
 * Tabela de atletas com ações de edição e exclusão
 */
export function AthletesTable({
  athletes,
  deletingId,
  confirmacaoDesativarId,
  onRowClick,
  onDelete,
  onConfirmacaoDesativarChange
}: AthletesTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Idade</TableHead>
            <TableHead>Data de Nascimento</TableHead>
            <TableHead>Cadastrado em</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {athletes.map((athlete) => (
            <TableRow
              key={athlete.id}
              className={`cursor-pointer hover:bg-muted/50 transition-colors`}
              onClick={(e) => onRowClick(athlete, e)}
            >
              <TableCell className={`font-medium ${athlete.deletedAt ? "opacity-40" : ""}`}>
                {athlete.name}
                {athlete.deletedAt && (
                  <Badge variant="warning" className="ml-2 text-xs">
                    Desativado
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className={`flex items-center ${athlete.deletedAt ? "opacity-40" : ""}`}>
                  <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                  {athlete.email}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className={athlete.deletedAt ? "opacity-40" : ""}>
                  {calculateAge(athlete.dateOfBirth)} anos
                </Badge>
              </TableCell>
              <TableCell>
                <div className={`flex items-center ${athlete.deletedAt ? "opacity-40" : ""}`}>
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  {formatDateBR(athlete.dateOfBirth)}
                </div>
              </TableCell>
              <TableCell>
                <span className={athlete.deletedAt ? "opacity-40" : ""}>
                  {format(new Date(athlete.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  {athlete.deletedAt ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      className="opacity-40 pointer-events-none"
                      title="Não é possível editar atletas desativados"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" asChild title="Editar atleta">
                      <Link href={`/atletas/${athlete.id}/editar`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                  
                  {!athlete.deletedAt && (
                    <AlertDialog
                      open={confirmacaoDesativarId === athlete.id}
                      onOpenChange={(aberto) => {
                        if (aberto) {
                          onConfirmacaoDesativarChange(athlete.id);
                          return;
                        }

                        onConfirmacaoDesativarChange(
                          confirmacaoDesativarId === athlete.id ? null : confirmacaoDesativarId
                        );
                      }}
                    >
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={deletingId === athlete.id}
                          onClick={(event) => {
                            event.stopPropagation();
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar desativação</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja desativar o atleta {athlete.name}? 
                            O atleta será desativado mas seus dados serão preservados.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(athlete.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {deletingId === athlete.id ? "Desativando..." : "Desativar"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
