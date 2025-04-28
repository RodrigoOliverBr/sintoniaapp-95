
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormResult } from "@/types/form";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface EmployeeFormHistoryProps {
  evaluations: FormResult[];
  onShowResults: (evaluation: FormResult) => void;
  onNewEvaluation: () => void;
  onDeleteEvaluation: (evaluationId: string) => Promise<void>;
  onEditEvaluation?: (evaluation: FormResult) => void;
  isDeletingEvaluation?: boolean;
}

const EmployeeFormHistory: React.FC<EmployeeFormHistoryProps> = ({
  evaluations,
  onShowResults,
  onNewEvaluation,
  onDeleteEvaluation,
  onEditEvaluation,
  isDeletingEvaluation
}) => {
  const [evaluationToDelete, setEvaluationToDelete] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { toast } = useToast();

  const handleConfirmDelete = async () => {
    if (evaluationToDelete) {
      try {
        await onDeleteEvaluation(evaluationToDelete);
        toast({
          title: "Avaliação excluída",
          description: "A avaliação foi excluída com sucesso",
        });
        setIsConfirmOpen(false);
        setEvaluationToDelete(null);
      } catch (error) {
        console.error("Error deleting evaluation:", error);
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível excluir a avaliação",
          variant: "destructive"
        });
      }
    }
  };

  const handleDelete = (evaluationId: string) => {
    setEvaluationToDelete(evaluationId);
    setIsConfirmOpen(true);
  };

  // Sort evaluations by date, most recent first
  const sortedEvaluations = [...evaluations].sort((a, b) => {
    const dateA = new Date(a.created_at || Date.now());
    const dateB = new Date(b.created_at || Date.now());
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Histórico de Avaliações</h2>
        <Button onClick={onNewEvaluation} className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Nova Avaliação
        </Button>
      </div>

      {sortedEvaluations.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              Este funcionário ainda não possui avaliações registradas.
            </p>
            <Button onClick={onNewEvaluation} className="mt-4">
              Criar Primeira Avaliação
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sortedEvaluations.map((evaluation) => {
            const date = evaluation.created_at
              ? format(new Date(evaluation.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
              : "Data desconhecida";
            
            const time = evaluation.created_at
              ? format(new Date(evaluation.created_at), "HH:mm", { locale: ptBR })
              : "";

            return (
              <Card key={evaluation.id} className="overflow-hidden">
                <CardHeader className="bg-muted/40 py-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-medium">
                      Avaliação {evaluation.is_complete ? "Completa" : "Incompleta"}
                    </CardTitle>
                    <span className="text-sm text-muted-foreground">{date} às {time}</span>
                  </div>
                </CardHeader>
                <CardContent className="py-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Respostas:</span>
                        <span>
                          <span className="text-green-600 font-medium">{evaluation.total_sim} Sim</span>, 
                          <span className="text-gray-600 ml-1">{evaluation.total_nao} Não</span>
                        </span>
                      </div>
                      {evaluation.is_complete ? (
                        <div className="text-sm text-emerald-600">Avaliação finalizada</div>
                      ) : (
                        <div className="text-sm text-amber-600">Avaliação em andamento</div>
                      )}
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      {onEditEvaluation && (
                        <Button 
                          onClick={() => onEditEvaluation(evaluation)} 
                          variant="outline" 
                          className="w-full sm:w-auto"
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                      )}
                      <Button 
                        onClick={() => onShowResults(evaluation)}
                        variant="outline"
                        className="w-full sm:w-auto"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Ver Resultados
                      </Button>
                      <Button 
                        onClick={() => handleDelete(evaluation.id)}
                        variant="outline"
                        className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={isDeletingEvaluation}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta avaliação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeletingEvaluation ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EmployeeFormHistory;
