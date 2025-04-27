import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Question, Risk } from "@/types/form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import RiskSelectionGroup from "./risk/RiskSelectionGroup";

interface PerguntaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPergunta: Question | null;
  isEditing: boolean;
  formularioId: string;
  onSuccess: () => void;
  preSelectedSection: string;
}

const PerguntaFormDialog: React.FC<PerguntaFormDialogProps> = ({
  open,
  onOpenChange,
  currentPergunta,
  isEditing,
  formularioId,
  onSuccess,
  preSelectedSection = ""
}) => {
  const [formData, setFormData] = useState({
    texto: "",
    secao: "",
    risco_id: "",
    ordem: 0,
    ordem_pergunta: 0,
    observacao_obrigatoria: false
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [riscos, setRiscos] = useState<Risk[]>([]);
  const [availableSections, setAvailableSections] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      fetchRiscos();
      fetchAvailableSections();
      
      if (isEditing && currentPergunta) {
        setFormData({
          texto: currentPergunta.texto || "",
          secao: currentPergunta.secao || "",
          risco_id: currentPergunta.risco_id || "",
          ordem: currentPergunta.ordem || 0,
          ordem_pergunta: currentPergunta.ordem_pergunta || 0,
          observacao_obrigatoria: currentPergunta.observacao_obrigatoria || false
        });
      } else {
        setFormData({
          texto: "",
          secao: preSelectedSection,
          risco_id: "",
          ordem: 0,
          ordem_pergunta: 0,
          observacao_obrigatoria: false
        });
      }
    }
  }, [open, isEditing, currentPergunta, preSelectedSection]);

  const fetchAvailableSections = async () => {
    try {
      const { data, error } = await supabase
        .from('perguntas')
        .select('secao')
        .eq('formulario_id', formularioId);
        
      if (error) throw error;
      
      const uniqueSections = Array.from(new Set(data.map(item => item.secao)));
      
      if (preSelectedSection && !uniqueSections.includes(preSelectedSection)) {
        uniqueSections.push(preSelectedSection);
      }
      
      setAvailableSections(uniqueSections.sort());
    } catch (error) {
      console.error("Erro ao carregar seções:", error);
      toast.error("Erro ao carregar seções");
    }
  };

  const fetchRiscos = async () => {
    try {
      const { data, error } = await supabase
        .from('riscos')
        .select('*, severidade(*)')
        .order('texto');
        
      if (error) throw error;
      setRiscos(data || []);
    } catch (error) {
      console.error("Erro ao carregar riscos:", error);
      toast.error("Erro ao carregar riscos");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSectionChange = (value: string) => {
    setFormData(prev => ({ ...prev, secao: value }));
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

      let nextQuestionOrder = formData.ordem_pergunta;
      if (!isEditing || (isEditing && currentPergunta && formData.secao !== currentPergunta.secao)) {
        const { data } = await supabase
          .from('perguntas')
          .select('ordem_pergunta')
          .eq('secao', formData.secao)
          .eq('formulario_id', formularioId)
          .order('ordem_pergunta', { ascending: false })
          .limit(1);

        nextQuestionOrder = data && data.length > 0 ? (data[0].ordem_pergunta || 0) + 1 : 1;
      }

      const sectionOrderMatch = formData.secao.match(/^(\d+)\./);
      const sectionOrder = sectionOrderMatch ? parseInt(sectionOrderMatch[1], 10) : 0;

      const perguntaData = {
        texto: formData.texto,
        secao: formData.secao,
        secao_descricao,
        risco_id: formData.risco_id || null,
        ordem: sectionOrder,
        ordem_pergunta: nextQuestionOrder,
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
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Pergunta" : "Nova Pergunta"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Seção</Label>
              {isEditing ? (
                <Select 
                  value={formData.secao}
                  onValueChange={handleSectionChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione a seção" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSections.map((section) => (
                      <SelectItem key={section} value={section}>
                        {section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="w-full p-3 bg-muted rounded-md text-muted-foreground">
                  {formData.secao}
                </div>
              )}
            </div>
            
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
            
            <div className="space-y-2">
              <Label>Risco Associado</Label>
              <div className="w-full">
                <RiskSelectionGroup
                  risks={riscos}
                  selectedRiskId={formData.risco_id}
                  onRiskChange={(value) => setFormData({...formData, risco_id: value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ordem_pergunta">Ordem da Pergunta na Seção</Label>
                <Input
                  id="ordem_pergunta"
                  name="ordem_pergunta"
                  type="number"
                  value={formData.ordem_pergunta}
                  onChange={handleInputChange}
                  placeholder="Ordem de exibição dentro da seção"
                />
              </div>
              
              <div className="flex items-center space-x-2 pt-8">
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
