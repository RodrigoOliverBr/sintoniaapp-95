
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { handleSupabaseError } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast"

interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cnpj: string;
  status: "ativo" | "bloqueado" | "liberado";
}

interface ClienteStatus {
  id: string;
  status: "ativo" | "bloqueado" | "liberado";
}

const ClientesPage: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast()

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clientes_sistema')
        .select('*');

      if (error) {
        console.error("Erro ao buscar clientes:", error);
        toast({
          variant: "destructive",
          title: "Erro!",
          description: handleSupabaseError(error),
        })
      }

      if (data) {
        // Map the data to match our Cliente interface
        const clientesFormatados: Cliente[] = data.map(cliente => ({
          id: cliente.id,
          nome: cliente.razao_social,
          email: cliente.email || '',
          telefone: cliente.telefone || '',
          cnpj: cliente.cnpj,
          status: cliente.situacao as "ativo" | "bloqueado" | "liberado"
        }));
        setClientes(clientesFormatados);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (clienteId: string, newStatus: "ativo" | "bloqueado" | "liberado") => {
    try {
      const { data, error } = await supabase
        .from('clientes_sistema')
        .update({ situacao: newStatus })
        .eq('id', clienteId)
        .select()

      if (error) {
        console.error("Erro ao atualizar status do cliente:", error);
        toast({
          variant: "destructive",
          title: "Erro!",
          description: handleSupabaseError(error),
        })
        return;
      }

      if (data && data.length > 0) {
        setClientes(clientes.map(cliente =>
          cliente.id === clienteId ? { ...cliente, status: newStatus } : cliente
        ));
        toast({
          title: "Sucesso!",
          description: "Status do cliente atualizado com sucesso.",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Erro!",
          description: "Falha ao atualizar o status do cliente.",
        })
      }
    } catch (error: any) {
      console.error("Erro ao atualizar status do cliente:", error);
      toast({
        variant: "destructive",
        title: "Erro!",
        description: handleSupabaseError(error),
      })
    }
  };

  const handleAccessAsClient = (clienteId: string) => {
    localStorage.setItem("sintonia:userType", "client");
    localStorage.setItem("sintonia:currentCliente", clienteId);
    navigate("/");
  };

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(search.toLowerCase()) ||
    cliente.email.toLowerCase().includes(search.toLowerCase()) ||
    cliente.cnpj.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Clientes do Sistema</h1>
        <Input
          type="search"
          placeholder="Buscar clientes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      {loading ? (
        <p>Carregando clientes...</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableCaption>Lista de todos os clientes do sistema.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClientes.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell className="font-medium">{cliente.id}</TableCell>
                  <TableCell>{cliente.nome}</TableCell>
                  <TableCell>{cliente.email}</TableCell>
                  <TableCell>{cliente.cnpj}</TableCell>
                  <TableCell>{cliente.status}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigate(`/admin/clientes/${cliente.id}`)}>
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAccessAsClient(cliente.id)}>
                          Acessar como cliente
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleStatusChange(cliente.id, cliente.status === "ativo" ? "bloqueado" : "ativo")}>
                          {cliente.status === "ativo" ? "Bloquear" : "Ativar"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(cliente.id, "liberado")}>
                          Liberar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default ClientesPage;
