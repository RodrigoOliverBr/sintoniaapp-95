
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Question } from "@/types/form";
import { usePerguntas } from "@/hooks/usePerguntas";
import PerguntaFormDialog from "./PerguntaFormDialog";
import PerguntasTable from "./PerguntasTable";

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

  const handleNew = () => {
    setIsEditing(false);
    setCurrentPergunta(null);
    setDialogOpen(true);
  };

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
      
      <PerguntasTable
        perguntas={perguntas}
        onEdit={handleEdit}
        onDelete={refreshPerguntas}
      />

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
