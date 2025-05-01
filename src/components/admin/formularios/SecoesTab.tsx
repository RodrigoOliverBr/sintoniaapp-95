import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Secao } from "@/pages/admin/FormulariosPage";

export interface SecoesTabProps {
  formularioId: string;
  secoes: Secao[];
  setSecoes: React.Dispatch<React.SetStateAction<Secao[]>>;
  activeTab: string;
}

const SecoesTab: React.FC<SecoesTabProps> = ({ formularioId, secoes, setSecoes, activeTab }) => {
  const [editingSecaoId, setEditingSecaoId] = useState<string | null>(null);
  const [isAddingSecao, setIsAddingSecao] = useState(false);
  const [newSecaoTitulo, setNewSecaoTitulo] = useState("");
  const [newSecaoDescricao, setNewSecaoDescricao] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [secaoToDelete, setSecaoToDelete] = useState<Secao | null>(null);
  const [isCreatingPerguntas, setIsCreatingPerguntas] = useState(false);
  const [novasPerguntasTitulos, setNovasPerguntasTitulos] = useState<string[]>([""]);
  const [selectedSecaoId, setSelectedSecaoId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "secoes" && formularioId) {
      carregarSecoes();
    }
  }, [activeTab, formularioId]);

  const carregarSecoes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("secoes")
        .select("*")
        .eq("formulario_id", formularioId)
        .order("ordem", { ascending: true });

      if (error) throw error;

      setSecoes(data || []);
    } catch (error) {
      console.error("Erro ao carregar seções:", error);
      toast.error("Erro ao carregar seções do formulário");
    } finally {
      setIsLoading(false);
    }
  };

  const addSecao = async () => {
    if (!newSecaoTitulo.trim()) {
      toast.error("O título da seção é obrigatório");
      return;
    }

    setIsLoading(true);
    try {
      // Encontrar a maior ordem existente
      const maxOrdem = secoes.length > 0 
        ? Math.max(...secoes.map(s => s.ordem || 0)) 
        : 0;

      const novaSecao = {
        titulo: newSecaoTitulo.trim(),
        descricao: newSecaoDescricao.trim() || null,
        formulario_id: formularioId,
        ordem: maxOrdem + 1,
      };

      const { data, error } = await supabase
        .from("secoes")
        .insert(novaSecao)
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setSecoes([...secoes, data[0] as Secao]);
        toast.success("Seção adicionada com sucesso!");
        setIsAddingSecao(false);
        setNewSecaoTitulo("");
        setNewSecaoDescricao("");
      }
    } catch (error) {
      console.error("Erro ao adicionar seção:", error);
      toast.error("Erro ao adicionar seção");
    } finally {
      setIsLoading(false);
    }
  };

  const updateSecao = async (secaoId: string, titulo: string, descricao: string) => {
    if (!titulo.trim()) {
      toast.error("O título da seção é obrigatório");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("secoes")
        .update({
          titulo: titulo.trim(),
          descricao: descricao.trim() || null,
        })
        .eq("id", secaoId);

      if (error) throw error;

      const updatedSecoes = secoes.map((s) =>
        s.id === secaoId ? { ...s, titulo, descricao } : s
      );
      
      setSecoes(updatedSecoes);
      setEditingSecaoId(null);
      toast.success("Seção atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar seção:", error);
      toast.error("Erro ao atualizar seção");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSecao = async () => {
    if (!secaoToDelete) return;

    setIsLoading(true);
    try {
      // Verificar se existem perguntas associadas a esta seção
      const { data: perguntasData, error: perguntasError } = await supabase
        .from("perguntas")
        .select("id")
        .eq("secao_id", secaoToDelete.id);

      if (perguntasError) throw perguntasError;

      if (perguntasData && perguntasData.length > 0) {
        toast.error(
          `Esta seção contém ${perguntasData.length} perguntas. Remova as perguntas antes de excluir a seção.`
        );
        setIsDeleteDialogOpen(false);
        setSecaoToDelete(null);
        setIsLoading(false);
        return;
      }

      const { error } = await supabase
        .from("secoes")
        .delete()
        .eq("id", secaoToDelete.id);

      if (error) throw error;

      setSecoes(secoes.filter((s) => s.id !== secaoToDelete.id));
      toast.success("Seção excluída com sucesso!");
      setIsDeleteDialogOpen(false);
      setSecaoToDelete(null);
    } catch (error) {
      console.error("Erro ao excluir seção:", error);
      toast.error("Erro ao excluir seção");
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteDialog = (secao: Secao) => {
    setSecaoToDelete(secao);
    setIsDeleteDialogOpen(true);
  };

  const handleAddPerguntaField = () => {
    setNovasPerguntasTitulos([...novasPerguntasTitulos, ""]);
  };

  const handlePerguntaTituloChange = (index: number, value: string) => {
    const newTitulos = [...novasPerguntasTitulos];
    newTitulos[index] = value;
    setNovasPerguntasTitulos(newTitulos);
  };

  const handleRemovePerguntaField = (index: number) => {
    const newTitulos = [...novasPerguntasTitulos];
    newTitulos.splice(index, 1);
    setNovasPerguntasTitulos(newTitulos);
  };

  const createPerguntas = async () => {
    if (!selectedSecaoId) {
      toast.error("Selecione uma seção para adicionar perguntas");
      return;
    }

    const perguntasTitulos = novasPerguntasTitulos.filter((t) => t.trim() !== "");
    if (perguntasTitulos.length === 0) {
      toast.error("Adicione pelo menos uma pergunta");
      return;
    }

    setIsLoading(true);
    try {
      // Get the highest ordem_pergunta for this secao
      const { data: existingPerguntas, error: queryError } = await supabase
        .from("perguntas")
        .select("ordem_pergunta")
        .eq("secao_id", selectedSecaoId)
        .order("ordem_pergunta", { ascending: false })
        .limit(1);

      if (queryError) throw queryError;

      let nextOrdem = 1;
      if (existingPerguntas && existingPerguntas.length > 0 && existingPerguntas[0].ordem_pergunta) {
        nextOrdem = existingPerguntas[0].ordem_pergunta + 1;
      }

      // Preparar as perguntas para inserção
      const perguntasToInsert = perguntasTitulos.map((texto, index) => ({
        texto,
        secao_id: selectedSecaoId,
        formulario_id: formularioId,
        ordem_pergunta: nextOrdem + index,
        risco_id: "00000000-0000-0000-0000-000000000000", // ID padrão ou aleatório
        observacao_obrigatoria: false
      }));

      // Inserir as perguntas
      const { error } = await supabase
        .from("perguntas")
        .insert(perguntasToInsert);

      if (error) throw error;

      toast.success(`${perguntasTitulos.length} perguntas adicionadas com sucesso!`);
      setIsCreatingPerguntas(false);
      setNovasPerguntasTitulos([""]);
      setSelectedSecaoId(null);
    } catch (error) {
      console.error("Erro ao adicionar perguntas:", error);
      toast.error("Erro ao adicionar perguntas");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Seções do Formulário</h2>
        <div className="space-x-2">
          <Button
            onClick={() => {
              setIsAddingSecao(true);
              setNewSecaoTitulo("");
              setNewSecaoDescricao("");
            }}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" /> Adicionar Seção
          </Button>
          <Button
            onClick={() => {
              setIsCreatingPerguntas(true);
              setNovasPerguntasTitulos([""]);
            }}
            variant="outline"
            disabled={secoes.length === 0 || isLoading}
          >
            <Plus className="h-4 w-4 mr-2" /> Adicionar Perguntas
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Ordem</TableHead>
              <TableHead className="w-[200px]">Título</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {secoes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Nenhuma seção encontrada.
                </TableCell>
              </TableRow>
            ) : (
              secoes.map((secao) => (
                <TableRow key={secao.id}>
                  <TableCell>{secao.ordem}</TableCell>
                  <TableCell>
                    {editingSecaoId === secao.id ? (
                      <Input
                        type="text"
                        value={secao.titulo}
                        onChange={(e) => {
                          const updatedSecoes = secoes.map((s) =>
                            s.id === secao.id ? { ...s, titulo: e.target.value } : s
                          );
                          setSecoes(updatedSecoes);
                        }}
                      />
                    ) : (
                      secao.titulo
                    )}
                  </TableCell>
                  <TableCell>
                    {editingSecaoId === secao.id ? (
                      <Textarea
                        value={secao.descricao || ""}
                        onChange={(e) => {
                          const updatedSecoes = secoes.map((s) =>
                            s.id === secao.id ? { ...s, descricao: e.target.value } : s
                          );
                          setSecoes(updatedSecoes);
                        }}
                      />
                    ) : (
                      secao.descricao
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingSecaoId === secao.id ? (
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateSecao(secao.id, secao.titulo, secao.descricao || "")}
                          disabled={isLoading}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Salvar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingSecaoId(null)}
                          disabled={isLoading}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingSecaoId(secao.id)}
                          disabled={isLoading}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(secao)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Dialog for deleting a section */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Excluir Seção</DialogTitle>
            <DialogDescription>
              Tem certeza de que deseja excluir esta seção? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={deleteSecao} disabled={isLoading}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for adding perguntas to a section */}
      <Dialog open={isCreatingPerguntas} onOpenChange={setIsCreatingPerguntas}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Adicionar Perguntas</DialogTitle>
            <DialogDescription>
              Adicione novas perguntas a uma seção existente do formulário.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="secao" className="text-right">
                Seção
              </Label>
              <select
                id="secao"
                className="col-span-3 rounded-md border border-gray-200 px-2 py-1 text-sm"
                value={selectedSecaoId || ""}
                onChange={(e) => setSelectedSecaoId(e.target.value)}
              >
                <option value="">Selecione uma seção</option>
                {secoes.map((secao) => (
                  <option key={secao.id} value={secao.id}>
                    {secao.titulo}
                  </option>
                ))}
              </select>
            </div>
            {novasPerguntasTitulos.map((titulo, index) => (
              <div className="grid grid-cols-4 items-center gap-4" key={index}>
                <Label htmlFor={`pergunta-${index}`} className="text-right">
                  Pergunta {index + 1}
                </Label>
                <Input
                  type="text"
                  id={`pergunta-${index}`}
                  value={titulo}
                  onChange={(e) => handlePerguntaTituloChange(index, e.target.value)}
                  className="col-span-3"
                />
                {novasPerguntasTitulos.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemovePerguntaField(index)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remover
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="link" onClick={handleAddPerguntaField}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar outra pergunta
            </Button>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsCreatingPerguntas(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button onClick={createPerguntas} disabled={isLoading}>
              Adicionar Perguntas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SecoesTab;
