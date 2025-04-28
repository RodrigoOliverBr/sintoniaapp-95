
import React from "react";
import { FormResult } from "@/types/form";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Eye, Trash2, FilePlus } from "lucide-react";
import { ptBR } from "date-fns/locale";

interface EmployeeFormHistoryProps {
  evaluations: FormResult[];
  onShowResults: (evaluation: FormResult) => void;
  onDeleteEvaluation: (id: string) => Promise<void>;
  onEditEvaluation?: (evaluation: FormResult) => void;
  onNewEvaluation: () => void;
  isDeletingEvaluation?: boolean;
}

const EmployeeFormHistory: React.FC<EmployeeFormHistoryProps> = ({
  evaluations,
  onShowResults,
  onDeleteEvaluation,
  onEditEvaluation,
  onNewEvaluation,
  isDeletingEvaluation
}) => {
  if (!evaluations || evaluations.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm text-center">
        <h3 className="text-lg font-medium text-gray-700 mb-4">
          Nenhuma avaliação encontrada
        </h3>
        <p className="text-muted-foreground mb-6">
          Este funcionário ainda não possui avaliações.
        </p>
        <Button onClick={onNewEvaluation} className="flex items-center gap-2">
          <FilePlus size={18} />
          Nova Avaliação
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Histórico de Avaliações</h2>
        <Button 
          onClick={onNewEvaluation}
          className="flex items-center gap-2"
        >
          <FilePlus size={18} />
          Nova Avaliação
        </Button>
      </div>

      {evaluations.map((evaluation) => (
        <div 
          key={evaluation.id}
          className="border rounded-lg p-4 bg-white"
        >
          <div className="flex flex-col md:flex-row justify-between md:items-center">
            <div>
              <h3 className="text-lg font-medium">
                Avaliação {format(new Date(evaluation.created_at), 'dd/MM/yyyy')}
              </h3>
              <div className="flex flex-col space-y-1 md:space-y-0 md:flex-row md:gap-4 text-sm text-muted-foreground">
                <p>
                  Nível de Risco: <span className="font-medium text-green-600">Baixo</span>
                </p>
                <p>
                  Última atualização: {format(
                    new Date(evaluation.last_updated || evaluation.updated_at), 
                    "dd/MM/yyyy 'às' HH:mm",
                    { locale: ptBR }
                  )}
                </p>
              </div>
            </div>

            <div className="flex space-x-2 mt-4 md:mt-0">
              <Button 
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => onShowResults(evaluation)}
              >
                <Eye size={16} />
                Ver Resultados
              </Button>
              
              {onEditEvaluation && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => {
                    if (onEditEvaluation) onEditEvaluation(evaluation);
                  }}
                >
                  <Edit size={16} />
                  Editar
                </Button>
              )}
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-2 border-destructive text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 size={16} />
                    Excluir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Isso excluirá permanentemente esta avaliação
                      e todos os resultados associados.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      disabled={isDeletingEvaluation}
                      onClick={(e) => {
                        e.preventDefault();
                        onDeleteEvaluation(evaluation.id);
                      }}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {isDeletingEvaluation ? "Excluindo..." : "Excluir avaliação"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmployeeFormHistory;
