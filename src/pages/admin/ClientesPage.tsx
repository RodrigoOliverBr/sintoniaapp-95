
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
import { ClienteSistema, ClienteStatus } from "@/types/cliente";

// Create a type for the client form data that includes password
interface ClienteFormData extends Partial<ClienteSistema> {
  senha?: string;
}

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
          tipo: "juridica",
          numeroEmpregados: 0,
          dataInclusao: cliente.created_at ? new Date(cliente.created_at).getTime() : Date.now(),
          situacao: (hasActiveContract ? "ativo" : "sem-contrato") as ClienteStatus,
          planoId: cliente.plano_id || "",
          contratoId: contratoId,
          clienteId: "",
          statusContrato: hasActiveContract ? "ativo" : "sem-contrato",
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
  
  const handleCreateNew = async (formData: ClienteFormData) => {
    setIsLoading(true);
    try {
      console.log("Criando novo cliente com dados:", { 
        ...formData, 
        senha: formData.senha ? "[SENHA FORNECIDA]" : "[SEM SENHA]" 
      });
      
      if (!formData.senha) {
        toast.error("É necessário fornecer uma senha para o cliente.");
        setIsLoading(false);
        return;
      }
      
      // 1. Primeiro criamos o cliente no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email || '',
        password: formData.senha,
        options: {
          data: {
            full_name: formData.razao_social,
          }
        }
      });
      
      if (authError) {
        console.error("Erro ao criar usuário:", authError);
        throw new Error(`Erro ao criar usuário: ${authError.message}`);
      }
      
      if (!authData.user) {
        throw new Error("Falha ao criar o usuário. Nenhum usuário retornado.");
      }
      
      console.log("Usuário criado com ID:", authData.user.id);
      
      // 2. Criamos o perfil do cliente
      const { error: perfilError } = await supabase
        .from("perfis")
        .insert([{
          id: authData.user.id,
          email: formData.email,
          nome: formData.razao_social,
          tipo: "client"  // Tipo de perfil: client (não admin)
        }]);
        
      if (perfilError) {
        console.error("Erro ao criar perfil:", perfilError);
        // Tente desfazer a criação do usuário se possível
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw new Error(`Erro ao criar perfil: ${perfilError.message}`);
      }

      // 3. Por fim, inserimos os dados do cliente no sistema
      const { data, error } = await supabase
        .from("clientes_sistema")
        .insert([{
          razao_social: formData.razao_social,
          cnpj: formData.cnpj,
          email: formData.email,
          telefone: formData.telefone,
          responsavel: formData.responsavel,
          situacao: "liberado"  // Inicialmente liberado
        }])
        .select();

      if (error) {
        console.error("Erro ao criar dados do cliente:", error);
        // Consideramos desfazer as operações anteriores
        toast.error("Erro ao criar dados do cliente");
        return;
      }
      
      toast.success("Cliente criado com sucesso!");
      loadClientes();
    } catch (error: any) {
      console.error("Erro ao criar cliente:", error);
      toast.error(error.message || "Erro ao criar cliente");
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
              cliente.razao_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              cliente.cnpj?.toLowerCase().includes(searchTerm.toLowerCase())
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
