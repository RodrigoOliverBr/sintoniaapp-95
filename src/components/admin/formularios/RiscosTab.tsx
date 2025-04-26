import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Risk, Severity, Mitigation } from "@/types/form";
import { toast } from "sonner";
import { getAllRisksWithSeverity, getAllSeverities, getMitigationsByRiskId } from "@/services/form/formService";
import { RiskFormDialog } from "./risk/RiskFormDialog";
import { DeleteRiskDialog } from "./risk/DeleteRiskDialog";
import { RiskTable } from "./risk/RiskTable";

interface RiscosTabProps {
  formularioId: string;
}

const RiscosTab: React.FC<RiscosTabProps> = ({ formularioId }) => {
  const [riscos, setRiscos] = useState<Risk[]>([]);
  const [severidades, setSeveridades] = useState<Severity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentRisco, setCurrentRisco] = useState<Risk | null>(null);
  const [novoTexto, setNovoTexto] = useState("");
  const [novaSeveridadeId, setNovaSeveridadeId] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [mitigations, setMitigations] = useState<Mitigation[]>([]);

  useEffect(() => {
    fetchData();
  }, [formularioId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [riscosData, severidadesData] = await Promise.all([
        getAllRisksWithSeverity(),
        getAllSeverities()
      ]);

      const risksWithMitigations = await Promise.all(
        riscosData.map(async (risk) => {
          try {
            const mitigations = await getMitigationsByRiskId(risk.id);
            return {
              ...risk,
              mitigations
            };
          } catch (error) {
            console.error("Error fetching mitigations for risk:", risk.id, error);
            return {
              ...risk,
              mitigations: []
            };
          }
        })
      );

      setRiscos(risksWithMitigations);
      setSeveridades(severidadesData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = async (risco?: Risk) => {
    if (risco) {
      setCurrentRisco(risco);
      setNovoTexto(risco.texto);
      setNovaSeveridadeId(risco.severidade_id);
      setIsEditing(true);
      
      try {
        const mitigacoesData = await getMitigationsByRiskId(risco.id);
        setMitigations(mitigacoesData);
      } catch (error) {
        console.error("Erro ao carregar mitigações:", error);
        toast.error("Erro ao carregar mitigações");
      }
    } else {
      setCurrentRisco(null);
      setNovoTexto("");
      setNovaSeveridadeId(severidades.length > 0 ? severidades[0].id : "");
      setMitigations([]);
      setIsEditing(false);
    }
    setIsDialogOpen(true);
  };

  const handleSaveRisco = async () => {
    if (!novoTexto || !novaSeveridadeId) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    try {
      let riscoId;
      
      if (isEditing && currentRisco) {
        const { data: riscoData, error: riscoError } = await supabase
          .from('riscos')
          .update({
            texto: novoTexto,
            severidade_id: novaSeveridadeId,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentRisco.id)
          .select()
          .single();

        if (riscoError) throw riscoError;
        riscoId = currentRisco.id;
      } else {
        const { data: riscoData, error: riscoError } = await supabase
          .from('riscos')
          .insert({
            texto: novoTexto,
            severidade_id: novaSeveridadeId
          })
          .select()
          .single();

        if (riscoError) throw riscoError;
        riscoId = riscoData.id;
      }

      if (riscoId) {
        if (isEditing) {
          await supabase
            .from('mitigacoes')
            .delete()
            .eq('risco_id', riscoId);
        }

        if (mitigations.length > 0) {
          const mitigacoesData = mitigations
            .filter(m => m.texto.trim() !== '')
            .map(m => ({
              texto: m.texto,
              risco_id: riscoId
            }));

          if (mitigacoesData.length > 0) {
            const { error: mitigacoesError } = await supabase
              .from('mitigacoes')
              .insert(mitigacoesData);

            if (mitigacoesError) throw mitigacoesError;
          }
        }
      }

      toast.success(isEditing ? "Risco atualizado com sucesso" : "Risco criado com sucesso");
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Erro ao salvar risco:", error);
      toast.error("Erro ao salvar risco");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRisco = async () => {
    if (!currentRisco) return;

    setLoading(true);
    try {
      const { data: perguntasComRisco, error: checkError } = await supabase
        .from('perguntas')
        .select('id')
        .eq('risco_id', currentRisco.id);

      if (checkError) throw checkError;

      if (perguntasComRisco && perguntasComRisco.length > 0) {
        toast.error(`Não é possível excluir este risco pois ele está sendo usado em ${perguntasComRisco.length} pergunta(s)`);
        setIsDeleteDialogOpen(false);
        return;
      }

      const { error: mitigacoesError } = await supabase
        .from('mitigacoes')
        .delete()
        .eq('risco_id', currentRisco.id);

      if (mitigacoesError) throw mitigacoesError;

      const { error: deleteError } = await supabase
        .from('riscos')
        .delete()
        .eq('id', currentRisco.id);

      if (deleteError) throw deleteError;

      toast.success("Risco excluído com sucesso");
      setIsDeleteDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Erro ao excluir risco:", error);
      toast.error("Erro ao excluir risco");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteDialog = (risco: Risk) => {
    setCurrentRisco(risco);
    setIsDeleteDialogOpen(true);
  };

  if (loading && !riscos.length) {
    return <div>Carregando riscos...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Risco
        </Button>
      </div>

      <RiskTable 
        risks={riscos}
        onEdit={handleOpenDialog}
        onDelete={handleOpenDeleteDialog}
      />

      <RiskFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveRisco}
        loading={loading}
        isEditing={isEditing}
        novoTexto={novoTexto}
        setNovoTexto={setNovoTexto}
        novaSeveridadeId={novaSeveridadeId}
        setNovaSeveridadeId={setNovaSeveridadeId}
        severidades={severidades}
        mitigations={mitigations}
        setMitigations={setMitigations}
      />

      <DeleteRiskDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteRisco}
        loading={loading}
        risk={currentRisco}
      />
    </div>
  );
};

export default RiscosTab;
