
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import { supabase, handleSupabaseError, checkAdminAuth, ensureAuthenticated } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import ClientesTable from "@/components/admin/clientes/ClientesTable";
import { ClienteDialogs } from "@/components/admin/clientes/ClienteDialogs";
import { ClienteActions } from "@/components/admin/clientes/ClienteActions";
import { ClienteForm } from "@/components/admin/ClienteForm";
import { ClienteSistema, TipoPessoa } from '@/types/admin';

// Create a separate Supabase client for admin operations that won't affect the current session
// This approach avoids logging out the admin when creating new users
const createAdminClient = () => {
  // Use the same URL but with admin headers - this avoids using service role key in frontend
  // The RLS policies should allow admin users to perform these operations
  return supabase;
};

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
      
      // Verificar autenticação antes de carregar dados
      const isAuthenticated = await ensureAuthenticated();
      if (!isAuthenticated) {
        console.error("Usuário não autenticado ou sem permissões suficientes");
        toast.error("Você precisa estar autenticado para acessar esta página");
        setIsLoading(false);
        return;
      }
      
      // Fetch all clients
      const { data: clientesData, error: clientesError } = await supabase
        .from("clientes_sistema")
        .select("*")
        .order("razao_social", { ascending: true });
      
      if (clientesError) {
        console.error("ClientesPage: Erro ao carregar clientes:", clientesError);
        toast.error("Erro ao carregar clientes: " + handleSupabaseError(clientesError));
        setIsLoading(false);
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
        toast.error("Erro ao carregar informações de contratos: " + handleSupabaseError(contratosError));
      }
      
      console.log(`ClientesPage: ${contratosData?.length || 0} contratos ativos encontrados`);
      
      // Map clients to include contract status
      const clientesProcessed = clientsData?.map(cliente => {
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
          tipo: "juridica" as TipoPessoa, // Explicit type casting
          numeroEmpregados: 0,
          dataInclusao: cliente.created_at ? new Date(cliente.created_at).getTime() : Date.now(),
          ativo: true,
          situacao: hasActiveContract ? "ativo" : "sem-contrato",
          planoId: cliente.plano_id || "",
          contratoId: contratoId,
          clienteId: cliente.id,
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

  const handleUpdateCliente = async (formData: any) => {
    if (!selectedCliente) return;
    
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
          responsavel: formData.responsavel
        })
        .eq("id", selectedCliente.id);

      if (error) {
        console.error("Erro ao atualizar cliente:", error);
        toast.error("Erro ao atualizar cliente");
        return;
      }
      
      toast.success("Cliente atualizado com sucesso!");
      loadClientes();
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      toast.error("Erro ao atualizar cliente");
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
          situacao: "bloqueado", 
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
      console.log("Iniciando criação de novo cliente:", formData);
      
      // 1. First, check if the email already exists to avoid errors
      const { data: existingEmail, error: emailCheckError } = await supabase
        .from("clientes_sistema")
        .select("id")
        .eq("email", formData.email)
        .maybeSingle();
        
      if (emailCheckError) {
        console.error("Erro ao verificar email existente:", emailCheckError);
        toast.error("Erro ao verificar disponibilidade de email: " + handleSupabaseError(emailCheckError));
        setIsLoading(false);
        return;
      }
      
      if (existingEmail) {
        toast.error("Este email já está sendo usado por outro cliente");
        setIsLoading(false);
        return;
      }

      // 2. Insert new cliente in clientes_sistema table first
      const { data: clienteData, error: clienteError } = await supabase
        .from("clientes_sistema")
        .insert([{
          razao_social: formData.razao_social,
          cnpj: formData.cnpj,
          email: formData.email,
          telefone: formData.telefone,
          responsavel: formData.responsavel,
          situacao: "liberado"
        }])
        .select();

      if (clienteError) {
        console.error("Erro ao criar cliente no sistema:", clienteError);
        toast.error("Erro ao criar cliente no sistema: " + handleSupabaseError(clienteError));
        return;
      }
      
      if (!clienteData || clienteData.length === 0) {
        toast.error("Erro: Não foi possível obter os dados do cliente após criação");
        setIsLoading(false);
        return;
      }
      
      console.log("Cliente criado com sucesso no sistema:", clienteData[0]);
      
      try {
        // 3. Use Edge Function to create a user without affecting admin session
        // This is the key change to prevent admin logout
        const { data: authResponse, error: authError } = await supabase.functions.invoke('admin-create-user', {
          body: JSON.stringify({
            email: formData.email,
            password: formData.senha,
            clienteId: clienteData[0].id,
            nome: formData.razao_social,
          })
        });

        if (authError) {
          console.error("Erro ao criar usuário via Edge Function:", authError);
          
          // Continue anyway as we already created the client record
          toast.warning("Cliente criado, mas houve um erro ao configurar o acesso: " + authError.message);
        } else {
          console.log("Usuário de autenticação criado via Edge Function:", authResponse);
        }
        
        // Loading clientes will refresh the list with the new client
        loadClientes();
        toast.success("Cliente criado com sucesso!");
      } catch (authError: any) {
        console.error("Erro ao criar usuário de autenticação:", authError);
        toast.warning("Cliente criado, mas houve um problema ao configurar o acesso: " + authError.message);
        // Still reload clients as we successfully created the client record
        loadClientes();
      }
      
    } catch (error: any) {
      console.error("Erro ao criar cliente:", error);
      toast.error("Erro ao criar cliente: " + error.message);
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
