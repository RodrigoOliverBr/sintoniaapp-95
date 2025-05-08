
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormResult } from "@/types/form";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, AlertCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface EmployeeEvaluationHistoryProps {
  evaluations: FormResult[];
  onViewEvaluation: (evaluation: FormResult) => void;
  onEditEvaluation: (evaluation: FormResult) => void;
  onDeleteEvaluation: (evaluationId: string) => void;
  onNewEvaluation: () => void;
  isLoading?: boolean;
  isDeleting?: boolean;
}

const EmployeeEvaluationHistory: React.FC<EmployeeEvaluationHistoryProps> = ({
  evaluations,
  onViewEvaluation,
  onEditEvaluation,
  onDeleteEvaluation,
  onNewEvaluation,
  isLoading = false,
  isDeleting = false
}) => {
  const [evaluationToDelete, setEvaluationToDelete] = React.useState<string | null>(null);

  const handleDelete = (evaluationId: string) => {
    setEvaluationToDelete(evaluationId);
  };

  const confirmDelete = () => {
    if (evaluationToDelete) {
      onDeleteEvaluation(evaluationToDelete);
      setEvaluationToDelete(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Histórico de Avaliações</CardTitle>
        <Button onClick={onNewEvaluation}>Nova Avaliação</Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        ) : evaluations.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <p className="mt-2 text-lg font-medium">Nenhuma avaliação encontrada</p>
            <p className="text-sm text-muted-foreground">
              Este funcionário ainda não possui avaliações registradas.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {evaluations.map((evaluation) => (
              <div
                key={evaluation.id}
                className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4"
              >
                <div className="space-y-1">
                  <div className="font-medium">
                    {format(parseISO(evaluation.created_at), "PPP", { locale: ptBR })}
                  </div>
                  <div className="text-sm text-muted-foreground flex gap-2">
                    <span>
                      Sim: {evaluation.total_sim}
                    </span>
                    <span>•</span>
                    <span>
                      Não: {evaluation.total_nao}
                    </span>
                    <span>•</span>
                    <span>
                      Status: {evaluation.is_complete ? "Completo" : "Em andamento"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-2 md:mt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewEvaluation(evaluation)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditEvaluation(evaluation)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDelete(evaluation.id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <AlertDialog open={!!evaluationToDelete} onOpenChange={(open) => !open && setEvaluationToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta avaliação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-700"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default EmployeeEvaluationHistory;
