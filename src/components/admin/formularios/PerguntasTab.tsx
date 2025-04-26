import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface Pergunta {
  id: string;
  texto: string;
  secao: string;
  ordem?: number;
  observacao_obrigatoria?: boolean;
  risco?: {
    id: string;
    texto: string;
    severidade?: {
      id: string;
      nivel: string;
    }
  };
  risco_id?: string;
}

interface Secao {
  nome: string;
  count: number;
}

interface Risco {
  id: string;
  texto: string;
}

interface PerguntasTabProps {
  formularioId: string;
}

const PerguntasTab: React.FC<PerguntasTabProps> = ({ formularioId }) => {
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [secoes, setSecoes] = useState<Secao[]>([]);
  const [riscos, setRiscos] = useState<Risco[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroSecao, setFiltroSecao] = useState<string>("all");
  const [filtroRisco, setFiltroRisco] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPergunta, setCurrentPergunta] = useState<Pergunta | null>(null);
  const [formData, setFormData] = useState({
    texto: "",
    secao: "",
    risco_id: "",
    ordem: 0,
    observacao_obrigatoria: false
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchPerguntas = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('perguntas')
        .select(`
          *,
          risco:riscos (
            *,
            severidade:severidade (*)
          )
        `)
        .eq('formulario_id', formularioId);

      if (filtroSecao !== "all") {
        query = query.eq('secao', filtroSecao);
      }

      if (filtroRisco !== "all") {
        query = query.eq('risco_id', filtroRisco);
      }

      const { data, error } = await query.order('secao');

      if (error) {
        throw error;
      }
      
      setPerguntas(data || []);
      
      // Extract unique sections for the filter
      const uniqueSections = Array.from(new Set(data?.map(p => p.secao) || []));
      setSecoes(
        uniqueSections.map(section => ({
          nome: section,
          count: data?.filter(p => p.secao === section).length || 0
        }))
      );
      
      // Fetch risks for the filter
      const { data: riscosData, error: riscosError } = await supabase
        .from('riscos')
        .select('id, texto')
        .order('texto');
        
      if (riscosError) {
        throw riscosError;
      }
      
      setRiscos(riscosData || []);
      
    } catch (error) {
      toast.error("Erro ao carregar perguntas");
      console.error("Erro ao carregar perguntas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerguntas();
  }, [filtroSecao, filtroRisco]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData({ ...formData, observacao_obrigatoria: checked });
  };

  const handleEdit = (pergunta: Pergunta) => {
    console.log("Edit pergunta:", pergunta.id);
    setIsEditing(true);
    setCurrentPergunta(pergunta);
    setFormData({
      texto: pergunta.texto,
      secao: pergunta.secao,
      risco_id: pergunta.risco_id || pergunta.risco?.id || "",
      ordem: pergunta.ordem || 0,
      observacao_obrigatoria: pergunta.observacao_obrigatoria || false
    });
    setDialogOpen(true);
  };

  const handleNew = () => {
    setIsEditing(false);
    setCurrentPergunta(null);
    // Default to the first section if available
    const defaultSecao = secoes.length > 0 ? secoes[0].nome : "";
    setFormData({ 
      texto: "", 
      secao: defaultSecao, 
      risco_id: "", 
      ordem: 0, 
      observacao_obrigatoria: false 
    });
    setDialogOpen(true);
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

      if (isEditing && currentPergunta) {
        // Update existing pergunta
        const { error } = await supabase
          .from('perguntas')
          .update({
            texto: formData.texto,
            secao: formData.secao,
            secao_descricao,
            risco_id: formData.risco_id || null,
            ordem: formData.ordem,
            observacao_obrigatoria: formData.observacao_obrigatoria
          })
          .eq('id', currentPergunta.id);

        if (error) throw error;
        toast.success("Pergunta atualizada com sucesso");
      } else {
        // Create new pergunta
        const { error } = await supabase
          .from('perguntas')
          .insert({
            texto: formData.texto,
            secao: formData.secao,
            secao_descricao,
            risco_id: formData.risco_id || null,
            ordem: formData.ordem,
            observacao_obrigatoria: formData.observacao_obrigatoria
          });

        if (error) throw error;
        toast.success("Pergunta criada com sucesso");
      }

      setDialogOpen(false);
      fetchPerguntas();
    } catch (error) {
      console.error("Erro ao salvar pergunta:", error);
      toast.error("Erro ao salvar pergunta");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta pergunta?")) {
      try {
        // Check if there are any responses for this question
        const { data: respostasData, error: respostasError } = await supabase
          .from('respostas')
          .select('id')
          .eq('pergunta_id', id);

        if (respostasError) throw respostasError;
        
        if (respostasData && respostasData.length > 0) {
          toast.error("Não é possível excluir esta pergunta pois já existem respostas associadas");
          return;
        }

        const { error } = await supabase
          .from('perguntas')
          .delete()
          .eq('id', id);

        if (error) throw error;

        toast.success("Pergunta excluída com sucesso");
        fetchPerguntas();
      } catch (error) {
        console.error("Erro ao excluir pergunta:", error);
        toast.error("Erro ao excluir pergunta");
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Perguntas</h2>
          <div className="flex gap-4">
            <Select 
              value={filtroSecao} 
              onValueChange={setFiltroSecao}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por Seção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Seções</SelectItem>
                {secoes.map((secao) => (
                  <SelectItem key={secao.nome} value={secao.nome}>
                    {secao.nome} ({secao.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={filtroRisco} 
              onValueChange={setFiltroRisco}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por Risco" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Riscos</SelectItem>
                {riscos.map((risco) => (
                  <SelectItem key={risco.id} value={risco.id}>
                    {risco.texto}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Pergunta
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <p>Carregando perguntas...</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Texto</TableHead>
              <TableHead>Seção</TableHead>
              <TableHead>Risco</TableHead>
              <TableHead>Ordem</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {perguntas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  {filtroSecao !== "all" || filtroRisco !== "all" ? 
                    "Nenhuma pergunta encontrada com os filtros selecionados." :
                    "Nenhuma pergunta cadastrada. Clique em 'Nova Pergunta' para adicionar."}
                </TableCell>
              </TableRow>
            ) : (
              perguntas.map((pergunta) => (
                <TableRow key={pergunta.id}>
                  <TableCell className="font-medium">{pergunta.texto}</TableCell>
                  <TableCell>{pergunta.secao}</TableCell>
                  <TableCell>{pergunta.risco?.texto || "-"}</TableCell>
                  <TableCell>{pergunta.ordem || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEdit(pergunta)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(pergunta.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      {/* Dialog para criar/editar perguntas */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ordem">Ordem</Label>
                  <Input
                    id="ordem"
                    name="ordem"
                    type="number"
                    min="0"
                    value={formData.ordem}
                    onChange={handleInputChange}
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
    </div>
  );
};

export default PerguntasTab;
