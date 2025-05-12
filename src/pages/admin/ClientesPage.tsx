import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
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
      // Primeiro, criar o usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.senha,
      });

      if (authError) {
        console.error("Erro ao criar usuário:", authError);
        toast.error("Erro ao criar usuário");
        return;
      }

      if (!authData.user) {
        console.error("Usuário não foi criado corretamente");
        toast.error("Erro ao criar usuário");
        return;
      }

      // Inserir o cliente no Supabase
      const { data: clienteData, error: clienteError } = await supabase
        .from("clientes_sistema")
        .insert([{
          id: authData.user.id, // Usar o mesmo ID do usuário criado
          razao_social: formData.razao_social,
          cnpj: formData.cnpj,
          email: formData.email,
          telefone: formData.telefone,
          responsavel: formData.responsavel,
          senha: formData.senha,
          situacao: "liberado" // Definir status inicial como liberado
        }])
        .select()
        .single();

      if (clienteError) {
        console.error("Erro ao criar cliente:", clienteError);
        // Se falhar, tentar remover o usuário criado
        await supabase.auth.admin.deleteUser(authData.user.id);
        toast.error("Erro ao criar cliente");
        return;
      }

      // Criar o perfil do usuário
      const { error: perfilError } = await supabase
        .from("perfis")
        .insert([{
          id: authData.user.id,
          nome: formData.responsavel || formData.razao_social,
          email: formData.email,
          telefone: formData.telefone,
          tipo: "client"
        }]);

      if (perfilError) {
        console.error("Erro ao criar perfil:", perfilError);
        // Se falhar, tentar remover o usuário e o cliente criados
        await supabase.auth.admin.deleteUser(authData.user.id);
        await supabase.from("clientes_sistema").delete().eq("id", authData.user.id);
        toast.error("Erro ao criar perfil do usuário");
        return;
      }
      
      toast.success("Cliente criado com sucesso!");
      loadClientes();
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      toast.error("Erro ao criar cliente");
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
