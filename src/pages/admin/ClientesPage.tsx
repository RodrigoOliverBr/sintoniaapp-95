
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
import { Pencil, Trash2, Plus, LogIn, Ban, AlertCircle } from "lucide-react";
import { ClienteSistema, TipoPessoa, ClienteStatus, StatusContrato } from "@/types/admin";
import { toast } from "sonner";
import { ClienteForm } from "@/components/admin/ClienteForm";
import { getContratosByClienteSistemaId } from "@/services/adminService";

// Interface para representar o cliente com informações do contrato
interface ClienteComContrato extends ClienteSistema {
  statusContrato?: StatusContrato | 'vencimento-proximo' | 'sem-contrato';
  diasParaVencimento?: number;
}

const ClientesPage = () => {
  const [clientes, setClientes] = useState<ClienteComContrato[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [openNewModal, setOpenNewModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openBlockModal, setOpenBlockModal] = useState(false);
  const [currentCliente, setCurrentCliente] = useState<ClienteSistema | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const navigate = useNavigate();

  // Verificar se o usuário atual é admin
  const checkIsAdmin = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return false;
      
      const { data } = await supabase
        .from('perfis')
        .select('tipo')
        .eq('id', session.session.user.id)
        .single();
      
      return data?.tipo === 'admin';
    } catch (error) {
      return false;
    }
  };

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
      
      // Obter status do contrato para cada cliente
      const clientesComContrato: ClienteComContrato[] = await Promise.all(
        mappedClientes.map(async (cliente) => {
          const contratos = getContratosByClienteSistemaId(cliente.id);
          
          // Se não tem contratos, define como 'sem-contrato'
          if (!contratos || contratos.length === 0) {
            return {
              ...cliente,
              statusContrato: 'sem-contrato',
              situacao: cliente.situacao === 'bloqueado-manualmente' ? 'bloqueado-manualmente' : 'sem-contrato'
            };
          }
          
          // Verificar se há mais de um contrato ativo
          const contratosAtivos = contratos.filter(c => c.status === 'ativo');
          
          // Pega o contrato mais recente (assumindo que é o ativo)
          const contratoAtivo = contratosAtivos[0];
          
          if (contratoAtivo) {
            // Verificar se está próximo ao vencimento (45 dias)
            const hoje = new Date();
            const dataVencimento = new Date(contratoAtivo.dataFim);
            const diasParaVencimento = Math.ceil((dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
            
            // Atualizar situação do cliente com base no status do contrato
            // A menos que esteja 'bloqueado-manualmente'
            let situacaoAtualizada = cliente.situacao;
            if (cliente.situacao !== 'bloqueado-manualmente') {
              situacaoAtualizada = contratoAtivo.status as ClienteStatus;
            }
            
            if (diasParaVencimento <= 45 && diasParaVencimento > 0) {
              return {
                ...cliente,
                situacao: situacaoAtualizada,
                statusContrato: 'vencimento-proximo',
                diasParaVencimento
              };
            }
            
            return {
              ...cliente,
              situacao: situacaoAtualizada,
              statusContrato: contratoAtivo.status as StatusContrato
            };
          }
          
          // Se tem contrato mas nenhum ativo, pega o status do mais recente
          const contratoMaisRecente = contratos.sort((a, b) => 
            new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime()
          )[0];
          
          // Atualizar situação do cliente para refletir o status do contrato mais recente
          // A menos que esteja 'bloqueado-manualmente'
          let situacaoAtualizada = cliente.situacao;
          if (cliente.situacao !== 'bloqueado-manualmente') {
            if (contratoMaisRecente.status === 'cancelado') {
              situacaoAtualizada = 'sem-contrato';
            } else {
              situacaoAtualizada = contratoMaisRecente.status as ClienteStatus;
            }
          }
          
          return {
            ...cliente,
            situacao: situacaoAtualizada,
            statusContrato: contratoMaisRecente.status as StatusContrato
          };
        })
      );
      
      console.log("Clientes carregados com informações de contrato:", clientesComContrato);
      setClientes(clientesComContrato);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast.error("Erro ao carregar clientes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
    checkIsAdmin().then(admin => setIsAdmin(admin));
  }, []);

  const handleError = (error: any, defaultMessage: string) => {
    console.error(`${defaultMessage}:`, error);
    
    if (error.message?.includes('48 seconds')) {
      return 'Por segurança, tente novamente após 48 segundos.';
    } 
    if (error.message?.includes('row-level security policy')) {
      return 'Erro de permissão nas políticas de segurança do banco de dados. Contate o administrador.';
    }
    if (error.message?.includes('duplicate key')) {
      return 'Este registro já existe no sistema.';
    }
    
    if (error.message) {
      return error.message;
    }
    
    return defaultMessage;
  };

  const handleAddCliente = async (formData: any) => {
    try {
      setIsLoading(true);
      
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
      
      const { error: profileError } = await supabase
        .from('perfis')
        .insert({
          id: authData.user.id,
          nome: formData.responsavel,
          email: formData.email,
          tipo: 'client'
        });

      if (profileError) {
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw new Error(handleError(profileError, 'Erro ao criar perfil'));
      }

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

  const handleBlockCliente = async () => {
    if (!currentCliente) return;

    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('clientes_sistema')
        .update({
          situacao: 'bloqueado-manualmente'
        })
        .eq('id', currentCliente.id);

      if (error) {
        throw new Error(handleError(error, 'Erro ao bloquear cliente'));
      }

      toast.success("Cliente bloqueado com sucesso!");
      setOpenBlockModal(false);
      fetchClientes();
    } catch (error: any) {
      toast.error(error.message || "Erro ao bloquear cliente");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEditModal = (cliente: ClienteSistema) => {
    setCurrentCliente(cliente);
    setOpenEditModal(true);
  };

  const handleOpenDeleteModal = (cliente: ClienteSistema) => {
    setCurrentCliente(cliente);
    setOpenDeleteModal(true);
  };

  const handleOpenBlockModal = (cliente: ClienteSistema) => {
    setCurrentCliente(cliente);
    setOpenBlockModal(true);
  };

  const handleLoginAsClient = async (cliente: ClienteSistema) => {
    try {
      // Implementação futura para impersonação de cliente
      // Esta é uma funcionalidade avançada que precisará ser implementada
      toast.success(`Acessando como cliente: ${cliente.razaoSocial}`);
      // Aqui você pode armazenar o ID do cliente em localStorage/sessionStorage
      // e redirecionar para a área do cliente
    } catch (error) {
      toast.error("Erro ao acessar como cliente");
    }
  };

  // Helper para renderizar o badge de status baseado no contrato
  const renderStatusBadge = (cliente: ClienteComContrato) => {
    switch (cliente.situacao) {
      case 'ativo':
        return <Badge variant="default">Ativo</Badge>;
      case 'em-analise':
        return <Badge variant="secondary">Em análise</Badge>;
      case 'bloqueado-manualmente':
        return <Badge variant="destructive">Bloqueado Manualmente</Badge>;
      case 'sem-contrato':
        return <Badge variant="outline">Sem contrato</Badge>;
      default:
        if (cliente.statusContrato === 'vencimento-proximo') {
          return <Badge variant="warning" className="bg-yellow-500 hover:bg-yellow-600">
            Vencimento em {cliente.diasParaVencimento} dias
          </Badge>;
        }
        return <Badge variant={cliente.situacao === "liberado" ? "default" : "destructive"}>
          {cliente.situacao === "liberado" ? "Liberado" : "Bloqueado"}
        </Badge>;
    }
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
                      {renderStatusBadge(cliente)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {isAdmin && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => handleLoginAsClient(cliente)}
                          >
                            <LogIn size={14} />
                            Acessar
                          </Button>
                        )}
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center gap-1 text-red-500 hover:text-red-700"
                          onClick={() => handleOpenBlockModal(cliente)}
                          disabled={cliente.situacao === 'bloqueado-manualmente'}
                        >
                          <Ban size={14} />
                          Bloquear
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
      
      <Dialog open={openBlockModal} onOpenChange={setOpenBlockModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar bloqueio</DialogTitle>
            <DialogDescription>
              Você está prestes a bloquear manualmente o acesso do cliente "{currentCliente?.razaoSocial}". 
              O cliente não poderá acessar o sistema após esta ação.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-4">
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <AlertCircle size={20} className="text-yellow-600" />
              <p className="text-sm text-yellow-700">
                Este bloqueio é manual e não será alterado automaticamente pela situação do contrato.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setOpenBlockModal(false)}
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleBlockCliente}
                disabled={isLoading}
              >
                {isLoading ? 'Bloqueando...' : 'Bloquear Cliente'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default ClientesPage;
