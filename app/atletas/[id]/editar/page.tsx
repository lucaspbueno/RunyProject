"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpcClient } from "@/lib/trpc-client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import type { Athlete, UpdateAthleteForm } from "@/shared/types";

export default function EditarAtletaPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [form, setForm] = useState<UpdateAthleteForm>({
    name: "",
    email: "",
    dateOfBirth: "",
  });
  const [errors, setErrors] = useState<Partial<UpdateAthleteForm>>({});

  const athleteId = parseInt(params.id as string);

  const loadAthlete = useCallback(async () => {
    try {
      setInitialLoading(true);
      const foundAthlete = await trpcClient.athletes.getById.query({
        id: athleteId,
      });

      setAthlete(foundAthlete);
      setForm({
        name: foundAthlete.name,
        email: foundAthlete.email,
        dateOfBirth: new Date(foundAthlete.dateOfBirth)
          .toISOString()
          .split("T")[0],
      });
    } catch (error) {
      console.error("Erro ao carregar atleta:", error);
      toast({
        title: "Erro",
        description: "Atleta não encontrado ou falha ao carregar os dados.",
        variant: "destructive",
      });
      router.push("/atletas");
    } finally {
      setInitialLoading(false);
    }
  }, [athleteId, router, toast]);

  const validateForm = (): boolean => {
    const newErrors: Partial<UpdateAthleteForm> = {};

    if (!form.name || form.name.length < 3) {
      newErrors.name = "Nome deve ter pelo menos 3 caracteres";
    }

    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Email inválido";
    }

    if (!form.dateOfBirth) {
      newErrors.dateOfBirth = "Data de nascimento é obrigatória";
    } else {
      const birthDate = new Date(form.dateOfBirth);
      const today = new Date();
      if (birthDate >= today) {
        newErrors.dateOfBirth = "Data de nascimento deve estar no passado";
      }
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
      await trpcClient.athletes.update.mutate({
        id: athleteId,
        data: form,
      });

      toast({
        title: "Sucesso",
        description: "Atleta atualizado com sucesso",
      });

      router.push("/atletas");
    } catch (error) {
      console.error("Erro ao atualizar atleta:", error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar o atleta",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UpdateAthleteForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  useEffect(() => {
    if (athleteId) {
      loadAthlete();
    }
  }, [athleteId, loadAthlete]);

  if (initialLoading) {
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
            <Link href="/atletas">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Atletas
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Editar Atleta</CardTitle>
            <CardDescription>
              Atualize as informações do atleta:{" "}
              <span className="font-medium">{athlete.name}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo *</Label>
                <Input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Digite o nome completo do atleta"
                  className={errors.name ? "border-red-500" : ""}
                  disabled={loading}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="atleta@exemplo.com"
                  className={errors.email ? "border-red-500" : ""}
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Data de Nascimento *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) =>
                    handleInputChange("dateOfBirth", e.target.value)
                  }
                  className={errors.dateOfBirth ? "border-red-500" : ""}
                  disabled={loading}
                  max={new Date().toISOString().split("T")[0]}
                />
                {errors.dateOfBirth && (
                  <p className="text-sm text-red-500">{errors.dateOfBirth}</p>
                )}
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/atletas")}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Atualizar Atleta
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
