
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
        ordem: 0
      };
    }
    acc[question.secao].questions.push(question);
    return acc;
  }, {} as Record<string, { title: string; description?: string; questions: Question[]; ordem: number }>);

  // Sort questions within each section by ordem
  Object.values(questionsBySection).forEach(section => {
    section.questions.sort((a, b) => {
      // Se ambos têm ordem 0 ou igual, não altera a ordem
      if ((a.ordem === 0 && b.ordem === 0) || a.ordem === b.ordem) {
        return 0;
      }
      // Se apenas um tem ordem 0, coloca ele por último
      if (a.ordem === 0) return 1;
      if (b.ordem === 0) return -1;
      // Ordena normalmente pelos números
      return a.ordem - b.ordem;
    });
  });

  // Sort sections by title alphabetically
  const sortedSections = Object.values(questionsBySection).sort((a, b) => 
    a.title.localeCompare(b.title)
  );

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
