"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { Wrapper } from "@/components/wrapper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpcClient } from "@/lib/trpc-client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Zap } from "lucide-react";
import Link from "next/link";
import type { Athlete, CreateTrainingForm } from "@/shared/types";

const intensityOptions = [
  { value: "low", label: "Baixa", description: "Treino leve, aquecimento ou recuperação" },
  { value: "moderate", label: "Moderada", description: "Treino de intensidade intermediária" },
  { value: "high", label: "Alta", description: "Treino intenso, de alta performance" },
];

export default function NovoTreinoPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [form, setForm] = useState<CreateTrainingForm>({
    type: "",
    durationMinutes: "",
    intensity: "moderate",
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<CreateTrainingForm>>({});

  const athleteId = parseInt(params.id as string);

  const loadAthlete = async () => {
    try {
      setInitialLoading(true);
      const result = await trpcClient.athletes.list.query({ page: 1, limit: 50 });
      const foundAthlete = result.items.find(a => a.id === athleteId);
      
      if (!foundAthlete) {
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
        description: "Falha ao carregar os dados do atleta",
        variant: "destructive",
      });
      router.push("/treinos");
    } finally {
      setInitialLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateTrainingForm> = {};

    if (!form.type || form.type.length < 3) {
      newErrors.type = "Tipo deve ter pelo menos 3 caracteres";
    }

    if (!form.durationMinutes || parseInt(form.durationMinutes) <= 0) {
      newErrors.durationMinutes = "Duração deve ser um número positivo";
    } else if (parseInt(form.durationMinutes) > 480) {
      newErrors.durationMinutes = "Duração máxima é de 8 horas (480 minutos)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await trpcClient.trainings.create.mutate({
        athleteId,
        type: form.type,
        durationMinutes: parseInt(form.durationMinutes),
        intensity: form.intensity,
        ...(form.notes && { notes: form.notes }),
      });
      
      toast({
        title: "Sucesso",
        description: "Treino criado com sucesso",
      });
      
      router.push(`/treinos/atleta/${athleteId}`);
    } catch (error) {
      console.error("Erro ao criar treino:", error);
      toast({
        title: "Erro",
        description: "Falha ao criar o treino",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateTrainingForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  useEffect(() => {
    if (athleteId) {
      loadAthlete();
    }
  }, [athleteId]);

  if (initialLoading) {
    return (
      <Wrapper>
        <Navigation />
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando dados do atleta...</p>
        </div>
      </Wrapper>
    );
  }

  if (!athlete) {
    return (
      <Wrapper>
        <Navigation />
        <div className="text-center py-8">
          <p className="text-muted-foreground">Atleta não encontrado</p>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Navigation />
      
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href={`/treinos/atleta/${athleteId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Treinos
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Novo Treino</CardTitle>
            <CardDescription>
              Cadastre um novo treino para: <span className="font-medium">{athlete.name}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Treino *</Label>
                <Input
                  id="type"
                  type="text"
                  value={form.type}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                  placeholder="Ex: Corrida, Musculação, Natação"
                  className={errors.type ? "border-red-500" : ""}
                  disabled={loading}
                />
                {errors.type && (
                  <p className="text-sm text-red-500">{errors.type}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="durationMinutes">Duração (minutos) *</Label>
                <Input
                  id="durationMinutes"
                  type="number"
                  value={form.durationMinutes}
                  onChange={(e) => handleInputChange("durationMinutes", e.target.value)}
                  placeholder="60"
                  min="1"
                  max="480"
                  className={errors.durationMinutes ? "border-red-500" : ""}
                  disabled={loading}
                />
                {errors.durationMinutes && (
                  <p className="text-sm text-red-500">{errors.durationMinutes}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Intensidade *</Label>
                <div className="space-y-3">
                  {intensityOptions.map((option) => (
                    <div key={option.value} className="flex items-start space-x-3">
                      <input
                        type="radio"
                        id={option.value}
                        name="intensity"
                        value={option.value}
                        checked={form.intensity === option.value}
                        onChange={(e) => handleInputChange("intensity", e.target.value as "low" | "moderate" | "high")}
                        disabled={loading}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor={option.value} className="font-medium cursor-pointer">
                          <Zap className="inline mr-2 h-4 w-4" />
                          {option.label}
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Observações adicionais sobre o treino (opcional)"
                  rows={4}
                  className="w-full p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={loading}
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/treinos/atleta/${athleteId}`)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Treino
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Wrapper>
  );
}
