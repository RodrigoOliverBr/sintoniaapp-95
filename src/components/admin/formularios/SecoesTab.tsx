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
import { Textarea } from "@/components/ui/textarea";
import { getDefaultRiskId } from "@/services/form/formService";
import { Section } from "@/types/form";

interface SecoesTabProps {
  formularioId: string;
}

const SecoesTab: React.FC<SecoesTabProps> = ({ formularioId }) => {
  const [secoes, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [formTitle, setFormTitle] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSecao, setCurrentSecao] = useState<Section | null>(null);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    ordem: 0
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchSecoes = async () => {
    try {
      setLoading(true);
      
      // Fetch sections from new secoes table
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('secoes')
        .select('*')
        .eq('formulario_id', formularioId)
        .order('ordem', { ascending: true });
      
      if (sectionsError) throw sectionsError;
      
      // For each section, count how many questions are there
      const sectionsWithCounts = await Promise.all(sectionsData.map(async (section) => {
        const { count, error: countError } = await supabase
          .from('perguntas')
          .select('id', { count: 'exact', head: true })
          .eq('secao_id', section.id);
          
        if (countError) throw countError;
        
        return {
          ...section,
          count: count || 0
        };
      }));
      
      setSections(sectionsWithCounts);
    } catch (error) {
      toast.error("Erro ao carregar seções");
      console.error("Erro ao carregar seções:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchFormTitle = async () => {
      const { data } = await supabase
        .from('formularios')
        .select('titulo')
        .eq('id', formularioId)
        .single();
      
      if (data) {
        setFormTitle(data.titulo);
      }
    };

    fetchFormTitle();
    fetchSecoes();
  }, [formularioId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEdit = (secao: Section) => {
    setIsEditing(true);
    setCurrentSecao(secao);
    setFormData({
      titulo: secao.titulo || "",
      descricao: secao.descricao || "",
      ordem: secao.ordem
    });
    setDialogOpen(true);
  };

  const handleNew = () => {
    setIsEditing(false);
    setCurrentSecao(null);
    // Definir a ordem para a próxima posição disponível
    const nextOrder = secoes.length > 0 
      ? Math.max(...secoes.map(s => s.ordem)) + 1 
      : 1;
    setFormData({ titulo: "", descricao: "", ordem: nextOrder });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (formData.titulo.trim() === "") {
        toast.error("O título da seção é obrigatório");
        setSubmitting(false);
        return;
      }

      // Garantir que ordem seja um número inteiro
      const ordem = parseInt(String(formData.ordem)) || 0;

      if (isEditing && currentSecao) {
        // Update section in secoes table
        const { error: updateSectionError } = await supabase
          .from('secoes')
          .update({
            titulo: formData.titulo,
            descricao: formData.descricao || null,
            ordem: ordem
          })
          .eq('id', currentSecao.id);

        if (updateSectionError) throw updateSectionError;
          
        // Also update secao and secao_descricao in perguntas table for backwards compatibility
        const { error: updatePerguntasError } = await supabase
          .from('perguntas')
          .update({
            secao: formData.titulo,
            secao_descricao: formData.descricao || null,
            ordem: ordem
          })
          .eq('secao_id', currentSecao.id);
          
        if (updatePerguntasError) throw updatePerguntasError;

        toast.success("Seção atualizada com sucesso");
      } else {
        // Insert new section into secoes table
        const { data: newSection, error: insertSectionError } = await supabase
          .from('secoes')
          .insert({
            titulo: formData.titulo,
            descricao: formData.descricao || null,
            ordem: ordem,
            formulario_id: formularioId
          })
          .select()
          .single();

        if (insertSectionError) throw insertSectionError;
        
        // Create a sample question for this section
        try {
          const defaultRiskId = await getDefaultRiskId();
          
          const { error: insertPerguntaError } = await supabase
            .from('perguntas')
            .insert({
              texto: "Pergunta Exemplo",
              secao_id: newSection.id,
              risco_id: defaultRiskId,
              formulario_id: formularioId
            });
  
          if (insertPerguntaError) {
            console.error("Erro detalhado ao criar pergunta de exemplo:", insertPerguntaError);
            toast.error("Criada a seção, mas não foi possível criar uma pergunta de exemplo");
            return;
          }
        } catch (error: any) {
          console.error("Erro ao criar pergunta de exemplo:", error);
          toast.error(`Criada a seção, mas não foi possível criar uma pergunta de exemplo: ${error.message}`);
          return;
        }

        toast.success("Seção criada com sucesso");
      }

      setDialogOpen(false);
      fetchSecoes();
    } catch (error) {
      console.error("Erro ao salvar seção:", error);
      toast.error("Erro ao salvar seção");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (secaoId: string) => {
    if (confirm("Tem certeza que deseja excluir esta seção? Isso também excluirá todas as perguntas associadas.")) {
      try {
        setLoading(true);
        
        console.log("Excluindo seção:", secaoId, "do formulário:", formularioId);
        
        // Check if there are questions in this section
        const { data: perguntasNaSecao, error: checkError } = await supabase
          .from('perguntas')
          .select('id')
          .eq('secao_id', secaoId);
        
        if (checkError) {
          console.error("Erro ao verificar perguntas na seção:", checkError);
          throw checkError;
        }
        
        console.log("Perguntas encontradas na seção:", perguntasNaSecao?.length || 0);
        
        // Delete questions first (cascade should handle this, but just to be safe)
        if (perguntasNaSecao && perguntasNaSecao.length > 0) {
          const { error: deleteQuestionsError } = await supabase
            .from('perguntas')
            .delete()
            .eq('secao_id', secaoId);
            
          if (deleteQuestionsError) {
            console.error("Erro ao excluir perguntas da seção:", deleteQuestionsError);
            throw deleteQuestionsError;
          }
        }
        
        // Then delete the section
        const { error: deleteSectionError } = await supabase
          .from('secoes')
          .delete()
          .eq('id', secaoId);
          
        if (deleteSectionError) {
          console.error("Erro ao excluir seção:", deleteSectionError);
          throw deleteSectionError;
        }

        toast.success("Seção excluída com sucesso");
        fetchSecoes(); // Atualizar a lista após a exclusão
      } catch (error) {
        console.error("Erro ao excluir seção:", error);
        toast.error("Erro ao excluir seção");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Seções do Formulário</h2>
          <p className="text-muted-foreground">Formulário: {formTitle}</p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Seção
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <p>Carregando seções...</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Quantidade de Perguntas</TableHead>
              <TableHead>Ordem</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {secoes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Nenhuma seção cadastrada. Clique em 'Nova Seção' para adicionar.
                </TableCell>
              </TableRow>
            ) : (
              secoes.map((secao) => (
                <TableRow key={secao.id}>
                  <TableCell className="font-medium">{secao.titulo}</TableCell>
                  <TableCell>{secao.descricao || "-"}</TableCell>
                  <TableCell>{secao.count}</TableCell>
                  <TableCell>{secao.ordem}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(secao)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(secao.id)}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Seção" : "Nova Seção"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Nome da Seção</Label>
                <Input
                  id="titulo"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleInputChange}
                  placeholder="Digite o nome da seção"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição (opcional)</Label>
                <Textarea
                  id="descricao"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleInputChange}
                  placeholder="Descreva a seção brevemente"
                  rows={3}
                />
              </div>
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

export default SecoesTab;
