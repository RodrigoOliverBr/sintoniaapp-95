
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Question } from "@/types/form";
import { usePerguntas } from "@/hooks/usePerguntas";
import PerguntaFormDialog from "./PerguntaFormDialog";
import { SectionAccordion } from "./questions/SectionAccordion";

interface PerguntasTabProps {
  formularioId: string;
}

const PerguntasTab: React.FC<PerguntasTabProps> = ({ formularioId }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPergunta, setCurrentPergunta] = useState<Question | null>(null);

  const { perguntas, loading, refreshPerguntas } = usePerguntas({
    formularioId
  });

  const handleEdit = (pergunta: Question) => {
    setIsEditing(true);
    setCurrentPergunta(pergunta);
    setDialogOpen(true);
  };

  const handleDelete = () => {
    refreshPerguntas();
  };

  const handleNew = () => {
    setIsEditing(false);
    setCurrentPergunta(null);
    setDialogOpen(true);
  };

  // Group questions by section
  const questionsBySection = perguntas.reduce((acc, question) => {
    if (!acc[question.secao]) {
      acc[question.secao] = {
        title: question.secao,
        description: question.secao_descricao,
        questions: [],
        ordem: question.ordem || 0
      };
    }
    acc[question.secao].questions.push(question);
    // Update section order to the lowest question order in the section
    if ((question.ordem || 0) < acc[question.secao].ordem) {
      acc[question.secao].ordem = question.ordem || 0;
    }
    return acc;
  }, {} as Record<string, { title: string; description?: string; questions: Question[]; ordem: number }>);

  // Sort sections by order
  const sortedSections = Object.values(questionsBySection).sort((a, b) => a.ordem - b.ordem);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <p>Carregando perguntas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Perguntas</h2>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Pergunta
        </Button>
      </div>
      
      <div className="space-y-4">
        {sortedSections.map((section) => (
          <SectionAccordion
            key={section.title}
            title={section.title}
            description={section.description}
            questions={section.questions}
            onEditQuestion={handleEdit}
            onDeleteQuestion={handleDelete}
          />
        ))}
      </div>

      <PerguntaFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        currentPergunta={currentPergunta}
        isEditing={isEditing}
        formularioId={formularioId}
        onSuccess={refreshPerguntas}
      />
    </div>
  );
};

export default PerguntasTab;
