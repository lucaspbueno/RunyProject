import { EditButton } from "@/components/ui/actions/edit-button";
import { DeleteButton } from "@/components/ui/actions/delete-button";
import { ReactivateButton } from "@/components/ui/actions/reactivate-button";
import { ActionGroup } from "@/components/ui/actions/action-group";

interface Athlete {
  id: number;
  name: string;
  email: string;
  dateOfBirth: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt?: Date | string | null;
}

interface AthleteActionsProps {
  athlete: Athlete;
  onDelete: (id: number | string) => void;
  onReactivate?: (id: number | string) => void;
  deletingId?: number | string | null;
  reactivatingId?: number | string | null;
  showEdit?: boolean;
  showDelete?: boolean;
  showReactivate?: boolean;
}

/**
 * Conjunto de ações para atletas (editar, desativar, reativar)
 */
export function AthleteActions({
  athlete,
  onDelete,
  onReactivate,
  deletingId = null,
  reactivatingId = null,
  showEdit = true,
  showDelete = true,
  showReactivate = true
}: AthleteActionsProps) {
  return (
    <ActionGroup>
      {showEdit && (
        athlete.deletedAt ? (
          <EditButton
            entity={athlete}
            href="/atletas/:id/editar"
            disabled={true}
            title="Não é possível editar atletas desativados"
          />
        ) : (
          <EditButton
            entity={athlete}
            href="/atletas/:id/editar"
            title="Editar atleta"
          />
        )
      )}

      {showDelete && !athlete.deletedAt && (
        <DeleteButton
          entity={athlete}
          onDelete={onDelete}
          deletingId={deletingId}
          title="Confirmar desativação"
          description={`Tem certeza que deseja desativar o atleta "${athlete.name}"? O atleta será desativado mas seus dados serão preservados.`}
          confirmText="Desativar"
        />
      )}

      {showReactivate && athlete.deletedAt && onReactivate && (
        <ReactivateButton
          entity={athlete}
          onReactivate={onReactivate}
          reactivatingId={reactivatingId}
          text="Reativar"
          loadingText="Reativando..."
          title="Reativar atleta"
        />
      )}
    </ActionGroup>
  );
}
