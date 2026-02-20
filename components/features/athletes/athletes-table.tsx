"use client";

import { type MouseEvent } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDateBR, calculateAge } from "@/lib/date";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Mail } from "lucide-react";
import { AthleteActions } from "./athlete-actions";
import type { Athlete } from "@/shared/types";

interface AthletesTableProps {
  athletes: Athlete[];
  deletingId: number | string | null;
  onRowClick: (athlete: Athlete, event: MouseEvent) => void;
  onDelete: (id: number | string) => void;
}

/**
 * Tabela de atletas com ações de edição e exclusão
 */
export function AthletesTable({
  athletes,
  deletingId,
  onRowClick,
  onDelete,
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
                <AthleteActions
                  athlete={athlete}
                  onDelete={onDelete}
                  deletingId={deletingId}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
