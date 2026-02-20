"use client";

import { useState, useEffect, useCallback } from "react";
import { trpcClient } from "@/lib/trpc-client";
import { useToast } from "@/hooks/use-toast";
import type { Athlete, PaginatedResponse } from "@/shared/types";
import type { UseAthletesListOptions, UseAthletesListReturn } from "@/shared/types";

/**
 * Hook para gerenciar lista de atletas com paginação
 * Centraliza lógica de carregamento, erro e estado
 */
export function useAthletesList({
  includeDeleted = false,
  initialPage = 1,
  limit = 10
}: UseAthletesListOptions = {}): UseAthletesListReturn {
  const [athletes, setAthletes] = useState<PaginatedResponse<Athlete> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const { toast } = useToast();

  const loadAthletes = useCallback(async (page: number = currentPage) => {
    try {
      setLoading(true);
      setError(null);
      const result = await trpcClient.athletes.list.query({
        page,
        limit,
        includeDeleted,
      });
      setAthletes(result);
      setCurrentPage(page);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Erro ao carregar atletas");
      setError(error);
      console.error("Erro ao carregar atletas:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar a lista de atletas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, includeDeleted, toast]);

  const refetch = useCallback(async () => {
    await loadAthletes(currentPage);
  }, [loadAthletes, currentPage]);

  useEffect(() => {
    loadAthletes(initialPage);
  }, [includeDeleted]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    athletes,
    loading,
    error,
    currentPage,
    loadAthletes,
    refetch,
    setCurrentPage,
  };
}
