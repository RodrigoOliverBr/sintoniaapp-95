
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  ClienteStatus,
  TipoPessoa,
} from "@/types/cliente.d.ts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ClientesTable from "@/components/admin/clientes/ClientesTable";
import { Search } from 'lucide-react';

// Ensure we're using the right types for consistency
import { ClienteSistema } from "@/types/cliente.d.ts"; 

const ClientesPage: React.FC = () => {
  const [openNewModal, setOpenNewModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCliente, setSelectedCliente] = useState<ClienteSistema | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [nome, setNome] = useState("");
  const [razaoSocial, setRazaoSocial] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [tipo, setTipo] = useState<TipoPessoa>("juridica");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [situacao, setSituacao] = useState<ClienteStatus>("liberado");
  const [clientes, setClientes] = useState<ClienteSistema[]>([]);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("clientes_sistema")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar clientes:", error);
        toast({
          title: "Erro",
          description: "Erro ao buscar clientes: " + error.message,
          variant: "destructive",
        });
        return;
      }

      // Convert database schema to ClienteSistema type
      const clientesFormatted: ClienteSistema[] = data?.map((c) => ({
        id: c.id,
        nome: c.nome || c.razao_social || "",  // Use razao_social as fallback for nome
        razao_social: c.razao_social || "",
        razaoSocial: c.razao_social || "",
        cnpj: c.cnpj || "",
        cpfCnpj: c.cpf_cnpj || c.cnpj || "",  // Map between different field naming conventions
        telefone: c.telefone || "",
        email: c.email || "",
        responsavel: c.responsavel || "",
        contato: c.contato || "",
        situacao: (c.situacao || "liberado") as ClienteStatus,
        tipo: (c.tipo || "juridica") as TipoPessoa,
        numeroEmpregados: c.numero_empregados || 0,
        dataInclusao: c.data_inclusao || Date.now(),
        planoId: c.plano_id || "",
        contratoId: c.contrato_id || "",
      })) || [];

      setClientes(clientesFormatted);
    } catch (error: any) {
      console.error("Erro ao buscar clientes:", error);
      toast({
        title: "Erro",
        description: "Erro ao buscar clientes: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCliente = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("clientes_sistema").insert([
        {
          nome,
          razao_social: razaoSocial,
          email,
          telefone,
          tipo,
          cnpj: cpfCnpj, // Use cnpj field which exists in database
          situacao,
        },
      ]);

      if (error) {
        console.error("Erro ao criar cliente:", error);
        toast({
          title: "Erro",
          description: "Erro ao criar cliente: " + error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Cliente criado com sucesso!",
      });
      setOpenNewModal(false);
      fetchClientes();
      clearForm();
    } catch (error: any) {
      console.error("Erro ao criar cliente:", error);
      toast({
        title: "Erro",
        description: "Erro ao criar cliente: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCliente = async () => {
    if (!selectedCliente) {
      toast({
        title: "Erro",
        description: "Nenhum cliente selecionado para editar.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("clientes_sistema")
        .update({
          nome,
          razao_social: razaoSocial,
          email,
          telefone,
          tipo,
          cnpj: cpfCnpj, // Use cnpj field which exists in database
          situacao,
        })
        .eq("id", selectedCliente.id);

      if (error) {
        console.error("Erro ao atualizar cliente:", error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar cliente: " + error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Cliente atualizado com sucesso!",
      });
      setOpenEditModal(false);
      fetchClientes();
      clearForm();
    } catch (error: any) {
      console.error("Erro ao atualizar cliente:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar cliente: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Renamed to confirmDeleteCliente to avoid duplication with the handler below
  const confirmDeleteCliente = async () => {
    if (!selectedCliente) {
      toast({
        title: "Erro",
        description: "Nenhum cliente selecionado para excluir.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("clientes_sistema")
        .delete()
        .eq("id", selectedCliente.id);

      if (error) {
        console.error("Erro ao excluir cliente:", error);
        toast({
          title: "Erro",
          description: "Erro ao excluir cliente: " + error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Cliente excluído com sucesso!",
      });
      setOpenDeleteModal(false);
      fetchClientes();
      clearForm();
    } catch (error: any) {
      console.error("Erro ao excluir cliente:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir cliente: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearForm = () => {
    setNome("");
    setRazaoSocial("");
    setEmail("");
    setTelefone("");
    setTipo("juridica");
    setCpfCnpj("");
    setSituacao("liberado");
    setSelectedCliente(null);
  };

  const filteredClientes = clientes.filter((cliente) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      cliente.nome?.toLowerCase().includes(searchTermLower) ||
      cliente.razao_social?.toLowerCase().includes(searchTermLower) ||
      cliente.email?.toLowerCase().includes(searchTermLower) ||
      cliente.cpfCnpj?.toLowerCase().includes(searchTermLower)
    );
  });

  // Update client handlers with proper type casting
  const handleEditCliente = (cliente: any) => {
    // Cast to correct type for consistency
    const clienteTyped = cliente as unknown as ClienteSistema;
    setSelectedCliente(clienteTyped);
    setOpenEditModal(true);
    setNome(clienteTyped.nome);
    setRazaoSocial(clienteTyped.razao_social || "");
    setEmail(clienteTyped.email);
    setTelefone(clienteTyped.telefone);
    setTipo(clienteTyped.tipo as TipoPessoa);
    setCpfCnpj(clienteTyped.cpfCnpj || clienteTyped.cnpj || "");
    setSituacao(clienteTyped.situacao as ClienteStatus);
  };

  // This function opens delete modal only, renamed to avoid duplication
  const handleDeleteClick = (cliente: any) => {
    // Cast to correct type for consistency
    const clienteTyped = cliente as unknown as ClienteSistema;
    setSelectedCliente(clienteTyped);
    setOpenDeleteModal(true);
  };

  const handleViewCliente = (cliente: any) => {
    // Cast to correct type for consistency
    const clienteTyped = cliente as unknown as ClienteSistema;
    setSelectedCliente(clienteTyped);
    setOpenViewModal(true);
  };

  return (
    <AdminLayout title="Clientes">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Criar Cliente</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nome
                  </Label>
                  <Input
                    id="name"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="razaoSocial" className="text-right">
                    Razão Social
                  </Label>
                  <Input
                    id="razaoSocial"
                    value={razaoSocial}
                    onChange={(e) => setRazaoSocial(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="telefone" className="text-right">
                    Telefone
                  </Label>
                  <Input
                    id="telefone"
                    type="tel"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tipo" className="text-right">
                    Tipo
                  </Label>
                  <Select 
                    onValueChange={(value) => setTipo(value as TipoPessoa)} 
                    defaultValue={tipo}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fisica">Física</SelectItem>
                      <SelectItem value="juridica">Jurídica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cpfCnpj" className="text-right">
                    CPF/CNPJ
                  </Label>
                  <Input
                    id="cpfCnpj"
                    value={cpfCnpj}
                    onChange={(e) => setCpfCnpj(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="situacao" className="text-right">
                    Situação
                  </Label>
                  <Select 
                    onValueChange={(value) => setSituacao(value as ClienteStatus)} 
                    defaultValue={situacao}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecione a situação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="liberado">Liberado</SelectItem>
                      <SelectItem value="bloqueado">Bloqueado</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="em-analise">Em Análise</SelectItem>
                      <SelectItem value="sem-contrato">Sem Contrato</SelectItem>
                      <SelectItem value="bloqueado-manualmente">
                        Bloqueado Manualmente
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" onClick={handleCreateCliente}>
                  Criar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          </div>
        </CardHeader>
        <CardContent>
          <ClientesTable
            clientes={filteredClientes}
            isLoading={isLoading}
            onEdit={handleEditCliente}
            onDelete={handleDeleteClick} // Updated to use the new function name
            onView={handleViewCliente}
          />
        </CardContent>
      </Card>

      {/* Edit Client Modal */}
      <Dialog open={openEditModal} onOpenChange={setOpenEditModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input
                id="name"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="razaoSocial" className="text-right">
                Razão Social
              </Label>
              <Input
                id="razaoSocial"
                value={razaoSocial}
                onChange={(e) => setRazaoSocial(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="telefone" className="text-right">
                Telefone
              </Label>
              <Input
                id="telefone"
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tipo" className="text-right">
                Tipo
              </Label>
              <Select 
                onValueChange={(value) => setTipo(value as TipoPessoa)} 
                value={tipo}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fisica">Física</SelectItem>
                  <SelectItem value="juridica">Jurídica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cpfCnpj" className="text-right">
                CPF/CNPJ
              </Label>
              <Input
                id="cpfCnpj"
                value={cpfCnpj}
                onChange={(e) => setCpfCnpj(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="situacao" className="text-right">
                Situação
              </Label>
              <Select 
                onValueChange={(value) => setSituacao(value as ClienteStatus)} 
                value={situacao}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione a situação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="liberado">Liberado</SelectItem>
                  <SelectItem value="bloqueado">Bloqueado</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="em-analise">Em Análise</SelectItem>
                  <SelectItem value="sem-contrato">Sem Contrato</SelectItem>
                  <SelectItem value="bloqueado-manualmente">
                    Bloqueado Manualmente
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleUpdateCliente}>
              Atualizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Client Modal */}
      <Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Excluir Cliente</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p>
              Tem certeza que deseja excluir o cliente{" "}
              {selectedCliente?.nome}?
            </p>
          </div>
          <DialogFooter>
            <Button type="button" onClick={confirmDeleteCliente}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Client Modal */}
      <Dialog open={openViewModal} onOpenChange={setOpenViewModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Visualizar Cliente</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input
                id="name"
                value={selectedCliente?.nome}
                className="col-span-3"
                readOnly
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="razaoSocial" className="text-right">
                Razão Social
              </Label>
              <Input
                id="razaoSocial"
                value={selectedCliente?.razao_social}
                className="col-span-3"
                readOnly
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={selectedCliente?.email}
                className="col-span-3"
                readOnly
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="telefone" className="text-right">
                Telefone
              </Label>
              <Input
                id="telefone"
                type="tel"
                value={selectedCliente?.telefone}
                className="col-span-3"
                readOnly
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tipo" className="text-right">
                Tipo
              </Label>
              <Select disabled value={selectedCliente?.tipo}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fisica">Física</SelectItem>
                  <SelectItem value="juridica">Jurídica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cpfCnpj" className="text-right">
                CPF/CNPJ
              </Label>
              <Input
                id="cpfCnpj"
                value={selectedCliente?.cpfCnpj || selectedCliente?.cnpj}
                className="col-span-3"
                readOnly
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="situacao" className="text-right">
                Situação
              </Label>
              <Select disabled value={selectedCliente?.situacao}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione a situação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="liberado">Liberado</SelectItem>
                  <SelectItem value="bloqueado">Bloqueado</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="em-analise">Em Análise</SelectItem>
                  <SelectItem value="sem-contrato">Sem Contrato</SelectItem>
                  <SelectItem value="bloqueado-manualmente">
                    Bloqueado Manualmente
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default ClientesPage;
