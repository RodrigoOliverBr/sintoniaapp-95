
import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Plus, Trash2, UserPlus } from "lucide-react";
import { Search } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { handleSupabaseError } from "@/integrations/supabase/client";
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ClienteSistema } from "@/types/cadastro";
import NewContractModal from "@/components/admin/contratos/NewContractModal";
import EditContractModal from "@/components/admin/contratos/EditContractModal";

interface DataTableProps {
  data: any[];
}

const ContratosPage: React.FC = () => {
  const [clientes, setClientes] = useState<ClienteSistema[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<ClienteSistema[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isNewContractModalOpen, setIsNewContractModalOpen] = useState(false);
  const [isEditContractModalOpen, setIsEditContractModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<ClienteSistema | null>(null);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("clientes_sistema")
        .select("*")
        .order("nome", { ascending: true });

      if (error) {
        console.error("Erro ao buscar clientes:", error);
        toast.error(handleSupabaseError(error) || "Erro ao buscar clientes.");
        return;
      }

      const clientesFormatted = data.map((cliente) => ({
        ...cliente,
        dataInclusao: cliente.dataInclusao ? new Date(cliente.dataInclusao) : null,
      }));

      setClientes(clientesFormatted as any);
      setFilteredClientes(clientesFormatted as any);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      toast.error((error as Error).message || "Erro ao buscar clientes.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    const filtered = clientes.filter((cliente) =>
      cliente.nome.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredClientes(filtered);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  };

  const handleDelete = async (cliente: ClienteSistema) => {
    try {
      const { error } = await supabase
        .from('clientes_sistema')
        .delete()
        .eq('id', cliente.id);

      if (error) {
        console.error("Erro ao excluir cliente:", error);
        toast.error(handleSupabaseError(error) || "Erro ao excluir cliente.");
        return;
      }

      toast.success("Cliente excluído com sucesso!");
      fetchClientes(); // Refresh the list
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
      toast.error((error as Error).message || "Erro ao excluir cliente.");
    }
  };

  const handleEdit = (cliente: ClienteSistema) => {
    setSelectedCliente(cliente);
    setIsEditContractModalOpen(true);
  };

  const handleOpenNewContractModal = () => {
    setIsNewContractModalOpen(true);
  };

  const handleCloseNewContractModal = () => {
    setIsNewContractModalOpen(false);
    fetchClientes(); // Refresh the list
  };

  const handleCloseEditContractModal = () => {
    setIsEditContractModalOpen(false);
    setSelectedCliente(null);
    fetchClientes(); // Refresh the list
  };

  return (
    <AdminLayout title="Contratos">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Lista de Clientes</CardTitle>
          <Button onClick={handleOpenNewContractModal}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Contrato
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4">
            <Search className="mr-2 h-4 w-4" />
            <Input
              type="search"
              placeholder="Buscar cliente..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="ml-2"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Data Inclusão</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredClientes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredClientes.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell className="font-medium">{cliente.nome}</TableCell>
                    <TableCell>{cliente.email}</TableCell>
                    <TableCell>{cliente.telefone}</TableCell>
                    <TableCell>{formatDate(cliente.dataInclusao)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(cliente)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação irá excluir o cliente permanentemente.
                                Deseja continuar?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(cliente)}>
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <NewContractModal
        open={isNewContractModalOpen}
        onClose={handleCloseNewContractModal}
      />

      {selectedCliente && (
        <EditContractModal
          open={isEditContractModalOpen}
          onClose={handleCloseEditContractModal}
          cliente={selectedCliente}
        />
      )}
    </AdminLayout>
  );
};

export default ContratosPage;
