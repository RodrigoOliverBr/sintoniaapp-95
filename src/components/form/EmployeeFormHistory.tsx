import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ClipboardCheck, Edit, Trash2 } from "lucide-react";
import { FormResult } from "@/types/form";
import { deleteFormEvaluation } from "@/services/form";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface EmployeeFormHistoryProps {
  evaluations: FormResult[];
  onShowResults: (evaluation: FormResult) => void;
  onNewEvaluation: () => void;
  onDeleteEvaluation?: (evaluationId: string) => Promise<void>;
  onEditEvaluation?: (evaluation: FormResult) => void;
}

const EmployeeFormHistory: React.FC<EmployeeFormHistoryProps> = ({
  evaluations,
  onShowResults,
  onNewEvaluation,
  onDeleteEvaluation,
  onEditEvaluation,
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [evaluationToDelete, setEvaluationToDelete] = React.useState<FormResult | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const { toast } = useToast();

  const handleDelete = (evaluation: FormResult) => {
    setEvaluationToDelete(evaluation);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (evaluationToDelete) {
      try {
        setIsDeleting(true);
        console.log("Deletando avaliação:", evaluationToDelete.id);
        
        // Call the service to delete from database
        await deleteFormEvaluation(evaluationToDelete.id);
        
        // Call the parent component method to update UI
        if (onDeleteEvaluation) {
          await onDeleteEvaluation(evaluationToDelete.id);
        }
        
        toast({
          title: "Avaliação excluída",
          description: "A avaliação foi excluída com sucesso."
        });
      } catch (error) {
        console.error("Erro ao excluir avaliação:", error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir a avaliação.",
          variant: "destructive",
        });
      } finally {
        setIsDeleting(false);
        setShowDeleteDialog(false);
        setEvaluationToDelete(null);
      }
    }
  };

  if (evaluations.length === 0) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Sem Avaliações</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">
            Este funcionário ainda não possui avaliações registradas.
          </p>
          <Button onClick={onNewEvaluation}>
            <ClipboardCheck className="h-4 w-4 mr-2" />
            Iniciar Nova Avaliação
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getRiskLevel = (evaluation: FormResult) => {
    const score = calculateRiskScore(evaluation);
    if (score < 20) return { level: "Baixo", color: "text-green-600" };
    if (score < 40) return { level: "Moderado", color: "text-yellow-600" };
    if (score < 60) return { level: "Considerável", color: "text-orange-600" };
    if (score < 80) return { level: "Alto", color: "text-red-600" };
    return { level: "Extremo", color: "text-red-800" };
  };

  const calculateRiskScore = (evaluation: FormResult): number => {
    if (!evaluation.total_sim && !evaluation.totalYes) return 0;
    
    const totalYes = evaluation.total_sim || evaluation.totalYes || 0;
    const totalQuestions = 
      (evaluation.total_sim || 0) + (evaluation.total_nao || 0) || 
      (evaluation.totalYes || 0) + (evaluation.totalNo || 0);
    
    if (totalQuestions === 0) return 0;
    return (totalYes / totalQuestions) * 100;
  };

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">Histórico de Avaliações</h3>
        <div className="grid gap-4">
          {evaluations.map((evaluation) => {
            const { level, color } = getRiskLevel(evaluation);
            return (
              <Card key={evaluation.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-1 flex-1">
                    <p className="font-medium">
                      Avaliação {format(new Date(evaluation.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                    <p className={`${color} font-medium`}>
                      Nível de Risco: {level}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Última atualização: {format(new Date(evaluation.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {onEditEvaluation && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onEditEvaluation(evaluation)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(evaluation)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                    <Button
                      onClick={() => onShowResults(evaluation)}
                      size="sm"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Ver Resultados
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="flex justify-end mt-6">
          <Button onClick={onNewEvaluation} variant="outline">
            <ClipboardCheck className="h-4 w-4 mr-2" />
            Nova Avaliação
          </Button>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Avaliação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta avaliação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EmployeeFormHistory;
