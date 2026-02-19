"use client";

import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createAthleteSchema, type CreateAthleteInput } from "@/shared/schemas/athlete-schema";
import { trpcClient } from "@/lib/trpc-client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Athlete {
  id: number;
  name: string;
  email: string;
  dateOfBirth: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt?: Date | string | null;
}

interface AthleteFormProps {
  athlete?: Athlete | null;
  isEditing?: boolean;
  onCancel?: () => void;
  onSuccess?: () => void;
}

/**
 * Formulário de atleta com react-hook-form + zod
 */
export function AthleteForm({ athlete, isEditing = false, onCancel, onSuccess }: AthleteFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const form = useForm({
    resolver: zodResolver(createAthleteSchema),
    defaultValues: athlete ? {
      name: athlete.name,
      email: athlete.email,
      dateOfBirth: typeof athlete.dateOfBirth === 'string' 
        ? athlete.dateOfBirth 
        : athlete.dateOfBirth.toISOString().split('T')[0]
    } : {
      name: "",
      email: "",
      dateOfBirth: ""
    }
  });

  const loading = form.formState.isSubmitting;

  const onSubmit: SubmitHandler<CreateAthleteInput> = async (data) => {
    try {
      if (isEditing && athlete) {
        await trpcClient.athletes.update.mutate({
          id: athlete.id,
          data
        });
        toast({
          title: "Sucesso",
          description: "Atleta atualizado com sucesso",
        });
      } else {
        await trpcClient.athletes.create.mutate(data);
        toast({
          title: "Sucesso", 
          description: "Atleta criado com sucesso",
        });
      }

      onSuccess?.();
      router.push("/atletas");
    } catch (error) {
      console.error("Erro ao salvar atleta:", error);
      toast({
        title: "Erro",
        description: isEditing 
          ? "Falha ao atualizar o atleta" 
          : "Falha ao criar o atleta",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center">
          <Button variant="outline" size="sm" asChild className="mr-4">
            <Link href="/atletas">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <div>
            <CardTitle>
              {isEditing ? "Editar Atleta" : "Novo Atleta"}
            </CardTitle>
            <CardDescription>
              {isEditing 
                ? "Atualize as informações do atleta"
                : "Preencha os dados para cadastrar um novo atleta"
              }
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input
              id="name"
              placeholder="Digite o nome completo"
              {...form.register("name")}
              disabled={loading}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Digite o email"
              {...form.register("email")}
              disabled={loading}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Data de nascimento</Label>
            <Input
              id="dateOfBirth"
              type="date"
              {...form.register("dateOfBirth")}
              disabled={loading}
              max={new Date().toISOString().split('T')[0]}
            />
            {form.formState.errors.dateOfBirth && (
              <p className="text-sm text-destructive">
                {form.formState.errors.dateOfBirth.message}
              </p>
            )}
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Salvando..." : (isEditing ? "Atualizar" : "Cadastrar")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
