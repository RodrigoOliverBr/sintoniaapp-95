
import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2 } from "lucide-react";

interface Formulario {
  id: string;
  titulo: string;
  descricao?: string;
  created_at: string;
  ativo: boolean;
}

const FormulariosPage = () => {
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentFormulario, setCurrentFormulario] = useState<Formulario | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: ''
  });

  const fetchFormularios = async () => {
    try {
      const { data, error } = await supabase
        .from('formularios')
        .select('*')
        .order('created_at');

      if (error) throw error;
      setFormularios(data || []);
    } catch (error) {
      console.error('Erro ao carregar formulários:', error);
      toast.error('Não foi possível carregar os formulários');
    }
  };

  useEffect(() => {
    fetchFormularios();
  }, []);

  const handleNew = () => {
    setCurrentFormulario(null);
    setFormData({ titulo: '', descricao: '' });
    setIsDialogOpen(true);
  };

  const handleEdit = (formulario: Formulario) => {
    setCurrentFormulario(formulario);
    setFormData({
      titulo: formulario.titulo,
      descricao: formulario.descricao || ''
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (currentFormulario) {
        // Update existing form
        const { error } = await supabase
          .from('formularios')
          .update({
            titulo: formData.titulo,
            descricao: formData.descricao || null
          })
          .eq('id', currentFormulario.id);

        if (error) throw error;
        toast.success('Formulário atualizado com sucesso');
      } else {
        // Create new form
        const { error } = await supabase
          .from('formularios')
          .insert({
            titulo: formData.titulo,
            descricao: formData.descricao || null,
            ativo: true
          });

        if (error) throw error;
        toast.success('Formulário criado com sucesso');
      }

      setIsDialogOpen(false);
      fetchFormularios();
    } catch (error) {
      console.error('Erro ao salvar formulário:', error);
      toast.error('Não foi possível salvar o formulário');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este formulário? Isso removerá todos os dados associados.')) {
      try {
        const { error } = await supabase
          .from('formularios')
          .delete()
          .eq('id', id);

        if (error) throw error;

        toast.success('Formulário excluído com sucesso');
        fetchFormularios();
      } catch (error) {
        console.error('Erro ao excluir formulário:', error);
        toast.error('Não foi possível excluir o formulário');
      }
    }
  };

  return (
    <AdminLayout title="Gerenciamento de Formulários">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Formulários</h2>
          <Button onClick={handleNew}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Formulário
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Data de Criação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {formularios.map((formulario) => (
              <TableRow key={formulario.id}>
                <TableCell className="font-medium">{formulario.titulo}</TableCell>
                <TableCell>{formulario.descricao || "-"}</TableCell>
                <TableCell>{new Date(formulario.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(formulario)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(formulario.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Dialog para criar/editar formulários */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {currentFormulario ? "Editar Formulário" : "Novo Formulário"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título do Formulário</Label>
                  <Input
                    id="titulo"
                    name="titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                    placeholder="Digite o título do formulário"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição (opcional)</Label>
                  <Textarea
                    id="descricao"
                    name="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    placeholder="Descreva o formulário brevemente"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default FormulariosPage;
