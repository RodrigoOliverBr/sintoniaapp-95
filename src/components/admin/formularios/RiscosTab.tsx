
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
import { Risk } from "@/types/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RiscosTabProps {
  formularioId: string;
}

const RiscosTab: React.FC<RiscosTabProps> = ({ formularioId }) => {
  const [riscos, setRiscos] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [severidades, setSeveridades] = useState<{id: string, nivel: string}[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRisco, setCurrentRisco] = useState<Risk | null>(null);
  const [formData, setFormData] = useState({
    texto: "",
    severidade_id: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchRiscos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('riscos')
        .select(`
          *,
          severidade:severidade (*)
        `)
        .order('texto');

      if (error) throw error;
      setRiscos(data || []);
    } catch (error) {
      console.error("Erro ao carregar riscos:", error);
      toast.error("Erro ao carregar riscos");
    } finally {
      setLoading(false);
    }
  };

  const fetchSeveridades = async () => {
    try {
      const { data, error } = await supabase
        .from('severidade')
        .select('id, nivel')
        .order('nivel');

      if (error) throw error;
      setSeveridades(data || []);
    } catch (error) {
      console.error("Erro ao carregar severidades:", error);
    }
  };

  useEffect(() => {
    fetchRiscos();
    fetchSeveridades();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleEdit = (risco: Risk) => {
    setIsEditing(true);
    setCurrentRisco(risco);
    setFormData({
      texto: risco.texto,
      severidade_id: risco.severidade_id
    });
    setDialogOpen(true);
  };

  const handleNew = () => {
    setIsEditing(false);
    setCurrentRisco(null);
    setFormData({ texto: "", severidade_id: severidades.length > 0 ? severidades[0].id : "" });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (formData.texto.trim() === "") {
        toast.error("O texto do risco é obrigatório");
        return;
      }

      if (!formData.severidade_id) {
        toast.error("É necessário selecionar uma severidade");
        return;
      }

      if (isEditing && currentRisco) {
        const { error } = await supabase
          .from('riscos')
          .update({
            texto: formData.texto,
            severidade_id: formData.severidade_id
          })
          .eq('id', currentRisco.id);

        if (error) throw error;
        toast.success("Risco atualizado com sucesso");
      } else {
        const { error } = await supabase
          .from('riscos')
          .insert({
            texto: formData.texto,
            severidade_id: formData.severidade_id
          });

        if (error) throw error;
        toast.success("Risco criado com sucesso");
      }

      setDialogOpen(false);
      fetchRiscos();
    } catch (error) {
      console.error("Erro ao salvar risco:", error);
      toast.error("Erro ao salvar risco");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (riscoId: string) => {
    if (confirm("Tem certeza que deseja excluir este risco?")) {
      try {
        // Check if there are any questions using this risk
        const { data: perguntasData, error: perguntasError } = await supabase
          .from('perguntas')
          .select('id')
          .eq('risco_id', riscoId);

        if (perguntasError) throw perguntasError;
        
        if (perguntasData && perguntasData.length > 0) {
          toast.error("Não é possível excluir este risco pois já existem perguntas associadas");
          return;
        }

        // Check if there are any mitigations using this risk
        const { data: mitigacoesData, error: mitigacoesError } = await supabase
          .from('mitigacoes')
          .select('id')
          .eq('risco_id', riscoId);

        if (mitigacoesError) throw mitigacoesError;
        
        if (mitigacoesData && mitigacoesData.length > 0) {
          toast.error("Não é possível excluir este risco pois já existem ações de mitigação associadas");
          return;
        }

        const { error } = await supabase
          .from('riscos')
          .delete()
          .eq('id', riscoId);

        if (error) throw error;

        toast.success("Risco excluído com sucesso");
        fetchRiscos();
      } catch (error) {
        console.error("Erro ao excluir risco:", error);
        toast.error("Erro ao excluir risco");
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Riscos para o Formulário: {formularioId}</h2>
          <p className="text-muted-foreground">Esta seção permite gerenciar os riscos associados ao formulário.</p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Risco
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <p>Carregando riscos...</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Texto</TableHead>
              <TableHead>Severidade</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {riscos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8">
                  Nenhum risco cadastrado. Clique em 'Novo Risco' para adicionar.
                </TableCell>
              </TableRow>
            ) : (
              riscos.map((risco) => (
                <TableRow key={risco.id}>
                  <TableCell className="font-medium">{risco.texto}</TableCell>
                  <TableCell>
                    {risco.severidade?.nivel || "Não definida"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(risco)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(risco.id)}
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
              {isEditing ? "Editar Risco" : "Novo Risco"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="texto">Texto do Risco</Label>
                <Textarea
                  id="texto"
                  name="texto"
                  value={formData.texto}
                  onChange={handleInputChange}
                  placeholder="Descreva o risco"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="severidade">Severidade</Label>
                <Select 
                  value={formData.severidade_id} 
                  onValueChange={(value) => handleSelectChange("severidade_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a severidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {severidades.map((severidade) => (
                      <SelectItem key={severidade.id} value={severidade.id}>
                        {severidade.nivel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

export default RiscosTab;
