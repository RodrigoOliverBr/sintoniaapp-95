import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import ClientesTable from "@/components/admin/clientes/ClientesTable";
import {
  ClienteDialogDelete,
  ClienteDialogEdit,
  ClienteDialogNew
} from "@/components/admin/clientes/ClienteDialogs";
import { HeaderClientesActions } from "@/components/admin/clientes/ClienteActions";
import { ClienteSistema } from "@/types/admin";

const ClientesPage: React.FC = () => {
  const [clientes, setClientes] = useState<ClienteSistema[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [openNewModal, setOpenNewModal] = useState<boolean>(false);
  const [openEditModal, setOpenEditModal] = useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
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
        
        const contratoId = contratosData?.find(
          contrato => contrato.cliente_sistema_id === cliente.id
        )?.id || "";
        
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

  const handleCloseModals = () => {
    setOpenNewModal(false);
    setOpenEditModal(false);
    setOpenDeleteModal(false);
    setSelectedCliente(null);
  };

  const handleSaveNew = async (newCliente: Omit<ClienteSistema, "id">) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("clientes_sistema")
        .insert([newCliente])
        .select();

      if (error) {
        console.error("Erro ao criar cliente:", error);
        toast.error("Erro ao criar cliente");
      } else {
        toast.success("Cliente criado com sucesso!");
        loadClientes();
      }
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      toast.error("Erro ao criar cliente");
    } finally {
      setIsLoading(false);
      handleCloseModals();
    }
  };

  const handleSaveEdit = async (cliente: ClienteSistema) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("clientes_sistema")
        .update(cliente)
        .eq("id", cliente.id)
        .select();

      if (error) {
        console.error("Erro ao atualizar cliente:", error);
        toast.error("Erro ao atualizar cliente");
      } else {
        toast.success("Cliente atualizado com sucesso!");
        loadClientes();
      }
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      toast.error("Erro ao atualizar cliente");
    } finally {
      setIsLoading(false);
      handleCloseModals();
    }
  };

  const handleDelete = async () => {
    if (!selectedCliente) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("clientes_sistema")
        .delete()
        .eq("id", selectedCliente.id);

      if (error) {
        console.error("Erro ao excluir cliente:", error);
        toast.error("Erro ao excluir cliente");
      } else {
        toast.success("Cliente excluído com sucesso!");
        loadClientes();
      }
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
      toast.error("Erro ao excluir cliente");
    } finally {
      setIsLoading(false);
      handleCloseModals();
    }
  };

  return (
    <AdminLayout title="Clientes">
      <Card>
        <CardHeader>
          <HeaderClientesActions
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
          />
        </CardContent>
      </Card>

      <Dialog open={openNewModal} onOpenChange={setOpenNewModal}>
        <ClienteDialogNew
          open={openNewModal}
          onOpenChange={setOpenNewModal}
          onSave={handleSaveNew}
          isLoading={isLoading}
        />
      </Dialog>

      <Dialog open={openEditModal} onOpenChange={setOpenEditModal}>
        <ClienteDialogEdit
          open={openEditModal}
          onOpenChange={setOpenEditModal}
          onSave={handleSaveEdit}
          isLoading={isLoading}
          cliente={selectedCliente}
        />
      </Dialog>

      <Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
        <ClienteDialogDelete
          open={openDeleteModal}
          onOpenChange={setOpenDeleteModal}
          onDelete={handleDelete}
          isLoading={isLoading}
          cliente={selectedCliente}
        />
      </Dialog>
    </AdminLayout>
  );
};

export default ClientesPage;
