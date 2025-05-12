import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import { supabase, handleSupabaseError } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import ClientesTable from "@/components/admin/clientes/ClientesTable";
import { ClienteDialogs } from "@/components/admin/clientes/ClienteDialogs";
import { ClienteActions } from "@/components/admin/clientes/ClienteActions";
import { ClienteForm } from "@/components/admin/ClienteForm";
import { ClienteSistema } from "@/types/admin";

const ClientesPage: React.FC = () => {
  const [clientes, setClientes] = useState<ClienteSistema[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [openNewModal, setOpenNewModal] = useState<boolean>(false);
  const [openEditModal, setOpenEditModal] = useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [openBlockModal, setOpenBlockModal] = useState<boolean>(false);
  const [selectedCliente, setSelectedCliente] = useState<ClienteSistema | null>(null);

  const loadClientes = async () => {
    setIsLoading(true);
    try {
      console.log("ClientesPage: Iniciando carregamento de clientes...");
      
      // Fetch all clients
      const { data: clientesData, error: clientesError } = await supabase
        .from("clientes_sistema")
        .select("*")
        .order("razao_social", { ascending: true });
      
      if (clientesError) {
        console.error("ClientesPage: Erro ao carregar clientes:", clientesError);
        toast.error("Erro ao carregar clientes");
        return;
      }
      
      console.log(`ClientesPage: ${clientesData?.length || 0} clientes carregados`);
      
      // Fetch active contracts for all clients
      const { data: contratosData, error: contratosError } = await supabase
        .from("contratos")
        .select("cliente_sistema_id, status")
        .eq("status", "ativo");
        
      if (contratosError) {
        console.error("ClientesPage: Erro ao carregar contratos:", contratosError);
        toast.error("Erro ao carregar informações de contratos");
      }
      
      console.log(`ClientesPage: ${contratosData?.length || 0} contratos ativos encontrados`);
      
      // Map clients to include contract status
      const clientesProcessed = clientesData?.map(cliente => {
        // Check if client has active contracts
        const hasActiveContract = contratosData?.some(
          contrato => contrato.cliente_sistema_id === cliente.id && contrato.status === "ativo"
        );
        
        const contratoId = "";
        
        console.log(`Cliente ${cliente.razao_social}: ${hasActiveContract ? 'Com contrato ativo' : 'Sem contrato ativo'}`);
        
        return {
          id: cliente.id,
          nome: cliente.razao_social,
          razao_social: cliente.razao_social,
          razaoSocial: cliente.razao_social,
          cnpj: cliente.cnpj,
          cpfCnpj: cliente.cnpj,
          email: cliente.email || "",
          telefone: cliente.telefone || "",
          responsavel: cliente.responsavel || "",
          contato: cliente.responsavel || "",
          tipo: "cliente",
          numeroEmpregados: 0,
          dataInclusao: cliente.created_at ? new Date(cliente.created_at).getTime() : Date.now(),
          ativo: true,
          situacao: hasActiveContract ? "ativo" : "sem-contrato",
          planoId: cliente.plano_id || "",
          contratoId: contratoId,
          statusContrato: hasActiveContract ? "ativo" : "sem-contrato"
        } as ClienteSistema;
      }) || [];
      
      console.log("Clientes carregados com informações de contrato:", clientesProcessed);
      setClientes(clientesProcessed);
    } catch (error) {
      console.error("ClientesPage: Erro inesperado ao carregar clientes:", error);
      toast.error("Erro inesperado ao carregar clientes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClientes();
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleOpenNew = () => {
    setOpenNewModal(true);
  };

  const handleOpenEdit = (cliente: ClienteSistema) => {
    setSelectedCliente(cliente);
    setOpenEditModal(true);
  };

  const handleOpenDelete = (cliente: ClienteSistema) => {
    setSelectedCliente(cliente);
    setOpenDeleteModal(true);
  };
  
  const handleOpenBlock = (cliente: ClienteSistema) => {
    setSelectedCliente(cliente);
    setOpenBlockModal(true);
  };

  const handleUpdateCliente = async (formData: any): Promise<void> => {
    if (!selectedCliente) return Promise.resolve();
    
    setIsLoading(true);
    try {
      // Update the cliente in Supabase
      const { error } = await supabase
        .from("clientes_sistema")
        .update({
          razao_social: formData.razao_social,
          cnpj: formData.cnpj,
          email: formData.email,
          telefone: formData.telefone,
          responsavel: formData.responsavel,
          senha: formData.senha // Include senha field when updating
        })
        .eq("id", selectedCliente.id);

      if (error) {
        console.error("Erro ao atualizar cliente:", error);
        toast.error("Erro ao atualizar cliente");
        return Promise.reject(error);
      }
      
      toast.success("Cliente atualizado com sucesso!");
      await loadClientes();
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      toast.error("Erro ao atualizar cliente");
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
      setOpenEditModal(false);
    }
  };

  const handleDeleteCliente = async () => {
    if (!selectedCliente) return;
    
    setIsLoading(true);
    try {
      // Delete the cliente from Supabase
      const { error } = await supabase
        .from("clientes_sistema")
        .delete()
        .eq("id", selectedCliente.id);

      if (error) {
        console.error("Erro ao excluir cliente:", error);
        toast.error("Erro ao excluir cliente");
        return;
      }
      
      toast.success("Cliente excluído com sucesso!");
      loadClientes();
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
      toast.error("Erro ao excluir cliente");
    } finally {
      setIsLoading(false);
      setOpenDeleteModal(false);
    }
  };
  
  const handleBlockCliente = async () => {
    if (!selectedCliente) return;
    
    setIsLoading(true);
    try {
      // Since bloqueado isn't a column in the database schema, we'll use situacao
      const { error } = await supabase
        .from("clientes_sistema")
        .update({
          situacao: "bloqueado", // Assuming 'bloqueado' is a valid value for situacao
        })
        .eq("id", selectedCliente.id);

      if (error) {
        console.error("Erro ao bloquear cliente:", error);
        toast.error("Erro ao bloquear cliente");
        return;
      }
      
      toast.success("Cliente bloqueado com sucesso!");
      loadClientes();
    } catch (error) {
      console.error("Erro ao bloquear cliente:", error);
      toast.error("Erro ao bloquear cliente");
    } finally {
      setIsLoading(false);
      setOpenBlockModal(false);
    }
  };
  
  const handleCreateNew = async (formData: any) => {
    setIsLoading(true);
    try {
      console.log("Criando novo cliente com dados:", formData);

      // 1. Primeiro, criamos o usuário no sistema de auth do Supabase
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.senha,
        email_confirm: true // Auto-confirmar o email para facilitar o primeiro login
      });

      if (authError) {
        console.error("Erro ao criar usuário na autenticação:", authError);
        toast.error(`Erro ao criar usuário: ${handleSupabaseError(authError)}`);
        return;
      }

      console.log("Usuário criado na autenticação:", authData);
      const userId = authData.user.id;

      // 2. Inserimos o registro na tabela perfis
      const { error: perfilError } = await supabase
        .from("perfis")
        .insert([{
          id: userId, // Usamos o ID gerado pelo auth
          email: formData.email,
          nome: formData.razao_social,
          tipo: "client" // Tipo fixo para clientes do sistema
        }]);

      if (perfilError) {
        console.error("Erro ao criar perfil:", perfilError);
        
        // Se falhar, tentamos reverter a criação do usuário de auth
        await supabase.auth.admin.deleteUser(userId);
        
        toast.error(`Erro ao criar perfil: ${handleSupabaseError(perfilError)}`);
        return;
      }

      // 3. Por fim, criamos o registro do cliente usando o mesmo ID
      const { data: clienteData, error: clienteError } = await supabase
        .from("clientes_sistema")
        .insert([{
          id: userId, // Usamos o mesmo ID
          razao_social: formData.razao_social,
          cnpj: formData.cnpj,
          email: formData.email,
          telefone: formData.telefone,
          responsavel: formData.responsavel,
          senha: formData.senha,
          situacao: "liberado" // Status inicial padrão
        }])
        .select();

      if (clienteError) {
        console.error("Erro ao criar cliente:", clienteError);
        
        // Se falhar, tentamos reverter as operações anteriores
        await supabase.auth.admin.deleteUser(userId);
        await supabase.from("perfis").delete().eq("id", userId);
        
        toast.error(`Erro ao criar cliente: ${handleSupabaseError(clienteError)}`);
        return;
      }
      
      toast.success("Cliente criado com sucesso!");
      console.log("Cliente criado com sucesso:", clienteData);
      loadClientes();
    } catch (error) {
      console.error("Erro inesperado ao criar cliente:", error);
      toast.error(`Erro inesperado ao criar cliente: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
      setOpenNewModal(false);
    }
  };

  return (
    <AdminLayout title="Clientes">
      <Card>
        <CardHeader>
          <ClienteActions
            onSearch={handleSearch}
            searchTerm={searchTerm}
            onNew={handleOpenNew}
          />
        </CardHeader>
        <CardContent>
          <ClientesTable
            clientes={clientes.filter(cliente =>
              cliente.razao_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
              cliente.cnpj.toLowerCase().includes(searchTerm.toLowerCase())
            )}
            isLoading={isLoading}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
            onBlock={handleOpenBlock}
          />
        </CardContent>
      </Card>

      {/* Use the unified ClienteDialogs component */}
      <ClienteDialogs
        openEditModal={openEditModal}
        setOpenEditModal={setOpenEditModal}
        openDeleteModal={openDeleteModal}
        setOpenDeleteModal={setOpenDeleteModal}
        openBlockModal={openBlockModal}
        setOpenBlockModal={setOpenBlockModal}
        currentCliente={selectedCliente}
        isLoading={isLoading}
        onUpdateCliente={handleUpdateCliente}
        onDeleteCliente={handleDeleteCliente}
        onBlockCliente={handleBlockCliente}
      />
      
      {/* Handle New Client Dialog separately for now */}
      <Dialog open={openNewModal} onOpenChange={setOpenNewModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Novo Cliente</DialogTitle>
            <DialogDescription>
              Preencha os dados para cadastrar um novo cliente.
            </DialogDescription>
          </DialogHeader>
          <ClienteForm 
            onSubmit={handleCreateNew}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default ClientesPage;
