
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, Plus, ExternalLink, Lock, Unlock, Check, AlertTriangle } from "lucide-react";
import { ClienteSistema, TipoPessoa, ClienteStatus } from "@/types/admin";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const ClientesPage = () => {
  const [clientes, setClientes] = useState<ClienteSistema[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [openNewModal, setOpenNewModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [currentCliente, setCurrentCliente] = useState<ClienteSistema | null>(null);
  
  // Form states
  const [formRazaoSocial, setFormRazaoSocial] = useState("");
  const [formCnpj, setFormCnpj] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formTelefone, setFormTelefone] = useState("");
  const [formResponsavel, setFormResponsavel] = useState("");
  const [formSituacao, setFormSituacao] = useState<ClienteStatus>("liberado");
  
  const navigate = useNavigate();

  // Fetch clients from Supabase
  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes_sistema')
        .select('*')
        .order('razao_social');

      if (error) throw error;
      
      // Map the Supabase data to match our ClienteSistema interface
      const mappedClientes: ClienteSistema[] = data?.map(item => ({
        id: item.id,
        razaoSocial: item.razao_social,
        nome: item.razao_social, // Alias for backward compatibility
        tipo: 'juridica' as TipoPessoa, // Default to juridica
        numeroEmpregados: 0, // Default value
        dataInclusao: Date.now(), // Default to current timestamp
        situacao: item.situacao as ClienteStatus,
        cnpj: item.cnpj,
        cpfCnpj: item.cnpj, // Alias for backward compatibility
        email: item.email || '',
        telefone: item.telefone || '',
        responsavel: item.responsavel || '',
        contato: item.responsavel, // Alias for backward compatibility
        planoId: item.plano_id || undefined,
        contratoId: item.contrato_id || undefined,
      })) || [];
      
      console.log("Clientes carregados:", mappedClientes);
      setClientes(mappedClientes);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast.error("Erro ao carregar clientes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleAddCliente = async () => {
    try {
      const newClient = {
        razao_social: formRazaoSocial,
        cnpj: formCnpj,
        email: formEmail,
        telefone: formTelefone,
        responsavel: formResponsavel,
        situacao: formSituacao
      };

      const { error } = await supabase
        .from('clientes_sistema')
        .insert([newClient]);

      if (error) throw error;

      toast.success("Cliente adicionado com sucesso!");
      setOpenNewModal(false);
      clearForm();
      fetchClientes();
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      toast.error("Erro ao adicionar cliente");
    }
  };

  const handleUpdateCliente = async () => {
    if (!currentCliente) return;

    try {
      const { error } = await supabase
        .from('clientes_sistema')
        .update({
          razao_social: formRazaoSocial,
          cnpj: formCnpj,
          email: formEmail,
          telefone: formTelefone,
          responsavel: formResponsavel,
          situacao: formSituacao
        })
        .eq('id', currentCliente.id);

      if (error) throw error;

      toast.success("Cliente atualizado com sucesso!");
      setOpenEditModal(false);
      clearForm();
      fetchClientes();
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      toast.error("Erro ao atualizar cliente");
    }
  };

  const handleDeleteCliente = async () => {
    if (!currentCliente) return;

    try {
      const { error } = await supabase
        .from('clientes_sistema')
        .delete()
        .eq('id', currentCliente.id);

      if (error) throw error;

      toast.success("Cliente excluído com sucesso!");
      setOpenDeleteModal(false);
      fetchClientes();
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      toast.error("Erro ao excluir cliente");
    }
  };

  const handleToggleStatus = async (cliente: ClienteSistema) => {
    try {
      const newStatus: ClienteStatus = cliente.situacao === 'liberado' ? 'bloqueado' : 'liberado';
      
      const { error } = await supabase
        .from('clientes_sistema')
        .update({ situacao: newStatus })
        .eq('id', cliente.id);

      if (error) throw error;

      toast.success(`Cliente ${newStatus === 'liberado' ? 'liberado' : 'bloqueado'} com sucesso!`);
      fetchClientes();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error("Erro ao atualizar status do cliente");
    }
  };

  const clearForm = () => {
    setFormRazaoSocial("");
    setFormCnpj("");
    setFormEmail("");
    setFormTelefone("");
    setFormResponsavel("");
    setFormSituacao("liberado");
  };

  const handleOpenEditModal = (cliente: ClienteSistema) => {
    setCurrentCliente(cliente);
    setFormRazaoSocial(cliente.razaoSocial);
    setFormCnpj(cliente.cnpj);
    setFormEmail(cliente.email || "");
    setFormTelefone(cliente.telefone || "");
    setFormResponsavel(cliente.responsavel || "");
    setFormSituacao(cliente.situacao);
    setOpenEditModal(true);
  };

  const handleOpenDeleteModal = (cliente: ClienteSistema) => {
    setCurrentCliente(cliente);
    setOpenDeleteModal(true);
  };

  const filteredClientes = clientes.filter(cliente => 
    cliente.razaoSocial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.cnpj?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout title="Clientes Sistema">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gerenciamento de Clientes Sistema</CardTitle>
              <CardDescription>
                Cadastre e gerencie os clientes que contratam o sistema
              </CardDescription>
            </div>
            <Dialog open={openNewModal} onOpenChange={setOpenNewModal}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus size={16} />
                  Novo Cliente
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Cliente</DialogTitle>
                  <DialogDescription>
                    Preencha as informações do novo cliente.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="razaoSocial">Razão Social</Label>
                    <Input id="razaoSocial" value={formRazaoSocial} onChange={(e) => setFormRazaoSocial(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input id="cnpj" value={formCnpj} onChange={(e) => setFormCnpj(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input id="telefone" value={formTelefone} onChange={(e) => setFormTelefone(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="responsavel">Nome do Responsável</Label>
                    <Input id="responsavel" value={formResponsavel} onChange={(e) => setFormResponsavel(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="situacao">Situação</Label>
                    <Select 
                      value={formSituacao} 
                      onValueChange={(value: ClienteStatus) => setFormSituacao(value)}
                    >
                      <SelectTrigger id="situacao">
                        <SelectValue placeholder="Selecione a situação" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="liberado">Liberado</SelectItem>
                        <SelectItem value="bloqueado">Bloqueado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenNewModal(false)}>Cancelar</Button>
                  <Button onClick={handleAddCliente}>Salvar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="pt-4">
            <Input
              placeholder="Buscar cliente por razão social ou CNPJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xl"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Razão Social</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                    Carregando clientes...
                  </TableCell>
                </TableRow>
              ) : filteredClientes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredClientes.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell className="font-medium">{cliente.razaoSocial}</TableCell>
                    <TableCell>{cliente.cnpj}</TableCell>
                    <TableCell>{cliente.email}</TableCell>
                    <TableCell>{cliente.telefone}</TableCell>
                    <TableCell>{cliente.responsavel}</TableCell>
                    <TableCell>
                      <Badge variant={cliente.situacao === "liberado" ? "default" : "destructive"}>
                        {cliente.situacao === "liberado" ? "Liberado" : "Bloqueado"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(cliente)}
                          title={cliente.situacao === 'liberado' ? 'Bloquear Acesso' : 'Liberar Acesso'}
                        >
                          {cliente.situacao === 'liberado' ? 
                            <Lock size={16} /> : 
                            <Unlock size={16} />
                          }
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleOpenEditModal(cliente)}
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleOpenDeleteModal(cliente)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={openEditModal} onOpenChange={setOpenEditModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Atualize as informações do cliente.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-razaoSocial">Razão Social</Label>
              <Input id="edit-razaoSocial" value={formRazaoSocial} onChange={(e) => setFormRazaoSocial(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cnpj">CNPJ</Label>
              <Input id="edit-cnpj" value={formCnpj} onChange={(e) => setFormCnpj(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-telefone">Telefone</Label>
              <Input id="edit-telefone" value={formTelefone} onChange={(e) => setFormTelefone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-responsavel">Nome do Responsável</Label>
              <Input id="edit-responsavel" value={formResponsavel} onChange={(e) => setFormResponsavel(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-situacao">Situação</Label>
              <Select 
                value={formSituacao} 
                onValueChange={(value: ClienteStatus) => setFormSituacao(value)}
              >
                <SelectTrigger id="edit-situacao">
                  <SelectValue placeholder="Selecione a situação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="liberado">Liberado</SelectItem>
                  <SelectItem value="bloqueado">Bloqueado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEditModal(false)}>Cancelar</Button>
            <Button onClick={handleUpdateCliente}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Você está prestes a excluir o cliente "{currentCliente?.razaoSocial}". Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDeleteModal(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteCliente}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default ClientesPage;
