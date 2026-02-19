"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { Wrapper } from "@/components/wrapper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpcClient } from "@/lib/trpc-client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { Dumbbell, Users, Calendar, Clock } from "lucide-react";

interface Athlete {
  id: number;
  name: string;
  email: string;
  dateOfBirth: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface TrainingStats {
  totalTrainings: number;
  lastTraining?: Date;
}

export default function TreinosPage() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadAthletes = async () => {
    try {
      setLoading(true);
      const result = await trpcClient.athletes.list.query({ page: 1, limit: 50 });
      setAthletes(result.items);
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

  useEffect(() => {
    loadAthletes();
  }, []);

  const calculateAge = (dateOfBirth: Date) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
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
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Carregando atletas...</p>
            </div>
          ) : athletes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {athletes.map((athlete) => (
                <Card key={athlete.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{athlete.name}</CardTitle>
                      <Badge variant="secondary">
                        {calculateAge(athlete.dateOfBirth)} anos
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">
                      {athlete.email}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-2 h-4 w-4" />
                        Cadastrado em {format(new Date(athlete.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                      
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="mr-2 h-4 w-4" />
                        ID: {athlete.id}
                      </div>
                      
                      <Button asChild className="w-full">
                        <Link href={`/treinos/atleta/${athlete.id}`}>
                          <Clock className="mr-2 h-4 w-4" />
                          Ver Treinos
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-muted-foreground">
                <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Nenhum atleta encontrado</h3>
                <p className="mb-4">Cadastre atletas para começar a gerenciar treinos</p>
                <Button asChild>
                  <Link href="/atletas/novo">
                    <Users className="mr-2 h-4 w-4" />
                    Cadastrar Atleta
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Wrapper>
  );
}
