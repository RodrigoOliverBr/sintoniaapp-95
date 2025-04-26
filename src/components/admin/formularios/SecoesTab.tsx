
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

interface Secao {
  nome: string;
  descricao: string | null;
  count: number;
  ordem: number;
}

interface SecoesTabProps {
  formularioId: string;
}

const SecoesTab: React.FC<SecoesTabProps> = ({ formularioId }) => {
  const [secoes, setSecoes] = useState<Secao[]>([]);
  const [loading, setLoading] = useState(true);
  const [formTitle, setFormTitle] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSecao, setCurrentSecao] = useState<Secao | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    ordem: 0
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchSecoes = async () => {
    try {
      setLoading(true);
      // Query para buscar as seções e suas ordens
      const { data, error } = await supabase
        .from('perguntas')
        .select('secao, secao_descricao, ordem')
        .eq('formulario_id', formularioId)
        .order('ordem', { ascending: true })
        .order('secao');

      if (error) {
        throw error;
      }

      // Agrupar as perguntas por seção e pegar a maior ordem para cada seção
      const secoesMap: Record<string, Secao> = {};
      
      data.forEach(item => {
        const secao = item.secao;
        if (!secoesMap[secao]) {
          secoesMap[secao] = {
            nome: secao,
            descricao: item.secao_descricao,
            count: 0,
            ordem: item.ordem || 0,
          };
        }
        secoesMap[secao].count++;
        
        // Se encontrarmos uma pergunta com ordem maior, atualizamos a ordem da seção
        if ((item.ordem || 0) > secoesMap[secao].ordem) {
          secoesMap[secao].ordem = item.ordem || 0;
        }
      });

      // Ordenar as seções pela ordem antes de exibir
      const secoesOrdenadas = Object.values(secoesMap).sort((a, b) => a.ordem - b.ordem);
      setSecoes(secoesOrdenadas);
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

  const handleEdit = (secao: Secao) => {
    setIsEditing(true);
    setCurrentSecao(secao);
    setFormData({
      nome: secao.nome,
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
    setFormData({ nome: "", descricao: "", ordem: nextOrder });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (formData.nome.trim() === "") {
        toast.error("O nome da seção é obrigatório");
        setSubmitting(false);
        return;
      }

      // Garantir que ordem seja um número inteiro
      const ordem = parseInt(String(formData.ordem)) || 0;

      if (isEditing && currentSecao) {
        // Atualizando todas as perguntas desta seção com a nova ordem e descrição
        const { error } = await supabase
          .from('perguntas')
          .update({
            secao: formData.nome,
            secao_descricao: formData.descricao || null,
            ordem: ordem
          })
          .eq('secao', currentSecao.nome)
          .eq('formulario_id', formularioId);

        if (error) throw error;
        toast.success("Seção atualizada com sucesso");
      } else {
        // Criando uma nova seção com uma pergunta exemplo
        const { error } = await supabase
          .from('perguntas')
          .insert({
            secao: formData.nome,
            secao_descricao: formData.descricao || null,
            texto: "Pergunta Exemplo",
            formulario_id: formularioId,
            risco_id: null,
            ordem: ordem
          });

        if (error) {
          toast.error("Não foi possível criar a seção. Erro: " + error.message);
          setSubmitting(false);
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

  const handleDelete = async (secaoNome: string) => {
    if (confirm("Tem certeza que deseja excluir esta seção? Isso também excluirá todas as perguntas associadas.")) {
      try {
        const { error } = await supabase
          .from('perguntas')
          .delete()
          .eq('secao', secaoNome)
          .eq('formulario_id', formularioId);

        if (error) throw error;

        toast.success("Seção excluída com sucesso");
        fetchSecoes();
      } catch (error) {
        console.error("Erro ao excluir seção:", error);
        toast.error("Erro ao excluir seção");
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
                <TableRow key={secao.nome}>
                  <TableCell className="font-medium">{secao.nome}</TableCell>
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
                        onClick={() => handleDelete(secao.nome)}
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
                <Label htmlFor="nome">Nome da Seção</Label>
                <Input
                  id="nome"
                  name="nome"
                  value={formData.nome}
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
