
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { ClienteSistema, ClienteComContrato, ClienteStatus, TipoPessoa, StatusContrato } from "@/types/admin";
import { toast } from "sonner";
import { ClienteForm } from "@/components/admin/ClienteForm";
import { ClientesTable } from "@/components/admin/clientes/ClientesTable";
import { ClienteDialogs } from "@/components/admin/clientes/ClienteDialogs";

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

  const fetchContratos = async () => {
    try {
      const { data, error } = await supabase
        .from('contratos')
        .select('*');
        
      if (error) {
        console.error("Erro ao buscar contratos:", error);
        return [];
      }
      
      return data.map(contrato => ({
        id: contrato.id,
        numero: contrato.numero,
        clienteSistemaId: contrato.cliente_sistema_id || contrato.cliente_id,
        clienteId: contrato.cliente_id,
        planoId: contrato.plano_id,
        dataInicio: new Date(contrato.data_inicio).getTime(),
        dataFim: new Date(contrato.data_fim).getTime(),
        dataPrimeiroVencimento: new Date(contrato.data_primeiro_vencimento).getTime(),
        valorMensal: Number(contrato.valor_mensal),
        status: contrato.status,
        taxaImplantacao: Number(contrato.taxa_implantacao),
        observacoes: contrato.observacoes || '',
        cicloFaturamento: contrato.ciclo_faturamento,
        proximaRenovacao: contrato.proxima_renovacao ? new Date(contrato.proxima_renovacao).getTime() : undefined,
        ciclosGerados: contrato.ciclos_gerados || 0
      }));
    } catch (error) {
      console.error("Erro ao buscar contratos:", error);
      return [];
    }
  };

  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes_sistema')
        .select('*')
        .order('razao_social');

      if (error) throw error;
      
      const transformedClientes: ClienteSistema[] = data.map(item => ({
        id: item.id,
        razao_social: item.razao_social,
        razaoSocial: item.razao_social,
        nome: item.razao_social, // Using razao_social as nome
        tipo: 'juridica' as TipoPessoa, // Default to 'juridica'
        numeroEmpregados: 0, // Default value
        dataInclusao: item.created_at ? new Date(item.created_at).getTime() : Date.now(),
        situacao: item.situacao as ClienteStatus,
        cnpj: item.cnpj || '',
        cpfCnpj: item.cnpj || '',
        email: item.email || '',
        telefone: item.telefone || '',
        responsavel: item.responsavel || '',
        contato: item.responsavel || '', // Using responsavel as contato
        planoId: item.plano_id || '',
        contratoId: item.contrato_id || '',
      }));
      
      const contratos = await fetchContratos();
      console.log("Contratos obtidos:", contratos);
      
      const clientesComContrato: ClienteComContrato[] = transformedClientes.map(cliente => {
        const contratosDoCliente = contratos.filter(c => 
          c.clienteSistemaId === cliente.id || c.clienteId === cliente.id
        );
        
        console.log(`Contratos para cliente ${cliente.razaoSocial}:`, contratosDoCliente);
        
        if (!contratosDoCliente || contratosDoCliente.length === 0) {
          return {
            ...cliente,
            statusContrato: 'sem-contrato',
            situacao: cliente.situacao === 'bloqueado-manualmente' ? 'bloqueado-manualmente' : 'sem-contrato'
          };
        }
        
        const contratosAtivos = contratosDoCliente.filter(c => c.status === 'ativo');
        
        const contratoAtivo = contratosAtivos.length > 0 ? contratosAtivos[0] : null;
        
        if (contratoAtivo) {
          const hoje = new Date();
          const dataVencimento = new Date(contratoAtivo.dataFim);
          const diasParaVencimento = Math.ceil((dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
          
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
        
        const contratoMaisRecente = contratosDoCliente.sort((a, b) => 
          new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime()
        )[0];
        
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
      });
      
      console.log("Clientes carregados com informações de contrato:", clientesComContrato);
      setClientes(clientesComContrato);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast.error("Erro ao carregar clientes");
    } finally {
      setIsLoading(false);
    }
  };

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
    if (error.message?.includes('is_main_user')) {
      return 'Erro na estrutura do banco de dados: a coluna "is_main_user" não foi encontrada. Contate o administrador.';
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
            name: formData.responsavel
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
        try {
          await supabase.auth.admin.deleteUser(authData.user.id);
        } catch (cleanupError) {
          console.error("Erro ao limpar usuário após falha:", cleanupError);
        }
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
          situacao: 'sem-contrato' as ClienteStatus
        });

      if (clienteError) {
        try {
          await supabase.from('perfis').delete().eq('id', authData.user.id);
          await supabase.auth.admin.deleteUser(authData.user.id);
        } catch (cleanupError) {
          console.error("Erro ao limpar dados após falha:", cleanupError);
        }
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
          responsavel: formData.responsavel
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
      sessionStorage.setItem('impersonatedClientId', cliente.id);
      sessionStorage.setItem('impersonatedClientName', cliente.razaoSocial);
      
      toast.success(`Acessando como cliente: ${cliente.razaoSocial}`);
      navigate('/');
    } catch (error) {
      toast.error("Erro ao acessar como cliente");
    }
  };

  useEffect(() => {
    fetchClientes();
    checkIsAdmin().then(admin => setIsAdmin(admin));
  }, []);

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
          <ClientesTable 
            clientes={filteredClientes}
            isLoading={isLoading}
            isAdmin={isAdmin}
            onLoginAsClient={handleLoginAsClient}
            onOpenBlockModal={handleOpenBlockModal}
            onOpenEditModal={handleOpenEditModal}
            onOpenDeleteModal={handleOpenDeleteModal}
          />
        </CardContent>
      </Card>
      
      <ClienteDialogs 
        openEditModal={openEditModal}
        setOpenEditModal={setOpenEditModal}
        openDeleteModal={openDeleteModal}
        setOpenDeleteModal={setOpenDeleteModal}
        openBlockModal={openBlockModal}
        setOpenBlockModal={setOpenBlockModal}
        currentCliente={currentCliente}
        isLoading={isLoading}
        onUpdateCliente={handleUpdateCliente}
        onDeleteCliente={handleDeleteCliente}
        onBlockCliente={handleBlockCliente}
      />
    </AdminLayout>
  );
};

export default ClientesPage;
