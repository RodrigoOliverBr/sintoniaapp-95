
import React, { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

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
  isDeletingEvaluation = false
}) => {
  const [evaluationToDelete, setEvaluationToDelete] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleConfirmDelete = async () => {
    if (!evaluationToDelete) return;
    
    try {
      setIsDeleting(true);
      await onDeleteEvaluation(evaluationToDelete);
      setIsConfirmOpen(false);
      setEvaluationToDelete(null);
    } catch (error) {
      console.error("Error deleting evaluation:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a avaliação",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDelete = (evaluationId: string) => {
    setEvaluationToDelete(evaluationId);
    setIsConfirmOpen(true);
  };

  const handleCancelDelete = () => {
    setIsConfirmOpen(false);
    setEvaluationToDelete(null);
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

            const isCurrentlyDeleting = isDeleting && evaluationToDelete === evaluation.id;

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
                      <Button 
                        onClick={() => onEditEvaluation && onEditEvaluation(evaluation)} 
                        variant="outline" 
                        className="w-full sm:w-auto"
                        disabled={isCurrentlyDeleting || isDeletingEvaluation}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button 
                        onClick={() => onShowResults(evaluation)}
                        variant="outline"
                        className="w-full sm:w-auto"
                        disabled={isCurrentlyDeleting || isDeletingEvaluation}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Ver Resultados
                      </Button>
                      <Button 
                        onClick={() => handleDelete(evaluation.id)}
                        variant="outline"
                        className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={isCurrentlyDeleting || isDeletingEvaluation}
                      >
                        {isCurrentlyDeleting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Excluindo...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Single confirmation dialog for deletion */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir avaliação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta avaliação? Esta ação não pode ser desfeita 
              e removerá permanentemente a avaliação e todas as suas respostas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete} disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : "Sim, excluir avaliação"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EmployeeFormHistory;
