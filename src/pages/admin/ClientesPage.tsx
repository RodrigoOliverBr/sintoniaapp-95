import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Plus, Lock, Unlock } from "lucide-react";
import { ClienteSistema, TipoPessoa, ClienteStatus } from "@/types/admin";
import { toast } from "sonner";
import { ClienteForm } from "@/components/admin/ClienteForm";

const ClientesPage = () => {
  const [clientes, setClientes] = useState<ClienteSistema[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [openNewModal, setOpenNewModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [currentCliente, setCurrentCliente] = useState<ClienteSistema | null>(null);
  
  const [formRazaoSocial, setFormRazaoSocial] = useState("");
  const [formCnpj, setFormCnpj] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formTelefone, setFormTelefone] = useState("");
  const [formResponsavel, setFormResponsavel] = useState("");
  const [formSituacao, setFormSituacao] = useState<ClienteStatus>("liberado");
  
  const navigate = useNavigate();

  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes_sistema')
        .select('*')
        .order('razao_social');

      if (error) throw error;
      
      const mappedClientes: ClienteSistema[] = data?.map(item => ({
        id: item.id,
        razaoSocial: item.razao_social,
        nome: item.razao_social,
        tipo: 'juridica' as TipoPessoa,
        numeroEmpregados: 0,
        dataInclusao: Date.now(),
        situacao: item.situacao as ClienteStatus,
        cnpj: item.cnpj,
        cpfCnpj: item.cnpj,
        email: item.email || '',
        telefone: item.telefone || '',
        responsavel: item.responsavel || '',
        contato: item.responsavel,
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

  const handleError = (error: any, defaultMessage: string) => {
    console.error(`${defaultMessage}:`, error);
    
    // Tratamento para erros específicos
    if (error.message?.includes('48 seconds')) {
      return 'Por segurança, tente novamente após 48 segundos.';
    } 
    if (error.message?.includes('row-level security policy')) {
      return 'Erro de permissão nas políticas de segurança do banco de dados. Contate o administrador.';
    }
    if (error.message?.includes('duplicate key')) {
      return 'Este registro já existe no sistema.';
    }
    
    // Se for um erro conhecido, exiba a mensagem dele
    if (error.message) {
      return error.message;
    }
    
    // Caso contrário, use a mensagem padrão
    return defaultMessage;
  };

  const handleAddCliente = async (formData: any) => {
    try {
      setIsLoading(true);
      
      // Criação do usuário na autenticação
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.senha,
        options: {
          data: {
            name: formData.responsavel,
          }
        }
      });

      if (authError) {
        throw new Error(handleError(authError, 'Erro na autenticação'));
      }
      
      if (!authData.user) {
        throw new Error('Falha ao criar usuário');
      }
      
      // Criação do perfil do usuário
      const { error: profileError } = await supabase
        .from('perfis')
        .insert({
          id: authData.user.id,
          nome: formData.responsavel,
          email: formData.email,
          tipo: 'cliente'
        });

      if (profileError) {
        // Tentar remover usuário se o perfil falhou
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw new Error(handleError(profileError, 'Erro ao criar perfil'));
      }

      // Criação do cliente no sistema
      const { error: clienteError } = await supabase
        .from('clientes_sistema')
        .insert({
          razao_social: formData.razao_social,
          cnpj: formData.cnpj,
          email: formData.email,
          telefone: formData.telefone,
          responsavel: formData.responsavel,
          situacao: formData.situacao
        });

      if (clienteError) {
        // Limpeza de dados se o cliente falhou
        await supabase.from('perfis').delete().eq('id', authData.user.id);
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw new Error(handleError(clienteError, 'Erro ao criar cliente'));
      }

      toast.success("Cliente adicionado com sucesso!");
      setOpenNewModal(false);
      fetchClientes();
    } catch (error: any) {
      toast.error(error.message || "Erro ao adicionar cliente");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCliente = async (formData: any) => {
    if (!currentCliente) return;

    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('clientes_sistema')
        .update({
          razao_social: formData.razao_social,
          cnpj: formData.cnpj,
          email: formData.email,
          telefone: formData.telefone || '',
          responsavel: formData.responsavel,
          situacao: formData.situacao
        })
        .eq('id', currentCliente.id);

      if (error) {
        throw new Error(handleError(error, 'Erro ao atualizar cliente'));
      }

      toast.success("Cliente atualizado com sucesso!");
      setOpenEditModal(false);
      fetchClientes();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar cliente");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCliente = async () => {
    if (!currentCliente) return;

    try {
      const { error } = await supabase
        .from('clientes_sistema')
        .delete()
        .eq('id', currentCliente.id);

      if (error) {
        throw new Error(handleError(error, 'Erro ao excluir cliente'));
      }

      toast.success("Cliente excluído com sucesso!");
      setOpenDeleteModal(false);
      fetchClientes();
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir cliente");
    }
  };

  const handleToggleStatus = async (cliente: ClienteSistema) => {
    try {
      const newStatus: ClienteStatus = cliente.situacao === 'liberado' ? 'bloqueado' : 'liberado';
      
      const { error } = await supabase
        .from('clientes_sistema')
        .update({ situacao: newStatus })
        .eq('id', cliente.id);

      if (error) {
        throw new Error(handleError(error, 'Erro ao atualizar status'));
      }

      toast.success(`Cliente ${newStatus === 'liberado' ? 'liberado' : 'bloqueado'} com sucesso!`);
      fetchClientes();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar status do cliente");
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
                <ClienteForm 
                  onSubmit={handleAddCliente}
                  isLoading={isLoading}
                />
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
          <ClienteForm 
            onSubmit={handleUpdateCliente}
            defaultValues={currentCliente ? {
              razao_social: currentCliente.razaoSocial,
              cnpj: currentCliente.cnpj,
              email: currentCliente.email,
              telefone: currentCliente.telefone || '',
              responsavel: currentCliente.responsavel,
              situacao: currentCliente.situacao
            } : undefined}
            isLoading={isLoading}
            isEditing={true}
          />
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
          <div className="flex justify-end gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setOpenDeleteModal(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteCliente}
              disabled={isLoading}
            >
              {isLoading ? 'Excluindo...' : 'Excluir'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default ClientesPage;
