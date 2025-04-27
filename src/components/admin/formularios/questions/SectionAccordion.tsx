
import React, { useState } from "react";
import { Question } from "@/types/form";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SectionProps {
  title: string;
  description?: string;
  ordem?: number;
  questions: Question[];
  onEditQuestion: (question: Question) => void;
  onDeleteQuestion: (question: Question) => void;
  onNewQuestion: () => void;
  formularioId: string;
}

export const SectionAccordion: React.FC<SectionProps> = ({
  title,
  description,
  ordem,
  questions,
  onEditQuestion,
  onDeleteQuestion,
  onNewQuestion,
  formularioId,
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);
  const [deletingQuestion, setDeletingQuestion] = useState(false);
  
  // Sort questions by ordem_pergunta
  const sortedQuestions = [...questions].sort((a, b) => {
    // If both have order 0 or equal, don't change the order
    if ((a.ordem_pergunta === 0 && b.ordem_pergunta === 0) || a.ordem_pergunta === b.ordem_pergunta) {
      return 0;
    }
    // If only one has order 0, put it last
    if (a.ordem_pergunta === 0) return 1;
    if (b.ordem_pergunta === 0) return -1;
    // Sort normally by numbers
    return a.ordem_pergunta - b.ordem_pergunta;
  });

  const handleDeleteClick = (question: Question) => {
    setQuestionToDelete(question);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!questionToDelete) return;
    
    setDeletingQuestion(true);
    try {
      const { error } = await supabase
        .from('perguntas')
        .delete()
        .eq('id', questionToDelete.id);
      
      if (error) throw error;
      
      toast.success("Pergunta excluída com sucesso!");
      onDeleteQuestion(questionToDelete);
      setQuestionToDelete(null);
    } catch (error) {
      console.error("Erro ao excluir pergunta:", error);
      toast.error("Erro ao excluir pergunta");
    } finally {
      setDeletingQuestion(false);
      setIsDeleteDialogOpen(false);
    }
  };

  // Format title with order if available
  const formattedTitle = ordem && ordem > 0 ? `${ordem}. ${title.replace(/^\d+\.\s/, '')}` : title;
  
  return (
    <>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={title} className="border-[#C8C8C9]">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            <div className="flex items-center gap-3">
              {formattedTitle}
              <span className="text-sm text-muted-foreground font-normal">
                ({questions.length} {questions.length === 1 ? 'pergunta' : 'perguntas'})
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            {description && (
              <p className="text-sm text-muted-foreground mb-4">{description}</p>
            )}
            
            <div className="flex justify-end mb-4">
              <Button onClick={onNewQuestion} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Nova Pergunta em {title.replace(/^\d+\.\s/, '')}
              </Button>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ordem</TableHead>
                  <TableHead>Texto</TableHead>
                  <TableHead>Risco</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedQuestions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell>{question.ordem_pergunta || "-"}</TableCell>
                    <TableCell className="font-medium">{question.texto}</TableCell>
                    <TableCell>{question.risco?.texto}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onEditQuestion(question)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteClick(question)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a pergunta "{questionToDelete?.texto}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingQuestion}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete} 
              disabled={deletingQuestion}
              className="bg-red-500 hover:bg-red-600"
            >
              {deletingQuestion ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
