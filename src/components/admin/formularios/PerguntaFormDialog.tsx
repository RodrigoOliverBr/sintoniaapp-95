
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
    texto: currentPergunta?.texto || "",
    secao: currentPergunta?.secao || "",
    risco_id: currentPergunta?.risco_id || "",
    observacao_obrigatoria: currentPergunta?.observacao_obrigatoria || false
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [secoes, setSecoes] = useState<{ nome: string; count: number; }[]>([]);
  const [riscos, setRiscos] = useState<Risk[]>([]);

  // Carregar seções e riscos quando o diálogo for aberto
  useEffect(() => {
    if (open) {
      fetchSecoes();
      fetchRiscos();
    }
  }, [open, formularioId]);

  // Atualizar dados do formulário quando a pergunta atual mudar
  useEffect(() => {
    if (currentPergunta) {
      setFormData({
        texto: currentPergunta.texto || "",
        secao: currentPergunta.secao || "",
        risco_id: currentPergunta.risco_id || "",
        observacao_obrigatoria: currentPergunta.observacao_obrigatoria || false
      });
    } else {
      setFormData({
        texto: "",
        secao: secoes.length > 0 ? secoes[0].nome : "",
        risco_id: "",
        observacao_obrigatoria: false
      });
    }
  }, [currentPergunta, secoes]);

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
      
      // Se não tiver seção selecionada e existir seções, seleciona a primeira
      if (!formData.secao && uniqueSections.length > 0) {
        setFormData(prev => ({
          ...prev,
          secao: uniqueSections[0].nome
        }));
      }
    } catch (error) {
      console.error("Erro ao carregar seções:", error);
      toast.error("Erro ao carregar seções");
    }
  };

  const fetchRiscos = async () => {
    try {
      const { data, error } = await supabase
        .from('riscos')
        .select('*')
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

      // Get the section description if it exists
      let secao_descricao: string | null = null;
      if (formData.secao) {
        const { data } = await supabase
          .from('perguntas')
          .select('secao_descricao')
          .eq('secao', formData.secao)
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
                <Label htmlFor="risco_id">Risco Associado</Label>
                <Select 
                  name="risco_id" 
                  value={formData.risco_id} 
                  onValueChange={(value) => setFormData({...formData, risco_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um risco" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    {riscos.map((risco) => (
                      <SelectItem key={risco.id} value={risco.id}>
                        {risco.texto}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
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
