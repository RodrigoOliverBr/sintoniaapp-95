
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

interface Mitigacao {
  id: string;
  texto: string;
  risco: {
    id: string;
    texto: string;
  } | null;
  risco_id?: string;
}

interface Risco {
  id: string;
  texto: string;
}

const MitigacoesTab = () => {
  const [mitigacoes, setMitigacoes] = useState<Mitigacao[]>([]);
  const [riscos, setRiscos] = useState<Risco[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroRisco, setFiltroRisco] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMitigacao, setCurrentMitigacao] = useState<Mitigacao | null>(null);
  const [formData, setFormData] = useState({
    texto: "",
    risco_id: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchMitigacoes = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('mitigacoes')
        .select(`
          *,
          risco:riscos (
            id,
            texto
          )
        `);

      if (filtroRisco !== "all") {
        query = query.eq('risco_id', filtroRisco);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }
      
      setMitigacoes(data || []);
      
    } catch (error) {
      toast.error("Erro ao carregar ações de mitigação");
      console.error("Erro ao carregar ações de mitigação:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRiscos = async () => {
    try {
      const { data, error } = await supabase
        .from('riscos')
        .select('id, texto')
        .order('texto');
        
      if (error) {
        throw error;
      }
      
      setRiscos(data || []);
    } catch (error) {
      toast.error("Erro ao carregar riscos");
      console.error("Erro ao carregar riscos:", error);
    }
  };

  useEffect(() => {
    fetchRiscos();
    fetchMitigacoes();
  }, []);

  useEffect(() => {
    fetchMitigacoes();
  }, [filtroRisco]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEdit = (mitigacao: Mitigacao) => {
    setIsEditing(true);
    setCurrentMitigacao(mitigacao);
    setFormData({
      texto: mitigacao.texto,
      risco_id: mitigacao.risco_id || mitigacao.risco?.id || ""
    });
    setDialogOpen(true);
  };

  const handleNew = () => {
    setIsEditing(false);
    setCurrentMitigacao(null);
    setFormData({ texto: "", risco_id: "" });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (formData.texto.trim() === "") {
        toast.error("O texto da ação de mitigação é obrigatório");
        return;
      }

      if (!formData.risco_id) {
        toast.error("É necessário selecionar um risco");
        return;
      }

      if (isEditing && currentMitigacao) {
        // Update existing mitigação
        const { error } = await supabase
          .from('mitigacoes')
          .update({
            texto: formData.texto,
            risco_id: formData.risco_id
          })
          .eq('id', currentMitigacao.id);

        if (error) throw error;
        toast.success("Ação de mitigação atualizada com sucesso");
      } else {
        // Create new mitigação
        const { error } = await supabase
          .from('mitigacoes')
          .insert({
            texto: formData.texto,
            risco_id: formData.risco_id
          });

        if (error) throw error;
        toast.success("Ação de mitigação criada com sucesso");
      }

      setDialogOpen(false);
      fetchMitigacoes();
    } catch (error) {
      console.error("Erro ao salvar ação de mitigação:", error);
      toast.error("Erro ao salvar ação de mitigação");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta ação de mitigação?")) {
      try {
        const { error } = await supabase
          .from('mitigacoes')
          .delete()
          .eq('id', id);

        if (error) throw error;

        toast.success("Ação de mitigação excluída com sucesso");
        fetchMitigacoes();
      } catch (error) {
        console.error("Erro ao excluir ação de mitigação:", error);
        toast.error("Erro ao excluir ação de mitigação");
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Ações de Mitigação</h2>
          <div className="flex gap-4">
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
          Nova Ação de Mitigação
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <p>Carregando ações de mitigação...</p>
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
                  {filtroRisco !== "all" ? 
                    "Nenhuma ação de mitigação encontrada para este risco." :
                    "Nenhuma ação de mitigação cadastrada. Clique em 'Nova Ação de Mitigação' para adicionar."}
                </TableCell>
              </TableRow>
            ) : (
              mitigacoes.map((mitigacao) => (
                <TableRow key={mitigacao.id}>
                  <TableCell className="font-medium">{mitigacao.texto}</TableCell>
                  <TableCell>{mitigacao.risco?.texto || "-"}</TableCell>
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

      {/* Dialog para criar/editar mitigações */}
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
                <Label htmlFor="texto">Texto da Ação de Mitigação</Label>
                <Input
                  id="texto"
                  name="texto"
                  value={formData.texto}
                  onChange={handleInputChange}
                  placeholder="Descreva a ação de mitigação"
                />
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
                    {riscos.map((risco) => (
                      <SelectItem key={risco.id} value={risco.id}>
                        {risco.texto}
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

export default MitigacoesTab;
