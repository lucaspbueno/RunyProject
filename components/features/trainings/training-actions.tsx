import { EditButton } from "@/components/ui/actions/edit-button";
import { DeleteButton } from "@/components/ui/actions/delete-button";
import { ReactivateButton } from "@/components/ui/actions/reactivate-button";
import { ActionGroup } from "@/components/ui/actions/action-group";
import type { Training } from "@/shared/types";

interface TrainingActionsProps {
  training: Training;
  athleteId: number;
  onDelete: (id: number | string) => void;
  onReactivate?: (id: number | string) => void;
  deletingId?: number | string | null;
  reactivatingId?: number | string | null;
  showEdit?: boolean;
  showDelete?: boolean;
  showReactivate?: boolean;
}

/**
 * Conjunto de ações para treinos (editar, desativar, reativar)
 */
export function TrainingActions({
  training,
  athleteId,
  onDelete,
  onReactivate,
  deletingId = null,
  reactivatingId = null,
  showEdit = true,
  showDelete = true,
  showReactivate = true
}: TrainingActionsProps) {
  return (
    <ActionGroup>
      {showEdit && (
        training.deletedAt ? (
          <EditButton
            entity={training}
            href={`/treinos/atleta/${athleteId}/:id/editar`}
            disabled={true}
            title="Não é possível editar treinos desativados"
          />
        ) : (
          <EditButton
            entity={training}
            href={`/treinos/atleta/${athleteId}/:id/editar`}
            title="Editar treino"
          />
        )
      )}

      {showDelete && !training.deletedAt && (
        <DeleteButton
          entity={training}
          onDelete={onDelete}
          deletingId={deletingId}
          title="Confirmar desativação"
          description={`Tem certeza que deseja desativar o treino "${training.type}"? O treino será desativado mas seus dados serão preservados.`}
          confirmText="Desativar"
        />
      )}

      {showReactivate && training.deletedAt && onReactivate && (
        <ReactivateButton
          entity={training}
          onReactivate={onReactivate}
          reactivatingId={reactivatingId}
          text="Reativar"
          loadingText="Reativando..."
          title="Reativar treino"
        />
      )}
    </ActionGroup>
  );
}
