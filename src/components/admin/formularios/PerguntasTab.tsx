
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Question, Risk } from "@/types/form";
import { usePerguntas } from "@/hooks/usePerguntas";
import PerguntaFilters from "./PerguntaFilters";
import PerguntaFormDialog from "./PerguntaFormDialog";
import PerguntasTable from "./PerguntasTable";

interface PerguntasTabProps {
  formularioId: string;
}

const PerguntasTab: React.FC<PerguntasTabProps> = ({ formularioId }) => {
  const [secoes, setSecoes] = useState<{ nome: string; count: number; }[]>([]);
  const [riscos, setRiscos] = useState<Risk[]>([]);
  const [filtroSecao, setFiltroSecao] = useState<string>("all");
  const [filtroRisco, setFiltroRisco] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPergunta, setCurrentPergunta] = useState<Question | null>(null);

  const { perguntas, loading, refreshPerguntas } = usePerguntas({
    formularioId,
    filtroSecao,
    filtroRisco
  });

  useEffect(() => {
    loadRiscos();
  }, []);

  useEffect(() => {
    if (perguntas) {
      const uniqueSections = Array.from(new Set(perguntas.map(p => p.secao)));
      setSecoes(
        uniqueSections.map(section => ({
          nome: section,
          count: perguntas.filter(p => p.secao === section).length
        }))
      );
    }
  }, [perguntas]);

  const loadRiscos = async () => {
    try {
      const { data, error } = await supabase
        .from('riscos')
        .select('*')
        .order('texto');
        
      if (error) throw error;
      setRiscos(data || []);
    } catch (error) {
      console.error("Erro ao carregar riscos:", error);
    }
  };

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
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Perguntas</h2>
          <PerguntaFilters
            secoes={secoes}
            riscos={riscos}
            filtroSecao={filtroSecao}
            filtroRisco={filtroRisco}
            onSecaoChange={setFiltroSecao}
            onRiscoChange={setFiltroRisco}
          />
        </div>
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
        secoes={secoes}
        riscos={riscos}
        formularioId={formularioId}
        onSuccess={refreshPerguntas}
      />
    </div>
  );
};

export default PerguntasTab;
