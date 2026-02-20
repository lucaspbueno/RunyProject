import { Button } from "@/components/ui/button";

interface AthletesPaginationProps {
  currentPage: number;
  totalCount: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  loading: boolean;
  onPageChange: (page: number) => void;
}

/**
 * Componente de paginação para lista de atletas
 */
export function AthletesPagination({
  currentPage,
  totalCount,
  itemsPerPage,
  hasNextPage,
  hasPreviousPage,
  loading,
  onPageChange
}: AthletesPaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalCount);

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        Mostrando {startItem}-{endItem} de {totalCount} atletas
      </div>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPreviousPage || loading}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage || loading}
        >
          Próximo
        </Button>
      </div>
    </div>
  );
}
