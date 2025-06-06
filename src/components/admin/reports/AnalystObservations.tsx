
import React, { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { updateAnalystNotes } from "@/services/form/formService";

interface AnalystObservationsProps {
  avaliacaoId: string;
  initialValue?: string;
}

const AnalystObservations: React.FC<AnalystObservationsProps> = ({ 
  avaliacaoId,
  initialValue = ""
}) => {
  const [observations, setObservations] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    if (avaliacaoId) {
      loadObservations();
    }
  }, [avaliacaoId]);
  
  const loadObservations = async () => {
    if (!avaliacaoId) return;
    
    setIsLoading(true);
    try {
      console.log("Carregando observações para avaliação:", avaliacaoId);
      
      const { data, error } = await supabase
        .from('avaliacoes')
        .select('notas_analista')
        .eq('id', avaliacaoId)
        .single();
        
      if (error) {
        console.error("Erro ao carregar observações:", error);
        return;
      }
      
      console.log("Observações carregadas:", data?.notas_analista);
      
      if (data && data.notas_analista) {
        setObservations(data.notas_analista);
      }
    } catch (error) {
      console.error("Erro ao carregar observações:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSave = async () => {
    if (!avaliacaoId) {
      toast.error("ID da avaliação não fornecido");
      return;
    }
    
    setIsSaving(true);
    try {
      console.log("Salvando observações para avaliação:", avaliacaoId);
      console.log("Texto a ser salvo:", observations);
      
      await updateAnalystNotes(avaliacaoId, observations);
      toast.success("Observações salvas com sucesso");
      console.log("Observações salvas com sucesso");
    } catch (error) {
      console.error("Erro ao salvar observações:", error);
      toast.error("Erro ao salvar observações");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setObservations(e.target.value);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label htmlFor="analyst-observations" className="text-lg font-medium">
          Observações e Recomendações do Analista
        </Label>
        <Button 
          onClick={handleSave} 
          disabled={isSaving || isLoading}
          size="sm"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : "Salvar"}
        </Button>
      </div>
      
      <Textarea
        id="analyst-observations"
        placeholder="Digite aqui suas observações e recomendações..."
        value={observations}
        onChange={handleChange}
        onBlur={handleSave}
        className="min-h-[150px] bg-white"
        disabled={isLoading}
      />
      
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
};

export default AnalystObservations;
