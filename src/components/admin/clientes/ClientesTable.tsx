import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ClientesTableProps {
  clientes: any[]; // Using any to avoid type conflicts
  isLoading: boolean;
  onEdit: (cliente: any) => void;
  onDelete: (cliente: any) => void;
  onView: (cliente: any) => void;
}

const ClientesTable: React.FC<ClientesTableProps> = ({ 
  clientes, 
  isLoading, 
  onEdit, 
  onDelete, 
  onView 
}) => {
  const formatDate = (date: number) => {
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
  };

  // Fix for ReactNode error - ensure we return valid React nodes
  const renderStatus = (status: string) => {
    switch (status?.toLowerCase()) {
      case "liberado":
        return <Badge variant="success">Liberado</Badge>;
      case "bloqueado":
        return <Badge variant="destructive">Bloqueado</Badge>;
      case "pendente":
        return <Badge variant="warning">Pendente</Badge>;
      case "ativo":
        return <Badge variant="default">Ativo</Badge>;
      case "em-analise":
        return <Badge variant="secondary">Em Análise</Badge>;
      case "sem-contrato":
        return <Badge variant="outline">Sem Contrato</Badge>;
      case "bloqueado-manualmente":
        return <Badge variant="destructive">Bloq. Manual</Badge>;
      default:
        return <span>{status || "Desconhecido"}</span>; // Return valid ReactNode
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>CPF/CNPJ</TableHead>
          <TableHead>Data Inclusão</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clientes.map((cliente) => (
          <TableRow key={cliente.id}>
            <TableCell className="font-medium">{cliente.nome}</TableCell>
            <TableCell>{cliente.email}</TableCell>
            <TableCell>{cliente.cpfCnpj}</TableCell>
            <TableCell>{formatDate(cliente.dataInclusao)}</TableCell>
            <TableCell>{renderStatus(cliente.situacao)}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onView(cliente)}
                  disabled={isLoading}
                >
                  <Eye size={16} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onEdit(cliente)}
                  disabled={isLoading}
                >
                  <Pencil size={16} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onDelete(cliente)}
                  disabled={isLoading}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ClientesTable;
