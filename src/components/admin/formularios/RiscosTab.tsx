
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Risk, Severity } from "@/types/form";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RiscosTabProps {
  formularioId: string;
}

const RiscosTab: React.FC<RiscosTabProps> = ({ formularioId }) => {
  const [riscos, setRiscos] = useState<Risk[]>([]);
  const [severidades, setSeveridades] = useState<Severity[]>([]);
  const [loading, setLoading] = useState(true);
  const [formTitle, setFormTitle] = useState("");
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentRisco, setCurrentRisco] = useState<Risk | null>(null);
  const [novoTexto, setNovoTexto] = useState("");
  const [novaSeveridadeId, setNovaSeveridadeId] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [formularioId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [formData, riscosData, severidadesData] = await Promise.all([
        supabase.from('formularios').select('titulo').eq('id', formularioId).single(),
        supabase.from('riscos').select('*, severidade(*)').order('texto'),
        supabase.from('severidade').select('*').order('ordem')
      ]);

      if (formData.data) {
        setFormTitle(formData.data.titulo);
      }

      if (riscosData.data) {
        setRiscos(riscosData.data);
      }
      
      if (severidadesData.data) {
        setSeveridades(severidadesData.data);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (risco?: Risk) => {
    if (risco) {
      setCurrentRisco(risco);
      setNovoTexto(risco.texto);
      setNovaSeveridadeId(risco.severidade_id);
      setIsEditing(true);
    } else {
      setCurrentRisco(null);
      setNovoTexto("");
      setNovaSeveridadeId(severidades.length > 0 ? severidades[0].id : "");
      setIsEditing(false);
    }
    setIsDialogOpen(true);
  };

  const handleOpenDeleteDialog = (risco: Risk) => {
    setCurrentRisco(risco);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveRisco = async () => {
    if (!novoTexto) {
      toast.error("O texto do risco é obrigatório");
      return;
    }

    if (!novaSeveridadeId) {
      toast.error("A severidade é obrigatória");
      return;
    }

    setLoading(true);
    try {
      if (isEditing && currentRisco) {
        // Editar risco existente
        const { error } = await supabase
          .from('riscos')
          .update({
            texto: novoTexto,
            severidade_id: novaSeveridadeId,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentRisco.id);

        if (error) throw error;
        toast.success("Risco atualizado com sucesso");
      } else {
        // Criar novo risco
        const { error } = await supabase
          .from('riscos')
          .insert({
            texto: novoTexto,
            severidade_id: novaSeveridadeId
          });

        if (error) throw error;
        toast.success("Risco criado com sucesso");
      }
      
      setIsDialogOpen(false);
      fetchData(); // Recarregar dados
    } catch (error) {
      console.error("Erro ao salvar risco:", error);
      toast.error("Erro ao salvar risco");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRisco = async () => {
    if (!currentRisco) return;

    setLoading(true);
    try {
      // Verificar se o risco está sendo usado em perguntas
      const { data: perguntasComRisco, error: checkError } = await supabase
        .from('perguntas')
        .select('id')
        .eq('risco_id', currentRisco.id);

      if (checkError) throw checkError;

      if (perguntasComRisco && perguntasComRisco.length > 0) {
        toast.error(`Não é possível excluir este risco pois ele está sendo usado em ${perguntasComRisco.length} pergunta(s)`);
        setIsDeleteDialogOpen(false);
        return;
      }

      // Verificar se existem mitigações associadas ao risco
      const { data: mitigacoesAssociadas, error: mitigacoesError } = await supabase
        .from('mitigacoes')
        .select('id')
        .eq('risco_id', currentRisco.id);

      if (mitigacoesError) throw mitigacoesError;

      // Excluir mitigações associadas primeiro
      if (mitigacoesAssociadas && mitigacoesAssociadas.length > 0) {
        const { error: deleteMitigacoesError } = await supabase
          .from('mitigacoes')
          .delete()
          .eq('risco_id', currentRisco.id);

        if (deleteMitigacoesError) throw deleteMitigacoesError;
        console.log(`${mitigacoesAssociadas.length} mitigações associadas foram excluídas`);
      }

      // Excluir o risco
      const { error: deleteError } = await supabase
        .from('riscos')
        .delete()
        .eq('id', currentRisco.id);

      if (deleteError) throw deleteError;

      toast.success("Risco excluído com sucesso");
      setIsDeleteDialogOpen(false);
      fetchData(); // Recarregar dados
    } catch (error) {
      console.error("Erro ao excluir risco:", error);
      toast.error("Erro ao excluir risco");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Riscos para o Formulário</h2>
          <p className="text-muted-foreground">Formulário: {formTitle}</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Risco
        </Button>
      </div>

      {loading ? (
        <div>Carregando riscos...</div>
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
            {riscos.map((risco) => (
              <TableRow key={risco.id}>
                <TableCell>{risco.texto}</TableCell>
                <TableCell>{risco.severidade?.nivel}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(risco)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleOpenDeleteDialog(risco)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Dialog para criar/editar risco */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Risco" : "Novo Risco"}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? "Edite as informações do risco abaixo."
                : "Preencha as informações para criar um novo risco."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="textoRisco" className="text-right">Texto</label>
              <Input
                id="textoRisco"
                value={novoTexto}
                onChange={(e) => setNovoTexto(e.target.value)}
                className="col-span-3"
                placeholder="Digite o texto do risco"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="severidadeRisco" className="text-right">Severidade</label>
              <Select
                value={novaSeveridadeId}
                onValueChange={setNovaSeveridadeId}
              >
                <SelectTrigger className="col-span-3">
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
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveRisco}
              disabled={loading || !novoTexto || !novaSeveridadeId}
            >
              {isEditing ? "Salvar alterações" : "Criar risco"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para confirmar exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o risco "{currentRisco?.texto}"?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteRisco}
              disabled={loading}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RiscosTab;
