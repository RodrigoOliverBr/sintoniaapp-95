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
    secao_id: "",
    risco_id: "",
    ordem_pergunta: 0,
    observacao_obrigatoria: false
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [riscos, setRiscos] = useState<Risk[]>([]);
  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    if (open) {
      fetchRiscos();
      fetchSections();
      
      if (isEditing && currentPergunta) {
        setFormData({
          texto: currentPergunta.texto || "",
          secao_id: currentPergunta.secao_id || "",
          risco_id: currentPergunta.risco_id || "",
          ordem_pergunta: currentPergunta.ordem_pergunta || 0,
          observacao_obrigatoria: currentPergunta.observacao_obrigatoria || false
        });
      } else {
        const preSelectedSectionData = sections.find(s => s.titulo === preSelectedSection);
        setFormData({
          texto: "",
          secao_id: preSelectedSectionData?.id || "",
          risco_id: "",
          ordem_pergunta: 0,
          observacao_obrigatoria: false
        });
      }
    }
  }, [open, isEditing, currentPergunta, preSelectedSection, sections]);

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from('secoes')
        .select('*')
        .eq('formulario_id', formularioId)
        .order('ordem');
        
      if (error) throw error;
      setSections(data || []);
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
    setFormData(prev => ({ ...prev, secao_id: value }));
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
        return;
      }

      if (!formData.secao_id) {
        toast.error("É necessário selecionar uma seção");
        return;
      }

      const perguntaData = {
        texto: formData.texto,
        secao_id: formData.secao_id,
        risco_id: formData.risco_id || null,
        ordem_pergunta: formData.ordem_pergunta,
        observacao_obrigatoria: formData.observacao_obrigatoria,
        formulario_id: formularioId
      };

      if (isEditing && currentPergunta) {
        console.log("Updating pergunta with data:", perguntaData);
        
        const { error } = await supabase
          .from('perguntas')
          .update(perguntaData)
          .eq('id', currentPergunta.id);

        if (error) throw error;
        toast.success("Pergunta atualizada com sucesso");
      } else {
        console.log("Creating pergunta with data:", perguntaData);
        
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
              <Select 
                value={formData.secao_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, secao_id: value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione a seção" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.ordem > 0 ? `${section.ordem}. ${section.titulo}` : section.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
