"use client";

import { Navigation } from "@/components/navigation";
import { Wrapper } from "@/components/wrapper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { TrainingsGrid } from "@/components/features/trainings/trainings-grid";
import { useAthletesList } from "@/hooks/athletes/use-athletes-list";
import { Dumbbell, Users } from "lucide-react";

export default function TreinosPage() {
  const {
    athletes,
    loading,
    error,
    refetch
  } = useAthletesList({
    limit: 50
  });

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
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <Dumbbell className="mr-2 h-5 w-5" />
                Treinos
              </CardTitle>
              <CardDescription>
                Visualize e gerencie os treinos de todos os atletas
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingState message="Carregando atletas..." />
          ) : athletes && athletes.items.length > 0 ? (
            <TrainingsGrid athletes={athletes.items} />
          ) : (
            <EmptyState
              icon={Users}
              title="Nenhum atleta encontrado"
              description="Cadastre atletas para começar a gerenciar treinos"
              actionText="Cadastrar Atleta"
              actionHref="/atletas/novo"
            />
          )}
        </CardContent>
      </Card>
    </Wrapper>
  );
}
