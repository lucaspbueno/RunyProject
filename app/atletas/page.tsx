"use client";

import { useState, useEffect, type MouseEvent } from "react";
import { Navigation } from "@/components/navigation";
import { Wrapper } from "@/components/wrapper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpcClient } from "@/lib/trpc-client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { Plus, Edit, Trash2, Calendar, Mail, RotateCcw, User } from "lucide-react";

interface Athlete {
  id: number;
  name: string;
  email: string;
  dateOfBirth: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt?: Date | string | null;
}

interface PaginatedAthletes {
  items: Athlete[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export default function AtletasPage() {
  const [athletes, setAthletes] = useState<PaginatedAthletes | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [reactivatingId, setReactivatingId] = useState<number | null>(null);
  const [confirmacao_desativar_id, setConfirmacao_desativar_id] = useState<number | null>(null);
  const [mostrar_desativados, setMostrar_desativados] = useState(false);
  const [atleta_selecionado, setAtleta_selecionado] = useState<Athlete | null>(null);
  const [modal_aberto, setModal_aberto] = useState(false);
  const { toast } = useToast();

  const obter_data_pura_iso = (valor: Date | string): string => {
    if (typeof valor === "string") {
      return valor.slice(0, 10);
    }

    return valor.toISOString().slice(0, 10);
  };

  const formatar_data_pura_br = (valor: Date | string): string => {
    const data_pura: string = obter_data_pura_iso(valor);
    const [ano, mes, dia] = data_pura.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  const loadAthletes = async (page: number = 1) => {
    try {
      setLoading(true);
      const result = await trpcClient.athletes.list.query({
        page,
        limit: 10,
        includeDeleted: mostrar_desativados,
      });
      setAthletes(result);
      setCurrentPage(page);
    } catch (error) {
      console.error("Erro ao carregar atletas:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar a lista de atletas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id);
      await trpcClient.athletes.delete.mutate({ id });
      
      toast({
        title: "Sucesso",
        description: "Atleta desativado com sucesso",
      });
      
      await loadAthletes(currentPage);
    } catch (error) {
      console.error("Erro ao desativar atleta:", error);
      toast({
        title: "Erro",
        description: "Falha ao desativar o atleta",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleReactivate = async (id: number) => {
    try {
      setReactivatingId(id);
      await trpcClient.athletes.reactivate.mutate({ id });

      toast({
        title: "Sucesso",
        description: "Atleta reativado com sucesso",
      });

      setModal_aberto(false);
      await loadAthletes(currentPage);
    } catch (error) {
      console.error("Erro ao reativar atleta:", error);
      toast({
        title: "Erro",
        description: "Falha ao reativar o atleta",
        variant: "destructive",
      });
    } finally {
      setReactivatingId(null);
    }
  };

  useEffect(() => {
    loadAthletes();
  }, [mostrar_desativados]);

  const handle_row_click = (atleta: Athlete, event: MouseEvent) => {
    const alvo: HTMLElement = event.target as HTMLElement;
    const clicou_em_botao: Element | null = alvo.closest("button");
    const clicou_em_link: Element | null = alvo.closest("a");

    if (confirmacao_desativar_id !== null) {
      return;
    }

    if (!clicou_em_botao && !clicou_em_link) {
      setAtleta_selecionado(atleta);
      setModal_aberto(true);
    }
  };

  const calculateAge = (dateOfBirth: Date | string) => {
    const today = new Date();
    const data_pura: string = obter_data_pura_iso(dateOfBirth);
    const [ano_str, mes_str, dia_str] = data_pura.split("-");
    const ano: number = Number(ano_str);
    const mes: number = Number(mes_str);
    const dia: number = Number(dia_str);

    let age = today.getFullYear() - ano;
    const monthDiff = (today.getMonth() + 1) - mes;
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dia)) {
      age--;
    }
    
    return age;
  };

  return (
    <Wrapper>
      <Navigation />
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Atletas</CardTitle>
              <CardDescription>
                Gerencie o cadastro de atletas e suas informações
              </CardDescription>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="mostrar-desativados" className="text-sm">
                  Mostrar desativados
                </Label>
                <Switch
                  id="mostrar-desativados"
                  checked={mostrar_desativados}
                  onCheckedChange={setMostrar_desativados}
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
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Carregando atletas...</p>
            </div>
          ) : athletes && athletes.items.length > 0 ? (
            <div className="space-y-4">
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
                    {athletes.items.map((athlete) => (
                      <TableRow
                        key={athlete.id}
                        className={`cursor-pointer hover:bg-muted/50 transition-colors`}
                        onClick={(e) => handle_row_click(athlete, e)}
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
                            {formatar_data_pura_br(athlete.dateOfBirth)}
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
                                open={confirmacao_desativar_id === athlete.id}
                                onOpenChange={(aberto) => {
                                  if (aberto) {
                                    setConfirmacao_desativar_id(athlete.id);
                                    return;
                                  }

                                  setConfirmacao_desativar_id((valor_atual) => {
                                    if (valor_atual === athlete.id) {
                                      return null;
                                    }

                                    return valor_atual;
                                  });
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
                                      Tem certeza que deseja desativar o atleta "{athlete.name}"? 
                                      O atleta será desativado mas seus dados serão preservados.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(athlete.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      {deletingId === athlete.id ? "Desativando..." : "Desativar"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}

                            {athlete.deletedAt && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReactivate(athlete.id)}
                                disabled={reactivatingId === athlete.id}
                                title="Reativar atleta"
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
                  Mostrando {athletes.items.length} de {athletes.totalCount} atletas
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadAthletes(currentPage - 1)}
                    disabled={!athletes.hasPreviousPage || loading}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadAthletes(currentPage + 1)}
                    disabled={!athletes.hasNextPage || loading}
                  >
                    Próximo
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-muted-foreground">
                <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Nenhum atleta encontrado</h3>
                <p className="mb-4">Comece cadastrando seu primeiro atleta</p>
                <Button asChild>
                  <Link href="/atletas/novo">
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Atleta
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de visualização do atleta */}
      <Dialog open={modal_aberto} onOpenChange={setModal_aberto}>
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

          {atleta_selecionado && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nome</label>
                <p className="text-base font-semibold">{atleta_selecionado.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-base flex items-center">
                  <Mail className="mr-1 h-4 w-4 text-muted-foreground" />
                  {atleta_selecionado.email}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Idade</label>
                  <p className="text-base">
                    {calculateAge(atleta_selecionado.dateOfBirth)} anos
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Data de nascimento</label>
                  <p className="text-base">
                    {formatar_data_pura_br(atleta_selecionado.dateOfBirth)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Cadastrado em</label>
                  <p className="text-base">
                    {format(new Date(atleta_selecionado.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    {atleta_selecionado.deletedAt ? (
                      <Badge variant="warning">Desativado</Badge>
                    ) : (
                      <Badge variant="success">Ativo</Badge>
                    )}
                  </div>
                </div>
              </div>

              {atleta_selecionado.deletedAt && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Data de desativação</label>
                  <p className="text-base">
                    {format(new Date(atleta_selecionado.deletedAt), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            {atleta_selecionado && (
              <Button variant="outline" asChild>
                <Link href={`/treinos/atleta/${atleta_selecionado.id}?permitir_desativado=1`}>
                  Ver treinos
                </Link>
              </Button>
            )}

            <Button variant="outline" onClick={() => setModal_aberto(false)}>
              Fechar
            </Button>

            {atleta_selecionado?.deletedAt && (
              <Button
                onClick={() => handleReactivate(atleta_selecionado.id)}
                disabled={reactivatingId === atleta_selecionado.id}
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
