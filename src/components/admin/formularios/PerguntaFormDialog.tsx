import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Question, Risk, Severity } from "@/types/form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PerguntaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPergunta: Question | null;
  isEditing: boolean;
  formularioId: string;
  onSuccess: () => void;
}

const PerguntaFormDialog: React.FC<PerguntaFormDialogProps> = ({
  open,
  onOpenChange,
  currentPergunta,
  isEditing,
  formularioId,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    texto: "",
    secao: "",
    risco_id: "",
    ordem: 0,
    observacao_obrigatoria: false
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [secoes, setSecoes] = useState<{ nome: string; count: number; }[]>([]);
  const [riscos, setRiscos] = useState<Risk[]>([]);
  const [severidades, setSeveridades] = useState<Severity[]>([]);

  useEffect(() => {
    if (open) {
      fetchSecoes();
      fetchRiscos();
      fetchSeveridades();
      
      if (isEditing && currentPergunta) {
        setFormData({
          texto: currentPergunta.texto || "",
          secao: currentPergunta.secao || "",
          risco_id: currentPergunta.risco_id || "",
          ordem: currentPergunta.ordem || 0,
          observacao_obrigatoria: currentPergunta.observacao_obrigatoria || false
        });
      } else {
        setFormData({
          texto: "",
          secao: "",
          risco_id: "",
          ordem: 0,
          observacao_obrigatoria: false
        });
      }
    }
  }, [open, isEditing, currentPergunta]);

  const fetchSecoes = async () => {
    try {
      const { data, error } = await supabase
        .from('perguntas')
        .select('secao, secao_descricao')
        .eq('formulario_id', formularioId)
        .order('secao');

      if (error) throw error;

      const uniqueSections = Array.from(
        new Set((data || []).map(item => item.secao))
      ).map(section => ({
        nome: section,
        count: (data || []).filter(item => item.secao === section).length
      }));

      setSecoes(uniqueSections.length > 0 ? uniqueSections : []);
    } catch (error) {
      console.error("Erro ao carregar seções:", error);
      toast.error("Erro ao carregar seções");
    }
  };

  const fetchRiscos = async () => {
    try {
      const { data, error } = await supabase
        .from('riscos')
        .select('*, severidade(id, nivel)')
        .order('texto');
        
      if (error) throw error;
      setRiscos(data || []);
    } catch (error) {
      console.error("Erro ao carregar riscos:", error);
      toast.error("Erro ao carregar riscos");
    }
  };

  const fetchSeveridades = async () => {
    try {
      const { data, error } = await supabase
        .from('severidade')
        .select('*')
        .order('ordem');
        
      if (error) throw error;
      setSeveridades(data || []);
    } catch (error) {
      console.error("Erro ao carregar severidades:", error);
      toast.error("Erro ao carregar severidades");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData({ ...formData, observacao_obrigatoria: checked });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (formData.texto.trim() === "") {
        toast.error("O texto da pergunta é obrigatório");
        setSubmitting(false);
        return;
      }

      if (formData.secao.trim() === "") {
        toast.error("É necessário selecionar uma seção");
        setSubmitting(false);
        return;
      }

      let secao_descricao: string | null = null;
      if (formData.secao) {
        const { data } = await supabase
          .from('perguntas')
          .select('secao_descricao')
          .eq('secao', formData.secao)
          .eq('formulario_id', formularioId)
          .limit(1);
          
        if (data && data.length > 0) {
          secao_descricao = data[0].secao_descricao;
        }
      }

      const perguntaData = {
        texto: formData.texto,
        secao: formData.secao,
        secao_descricao,
        risco_id: formData.risco_id || null,
        ordem: formData.ordem || 0,
        observacao_obrigatoria: formData.observacao_obrigatoria,
        formulario_id: formularioId
      };

      if (isEditing && currentPergunta) {
        const { error } = await supabase
          .from('perguntas')
          .update(perguntaData)
          .eq('id', currentPergunta.id);

        if (error) throw error;
        toast.success("Pergunta atualizada com sucesso");
      } else {
        const { error } = await supabase
          .from('perguntas')
          .insert(perguntaData);

        if (error) throw error;
        toast.success("Pergunta criada com sucesso");
      }

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar pergunta:", error);
      toast.error("Erro ao salvar pergunta");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Pergunta" : "Nova Pergunta"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="texto">Texto da Pergunta</Label>
              <Input
                id="texto"
                name="texto"
                value={formData.texto}
                onChange={handleInputChange}
                placeholder="Digite a pergunta"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="secao">Seção</Label>
                <Select 
                  name="secao" 
                  value={formData.secao} 
                  onValueChange={(value) => setFormData({...formData, secao: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma seção" />
                  </SelectTrigger>
                  <SelectContent>
                    {secoes.map((secao) => (
                      <SelectItem key={secao.nome} value={secao.nome}>
                        {secao.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Risco Associado</Label>
                <RiskSelectionGroup
                  risks={riscos}
                  selectedRiskId={formData.risco_id}
                  onRiskChange={(value) => setFormData({...formData, risco_id: value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ordem">Ordem</Label>
                <Input
                  id="ordem"
                  name="ordem"
                  type="number"
                  value={formData.ordem}
                  onChange={handleInputChange}
                  placeholder="Ordem de exibição"
                />
              </div>
              
              <div className="flex items-center space-x-2 mt-6">
                <Checkbox 
                  id="observacao_obrigatoria" 
                  checked={formData.observacao_obrigatoria}
                  onCheckedChange={handleCheckboxChange}
                />
                <Label htmlFor="observacao_obrigatoria">
                  Observação obrigatória
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PerguntaFormDialog;
