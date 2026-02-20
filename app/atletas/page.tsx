"use client";

import { useState, type MouseEvent } from "react";
import { Navigation } from "@/components/navigation";
import { Wrapper } from "@/components/wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { AthletesHeader } from "@/components/features/athletes/athletes-header";
import { AthletesTable } from "@/components/features/athletes/athletes-table";
import { AthletesPagination } from "@/components/features/athletes/athletes-pagination";
import { AthleteDetailsDialog } from "@/components/features/athletes/athlete-details-dialog";
import { useAthletesList } from "@/hooks/athletes/use-athletes-list";
import { trpcClient } from "@/lib/trpc-client";
import { useToast } from "@/hooks/use-toast";
import { Users } from "lucide-react";
import type { Athlete } from "@/shared/types";

export default function AtletasPage() {
  const [mostrarDesativados, setMostrarDesativados] = useState(false);
  const [deletingId, setDeletingId] = useState<number | string | null>(null);
  const [reactivatingId, setReactivatingId] = useState<number | string | null>(null);
  const [atletaSelecionado, setAtletaSelecionado] = useState<Athlete | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const { toast } = useToast();

  const {
    athletes,
    loading,
    error,
    loadAthletes,
    refetch
  } = useAthletesList({
    includeDeleted: mostrarDesativados,
    limit: 10
  });

  const handleDelete = async (id: number | string) => {
    try {
      setDeletingId(id);
      await trpcClient.athletes.delete.mutate({ id: Number(id) });
      
      toast({
        title: "Sucesso",
        description: "Atleta desativado com sucesso",
      });
      
      await refetch();
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

  const handleReactivate = async (id: number | string) => {
    try {
      setReactivatingId(id);
      await trpcClient.athletes.reactivate.mutate({ id: Number(id) });

      toast({
        title: "Sucesso",
        description: "Atleta reativado com sucesso",
      });

      setModalAberto(false);
      await refetch();
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

  const handleRowClick = (atleta: Athlete, event: MouseEvent) => {
    const alvo: HTMLElement = event.target as HTMLElement;
    const clicouEmBotao: Element | null = alvo.closest("button");
    const clicouEmLink: Element | null = alvo.closest("a");

    if (!clicouEmBotao && !clicouEmLink) {
      setAtletaSelecionado(atleta);
      setModalAberto(true);
    }
  };

  if (loading && !athletes) {
    return (
      <Wrapper>
        <Navigation />
        <Card>
          <CardContent>
            <LoadingState message="Carregando atletas..." />
          </CardContent>
        </Card>
      </Wrapper>
    );
  }

  if (error) {
    return (
      <Wrapper>
        <Navigation />
        <Card>
          <CardContent>
            <ErrorState 
              onRetry={refetch}
            />
          </CardContent>
        </Card>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Navigation />
      
      <Card>
        <CardContent className="pt-6">
          <AthletesHeader
            mostrarDesativados={mostrarDesativados}
            onMostrarDesativadosChange={setMostrarDesativados}
          />

          {loading ? (
            <LoadingState message="Carregando atletas..." />
          ) : athletes && athletes.items.length > 0 ? (
            <div className="space-y-4">
              <AthletesTable
                athletes={athletes.items}
                deletingId={deletingId}
                onRowClick={handleRowClick}
                onDelete={handleDelete}
              />

              <AthletesPagination
                currentPage={athletes.currentPage}
                totalCount={athletes.totalCount}
                itemsPerPage={10}
                hasNextPage={athletes.hasNextPage}
                hasPreviousPage={athletes.hasPreviousPage}
                loading={loading}
                onPageChange={loadAthletes}
              />
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="Nenhum atleta encontrado"
              description="Comece cadastrando seu primeiro atleta"
              actionText="Novo Atleta"
              actionHref="/atletas/novo"
            />
          )}
        </CardContent>
      </Card>

      <AthleteDetailsDialog
        athlete={atletaSelecionado}
        open={modalAberto}
        onOpenChange={setModalAberto}
        onReactivate={handleReactivate}
        reactivatingId={reactivatingId as number | null}
      />
    </Wrapper>
  );
}
