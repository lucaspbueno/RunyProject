"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { Wrapper } from "@/components/wrapper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpcClient } from "@/lib/trpc-client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Clock,
  Zap,
  User,
  RotateCcw,
} from "lucide-react";
import { calculateAge } from "@/lib/date";
import type { Athlete, Training, PaginatedResponse } from "@/shared/types";

const intensityLabels = {
  low: "Baixa",
  moderate: "Moderada",
  high: "Alta",
};

const intensityColors = {
  low: "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-600 dark:text-white dark:hover:bg-green-700",
  moderate:
    "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-600 dark:text-white dark:hover:bg-yellow-700",
  high: "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-600 dark:text-white dark:hover:bg-red-700",
};

export default function TreinosAtletaPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [trainings, setTrainings] =
    useState<PaginatedResponse<Training> | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reactivatingId, setReactivatingId] = useState<number | null>(null);

  const athleteId = parseInt(params.id as string);
  const permitir_desativado: boolean =
    searchParams.get("permitir_desativado") === "1";

  const loadAthlete = useCallback(async () => {
    try {
      const foundAthlete = await trpcClient.athletes.getById.query({
        id: athleteId,
      });

      // Atleta desativado só é permitido quando a URL traz o flag explícito
      if (foundAthlete.deletedAt && !permitir_desativado) {
        toast({
          title: "Erro",
          description: "Atleta não encontrado",
          variant: "destructive",
        });
        router.push("/treinos");
        return;
      }

      setAthlete(foundAthlete);
    } catch (error) {
      console.error("Erro ao carregar atleta:", error);
      toast({
        title: "Erro",
        description: "Atleta não encontrado ou falha ao carregar os dados.",
        variant: "destructive",
      });
      router.push("/treinos");
    }
  }, [athleteId, permitir_desativado, router, toast]);

  const loadTrainings = useCallback(
    async (page: number = 1) => {
      try {
        setLoading(true);
        const result = await trpcClient.trainings.listByAthlete.query({
          athleteId,
          page,
          limit: 10,
          includeDeleted: showInactive,
        });
        setTrainings(result);
        setCurrentPage(page);
      } catch (error) {
        console.error("Erro ao carregar treinos:", error);
        toast({
          title: "Erro",
          description: "Falha ao carregar a lista de treinos",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [athleteId, showInactive, toast],
  );

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id);
      await trpcClient.trainings.delete.mutate({ id });

      toast({
        title: "Sucesso",
        description: "Treino desativado com sucesso",
      });

      await loadTrainings(currentPage);
    } catch (error) {
      console.error("Erro ao excluir treino:", error);
      toast({
        title: "Erro",
        description: "Falha ao desativar o treino",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleReactivate = async (id: number) => {
    try {
      setReactivatingId(id);
      await trpcClient.trainings.reactivate.mutate({ id });

      toast({
        title: "Sucesso",
        description: "Treino reativado com sucesso",
      });

      setIsModalOpen(false);
      await loadTrainings(currentPage);
    } catch (error) {
      console.error("Erro ao reativar treino:", error);
      toast({
        title: "Erro",
        description: "Falha ao reativar o treino",
        variant: "destructive",
      });
    } finally {
      setReactivatingId(null);
    }
  };

  const handleRowClick = (training: Training, event: React.MouseEvent) => {
    // Verificar se o clique foi em um botão ou elemento interativo
    const target = event.target as HTMLElement;
    const isButton = target.closest("button");
    const isLink = target.closest("a");

    if (!isButton && !isLink) {
      setSelectedTraining(training);
      setIsModalOpen(true);
    }
  };

  // Carrega o atleta uma vez (ou quando athleteId / permitir_desativado mudar)
  useEffect(() => {
    loadAthlete();
  }, [loadAthlete]);

  // Recarrega treinos quando athleteId ou showInactive mudar
  useEffect(() => {
    loadTrainings();
  }, [loadTrainings]);

  if (!athlete) {
    return (
      <Wrapper>
        <Navigation />
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">
            Carregando dados do atleta...
          </p>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Navigation />

      <div className="space-y-6">
        {/* Header com informações do atleta */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" asChild>
                  <Link href="/treinos">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                  </Link>
                </Button>
                <div>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    {athlete.name}
                  </CardTitle>
                  <CardDescription>
                    {athlete.email} • {calculateAge(athlete.dateOfBirth)} anos
                  </CardDescription>
                </div>
              </div>
              <Button asChild>
                <Link href={`/treinos/atleta/${athleteId}/novo`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Treino
                </Link>
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Lista de treinos */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  Treinos
                </CardTitle>
                <CardDescription>
                  Histórico de treinos do atleta
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="show-inactive" className="text-sm">
                  Mostrar desativados
                </Label>
                <Switch
                  id="show-inactive"
                  checked={showInactive}
                  onCheckedChange={setShowInactive}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">
                  Carregando treinos...
                </p>
              </div>
            ) : trainings && trainings.items.length > 0 ? (
              <div className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Duração</TableHead>
                        <TableHead>Intensidade</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trainings.items.map((training) => (
                        <TableRow
                          key={training.id}
                          className={`cursor-pointer hover:bg-muted/50 transition-colors`}
                          onClick={(e) => handleRowClick(training, e)}
                        >
                          <TableCell
                            className={`font-medium ${training.deletedAt ? "opacity-40" : ""}`}
                          >
                            {training.type}
                            {training.deletedAt && (
                              <Badge variant="warning" className="ml-2 text-xs">
                                Desativado
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell
                            className={training.deletedAt ? "opacity-40" : ""}
                          >
                            <div className="flex items-center">
                              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                              {training.durationMinutes} min
                            </div>
                          </TableCell>
                          <TableCell
                            className={training.deletedAt ? "opacity-40" : ""}
                          >
                            <Badge
                              className={intensityColors[training.intensity]}
                            >
                              <Zap className="mr-1 h-3 w-3" />
                              {intensityLabels[training.intensity]}
                            </Badge>
                          </TableCell>
                          <TableCell
                            className={training.deletedAt ? "opacity-40" : ""}
                          >
                            {format(
                              new Date(training.createdAt),
                              "dd/MM/yyyy HH:mm",
                              { locale: ptBR },
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              {training.deletedAt ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled
                                  className="opacity-40 pointer-events-none"
                                  title="Não é possível editar treinos desativados"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  asChild
                                  title="Editar treino"
                                >
                                  <Link
                                    href={`/treinos/atleta/${athleteId}/${training.id}/editar`}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Link>
                                </Button>
                              )}

                              {!training.deletedAt && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      disabled={deletingId === training.id}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Confirmar desativação
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Tem certeza que deseja desativar o
                                        treino {training.type}? O treino será
                                        desativado mas seus dados serão
                                        preservados.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancelar
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleDelete(training.id)
                                        }
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        {deletingId === training.id
                                          ? "Desativando..."
                                          : "Desativar"}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}

                              {training.deletedAt && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleReactivate(training.id)}
                                  disabled={reactivatingId === training.id}
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Paginação */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {trainings.items.length} de {trainings.totalCount}{" "}
                    treinos
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadTrainings(currentPage - 1)}
                      disabled={!trainings.hasPreviousPage || loading}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadTrainings(currentPage + 1)}
                      disabled={!trainings.hasNextPage || loading}
                    >
                      Próximo
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-muted-foreground">
                  <Clock className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">
                    Nenhum treino encontrado
                  </h3>
                  <p className="mb-4">
                    Este atleta ainda não possui treinos cadastrados
                  </p>
                  <Button asChild>
                    <Link href={`/treinos/atleta/${athleteId}/novo`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Primeiro Treino
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de visualização do treino */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Detalhes do Treino
            </DialogTitle>
            <DialogDescription>
              Informações completas do treino selecionado
            </DialogDescription>
          </DialogHeader>

          {selectedTraining && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Tipo
                </label>
                <p className="text-base font-semibold">
                  {selectedTraining.type}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Duração
                  </label>
                  <p className="text-base flex items-center">
                    <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                    {selectedTraining.durationMinutes} min
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Intensidade
                  </label>
                  <div className="mt-1">
                    <Badge
                      className={intensityColors[selectedTraining.intensity]}
                    >
                      <Zap className="mr-1 h-3 w-3" />
                      {intensityLabels[selectedTraining.intensity]}
                    </Badge>
                  </div>
                </div>
              </div>

              {selectedTraining.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Descrição
                  </label>
                  <p className="text-base mt-1">{selectedTraining.notes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Data de Criação
                  </label>
                  <p className="text-base">
                    {format(
                      new Date(selectedTraining.createdAt),
                      "dd/MM/yyyy HH:mm",
                      { locale: ptBR },
                    )}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Status
                  </label>
                  <div className="mt-1">
                    {selectedTraining.deletedAt ? (
                      <Badge variant="warning">Desativado</Badge>
                    ) : (
                      <Badge variant="success">Ativo</Badge>
                    )}
                  </div>
                </div>
              </div>

              {selectedTraining.deletedAt && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Data de Desativação
                  </label>
                  <p className="text-base">
                    {format(
                      new Date(selectedTraining.deletedAt),
                      "dd/MM/yyyy HH:mm",
                      { locale: ptBR },
                    )}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Fechar
            </Button>

            {selectedTraining?.deletedAt && (
              <Button
                onClick={() => handleReactivate(selectedTraining.id)}
                disabled={reactivatingId === selectedTraining.id}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reativar
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Wrapper>
  );
}
