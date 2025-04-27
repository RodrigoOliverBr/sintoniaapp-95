
import React, { useState } from "react";
import { Question, Section } from "@/types/form";
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
  const [selectedSection, setSelectedSection] = useState<string>("");

  const { perguntas, sections, loading, refreshPerguntas } = usePerguntas({
    formularioId
  });

  const handleEdit = (pergunta: Question) => {
    setIsEditing(true);
    setCurrentPergunta(pergunta);
    
    // Find the section title from sections
    const section = sections.find(s => s.id === pergunta.secao_id);
    setSelectedSection(section ? section.titulo : "");
    
    setDialogOpen(true);
  };

  const handleDelete = () => {
    refreshPerguntas();
  };

  const handleNewInSection = (sectionId: string) => {
    setIsEditing(false);
    setCurrentPergunta(null);
    
    // Find the section title from sections
    const section = sections.find(s => s.id === sectionId);
    setSelectedSection(section ? section.titulo : "");
    
    setDialogOpen(true);
  };

  // Group questions by section
  const questionsBySection = sections.reduce((acc, section) => {
    acc[section.id] = {
      id: section.id,
      title: section.titulo,
      description: section.descricao,
      questions: [],
      ordem: section.ordem || 0
    };
    
    return acc;
  }, {} as Record<string, { id: string, title: string; description?: string; questions: Question[]; ordem: number }>);

  // Assign questions to their respective sections
  perguntas.forEach(question => {
    if (question.secao_id && questionsBySection[question.secao_id]) {
      questionsBySection[question.secao_id].questions.push(question);
    }
  });

  // Sort questions within each section by ordem_pergunta
  Object.values(questionsBySection).forEach(section => {
    section.questions.sort((a, b) => {
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
  });

  // Sort sections by ordem value (numerically)
  const sortedSections = Object.values(questionsBySection).sort((a, b) => {
    if (a.ordem === 0 && b.ordem === 0) {
      // If both have ordem 0, sort alphabetically
      return a.title.localeCompare(b.title);
    }
    // If one has ordem 0, put it last
    if (a.ordem === 0) return 1; 
    if (b.ordem === 0) return -1;
    // Sort normally by numbers
    return a.ordem - b.ordem;
  });

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
      </div>
      
      <div className="space-y-4">
        {sortedSections.map((section) => (
          <SectionAccordion
            key={section.id}
            id={section.id}
            title={section.title}
            description={section.description}
            ordem={section.ordem}
            questions={section.questions}
            onEditQuestion={handleEdit}
            onDeleteQuestion={handleDelete}
            onNewQuestion={() => handleNewInSection(section.id)}
            formularioId={formularioId}
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
        preSelectedSection={selectedSection}
      />
    </div>
  );
};

export default PerguntasTab;
