
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mitigation, Risk } from "@/types/form";

interface MitigacoesTabProps {
  formularioId: string;
}

const MitigacoesTab: React.FC<MitigacoesTabProps> = ({ formularioId }) => {
  const [mitigacoes, setMitigacoes] = useState<Mitigation[]>([]);
  const [riscos, setRiscos] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [formTitle, setFormTitle] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMitigacao, setCurrentMitigacao] = useState<Mitigation | null>(null);
  const [formData, setFormData] = useState({
    texto: "",
    risco_id: ""
  });
  const [submitting, setSubmitting] = useState(false);

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
    fetchMitigacoes();
    fetchRiscos();
  }, [formularioId]);

  const fetchMitigacoes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('mitigacoes')
        .select(`
          *,
          riscos (*)
        `)
        .order('texto');

      if (error) throw error;
      setMitigacoes(data || []);
    } catch (error) {
      console.error("Erro ao carregar mitigações:", error);
      toast.error("Erro ao carregar mitigações");
    } finally {
      setLoading(false);
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

  const handleEdit = (mitigacao: Mitigation) => {
    setIsEditing(true);
    setCurrentMitigacao(mitigacao);
    setFormData({
      texto: mitigacao.texto,
      risco_id: mitigacao.risco_id
    });
    setDialogOpen(true);
  };

  const handleNew = () => {
    setIsEditing(false);
    setCurrentMitigacao(null);
    setFormData({ texto: "", risco_id: "" });
    setDialogOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (formData.texto.trim() === "") {
        toast.error("O texto da mitigação é obrigatório");
        return;
      }

      if (formData.risco_id.trim() === "") {
        toast.error("É necessário selecionar um risco");
        return;
      }

      const mitigacaoData = {
        texto: formData.texto,
        risco_id: formData.risco_id
      };

      if (isEditing && currentMitigacao) {
        const { error } = await supabase
          .from('mitigacoes')
          .update(mitigacaoData)
          .eq('id', currentMitigacao.id);

        if (error) throw error;
        toast.success("Mitigação atualizada com sucesso");
      } else {
        const { error } = await supabase
          .from('mitigacoes')
          .insert(mitigacaoData);

        if (error) throw error;
        toast.success("Mitigação criada com sucesso");
      }

      setDialogOpen(false);
      fetchMitigacoes();
    } catch (error) {
      console.error("Erro ao salvar mitigação:", error);
      toast.error("Erro ao salvar mitigação");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta mitigação?")) {
      try {
        const { error } = await supabase
          .from('mitigacoes')
          .delete()
          .eq('id', id);

        if (error) throw error;

        toast.success("Mitigação excluída com sucesso");
        fetchMitigacoes();
      } catch (error) {
        console.error("Erro ao excluir mitigação:", error);
        toast.error("Erro ao excluir mitigação");
      }
    }
  };

  const getRiscoTexto = (risco_id: string) => {
    const risco = riscos.find(r => r.id === risco_id);
    return risco ? risco.texto : "Risco não encontrado";
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Ações de Mitigação</h2>
          <p className="text-muted-foreground">Formulário: {formTitle}</p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Ação de Mitigação
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <p>Carregando mitigações...</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Texto</TableHead>
              <TableHead>Risco Associado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mitigacoes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8">
                  Nenhuma ação de mitigação cadastrada. Clique em 'Nova Ação de Mitigação' para adicionar.
                </TableCell>
              </TableRow>
            ) : (
              mitigacoes.map((mitigacao) => (
                <TableRow key={mitigacao.id}>
                  <TableCell className="font-medium">{mitigacao.texto}</TableCell>
                  <TableCell>{getRiscoTexto(mitigacao.risco_id)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(mitigacao)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(mitigacao.id)}
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
              {isEditing ? "Editar Ação de Mitigação" : "Nova Ação de Mitigação"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="risco_id">Risco Associado</Label>
                <Select 
                  value={formData.risco_id} 
                  onValueChange={(value) => setFormData({...formData, risco_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um risco" />
                  </SelectTrigger>
                  <SelectContent>
                    {riscos.map((risco) => (
                      <SelectItem key={risco.id} value={risco.id}>
                        {risco.texto}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="texto">Texto da Mitigação</Label>
                <Textarea
                  id="texto"
                  name="texto"
                  value={formData.texto}
                  onChange={handleInputChange}
                  placeholder="Digite a ação de mitigação"
                  rows={3}
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

export default MitigacoesTab;
