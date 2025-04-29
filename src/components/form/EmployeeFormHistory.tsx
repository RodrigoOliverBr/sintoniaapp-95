
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
      console.log(`Starting deletion process for evaluation ${evaluationToDelete}`);
      setIsDeleting(true);
      
      // Call the onDeleteEvaluation function provided by the parent component
      await onDeleteEvaluation(evaluationToDelete);
      
      console.log("Deletion process completed successfully");
      setIsConfirmOpen(false);
      setEvaluationToDelete(null);
      
      // No need for a toast here as the parent component should handle the success message
    } catch (error) {
      console.error("Error in deletion confirmation handler:", error);
      toast({
        title: "Delete Error",
        description: "Could not delete evaluation",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDelete = (evaluationId: string) => {
    console.log(`Requesting deletion of evaluation ${evaluationId}`);
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
        <h2 className="text-2xl font-bold">Evaluation History</h2>
        <Button onClick={onNewEvaluation} className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          New Evaluation
        </Button>
      </div>

      {sortedEvaluations.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              This employee does not have any recorded evaluations yet.
            </p>
            <Button onClick={onNewEvaluation} className="mt-4">
              Create First Evaluation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sortedEvaluations.map((evaluation) => {
            const date = evaluation.created_at
              ? format(new Date(evaluation.created_at), "dd 'of' MMMM 'of' yyyy", { locale: ptBR })
              : "Unknown date";
            
            const time = evaluation.created_at
              ? format(new Date(evaluation.created_at), "HH:mm", { locale: ptBR })
              : "";

            const isCurrentlyDeleting = isDeleting && evaluationToDelete === evaluation.id;
            const isDisabled = isCurrentlyDeleting || isDeletingEvaluation;

            return (
              <Card key={evaluation.id} className="overflow-hidden">
                <CardHeader className="bg-muted/40 py-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-medium">
                      {evaluation.is_complete ? "Complete" : "Incomplete"} Evaluation
                    </CardTitle>
                    <span className="text-sm text-muted-foreground">{date} at {time}</span>
                  </div>
                </CardHeader>
                <CardContent className="py-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Answers:</span>
                        <span>
                          <span className="text-green-600 font-medium">{evaluation.total_sim} Yes</span>, 
                          <span className="text-gray-600 ml-1">{evaluation.total_nao} No</span>
                        </span>
                      </div>
                      {evaluation.is_complete ? (
                        <div className="text-sm text-emerald-600">Evaluation completed</div>
                      ) : (
                        <div className="text-sm text-amber-600">Evaluation in progress</div>
                      )}
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button 
                        onClick={() => onEditEvaluation && onEditEvaluation(evaluation)} 
                        variant="outline" 
                        className="w-full sm:w-auto"
                        disabled={isDisabled}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        onClick={() => onShowResults(evaluation)}
                        variant="outline"
                        className="w-full sm:w-auto"
                        disabled={isDisabled}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View Results
                      </Button>
                      <Button 
                        onClick={() => handleDelete(evaluation.id)}
                        variant="outline"
                        className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={isDisabled}
                      >
                        {isCurrentlyDeleting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
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

      {/* Confirmation dialog for deletion */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete evaluation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this evaluation? This action cannot be undone
              and will permanently remove the evaluation and all its answers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete} disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : "Yes, delete evaluation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EmployeeFormHistory;
