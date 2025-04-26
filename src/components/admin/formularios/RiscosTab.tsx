
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
import { Badge } from "@/components/ui/badge";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Risco {
  id: string;
  texto: string;
  severidade: {
    id: string;
    nivel: string;
  } | null;
  severidade_id?: string;
  acoesMitigacao?: number;
}

interface Severidade {
  id: string;
  nivel: string;
  descricao?: string;
}

const RiscosTab = () => {
  const [riscos, setRiscos] = useState<Risco[]>([]);
  const [severidades, setSeveridades] = useState<Severidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRisco, setCurrentRisco] = useState<Risco | null>(null);
  const [formData, setFormData] = useState({
    texto: "",
    severidade_id: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchRiscos = async () => {
    try {
      setLoading(true);
      // Fetch risks with their severities and count of mitigation actions
      const { data, error } = await supabase
        .from('riscos')
        .select(`
          *,
          severidade:severidade (
            id,
            nivel
          ),
          mitigacoes:mitigacoes(count)
        `);

      if (error) throw error;
      
      // Process the data to add the count of mitigation actions
      const processedRiscos = data?.map(risco => ({
        ...risco,
        acoesMitigacao: risco.mitigacoes?.[0]?.count || 0
      })) || [];
      
      setRiscos(processedRiscos);
    } catch (error) {
      toast.error("Erro ao carregar riscos");
      console.error("Erro ao carregar riscos:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSeveridades = async () => {
    try {
      const { data, error } = await supabase
        .from('severidade')
        .select('*')
        .order('nivel');
        
      if (error) throw error;
      
      setSeveridades(data || []);
    } catch (error) {
      toast.error("Erro ao carregar níveis de severidade");
      console.error("Erro ao carregar níveis de severidade:", error);
    }
  };

  useEffect(() => {
    fetchSeveridades();
    fetchRiscos();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEdit = (risco: Risco) => {
    setIsEditing(true);
    setCurrentRisco(risco);
    setFormData({
      texto: risco.texto,
      severidade_id: risco.severidade_id || risco.severidade?.id || ""
    });
    setDialogOpen(true);
  };

  const handleNew = () => {
    setIsEditing(false);
    setCurrentRisco(null);
    setFormData({ texto: "", severidade_id: "" });
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
        toast.error("É necessário selecionar um nível de severidade");
        return;
      }

      if (isEditing && currentRisco) {
        // Update existing risco
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
        // Create new risco
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

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este risco? Isso também excluirá todas as ações de mitigação associadas.")) {
      try {
        // Check if there are any questions using this risk
        const { data: perguntasData, error: perguntasError } = await supabase
          .from('perguntas')
          .select('id')
          .eq('risco_id', id);

        if (perguntasError) throw perguntasError;
        
        if (perguntasData && perguntasData.length > 0) {
          toast.error("Não é possível excluir este risco pois está sendo utilizado em perguntas");
          return;
        }

        // Delete all mitigations first
        const { error: mitigacoesError } = await supabase
          .from('mitigacoes')
          .delete()
          .eq('risco_id', id);

        if (mitigacoesError) throw mitigacoesError;

        // Then delete the risk
        const { error } = await supabase
          .from('riscos')
          .delete()
          .eq('id', id);

        if (error) throw error;

        toast.success("Risco excluído com sucesso");
        fetchRiscos();
      } catch (error) {
        console.error("Erro ao excluir risco:", error);
        toast.error("Erro ao excluir risco");
      }
    }
  };

  const getSeveridadeColor = (nivel: string) => {
    switch (nivel) {
      case "PREJUDICIAL":
        return "bg-red-500";
      case "LEVEMENTE PREJUDICIAL":
        return "bg-yellow-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Riscos</h2>
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
              <TableHead>Ações de Mitigação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {riscos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  Nenhum risco cadastrado. Clique em 'Novo Risco' para adicionar.
                </TableCell>
              </TableRow>
            ) : (
              riscos.map((risco) => (
                <TableRow key={risco.id}>
                  <TableCell className="font-medium">{risco.texto}</TableCell>
                  <TableCell>
                    {risco.severidade && (
                      <Badge className={`${getSeveridadeColor(risco.severidade.nivel)}`}>
                        {risco.severidade.nivel}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{risco.acoesMitigacao}</TableCell>
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

      {/* Dialog para criar/editar riscos */}
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
                <Input
                  id="texto"
                  name="texto"
                  value={formData.texto}
                  onChange={handleInputChange}
                  placeholder="Descreva o risco"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="severidade_id">Nível de Severidade</Label>
                <Select 
                  name="severidade_id" 
                  value={formData.severidade_id} 
                  onValueChange={(value) => setFormData({...formData, severidade_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um nível de severidade" />
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
