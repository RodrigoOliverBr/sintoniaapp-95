
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClienteComContrato } from "@/types/admin";
import { ClienteActions } from './ClienteActions';
import { ClienteStatusBadge } from './ClienteStatusBadge';

interface ClientesTableProps {
  clientes: ClienteComContrato[];
  isLoading: boolean;
  isAdmin: boolean;
  onLoginAsClient: (cliente: ClienteComContrato) => void;
  onOpenBlockModal: (cliente: ClienteComContrato) => void;
  onOpenEditModal: (cliente: ClienteComContrato) => void;
  onOpenDeleteModal: (cliente: ClienteComContrato) => void;
}

export const ClientesTable: React.FC<ClientesTableProps> = ({
  clientes,
  isLoading,
  isAdmin,
  onLoginAsClient,
  onOpenBlockModal,
  onOpenEditModal,
  onOpenDeleteModal
}) => {
  if (isLoading) {
    return (
      <TableRow>
        <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
          Carregando clientes...
        </TableCell>
      </TableRow>
    );
  }

  if (clientes.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
          Nenhum cliente encontrado.
        </TableCell>
      </TableRow>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Razão Social</TableHead>
          <TableHead>CNPJ</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Telefone</TableHead>
          <TableHead>Responsável</TableHead>
          <TableHead>Situação</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clientes.map((cliente) => (
          <TableRow key={cliente.id}>
            <TableCell className="font-medium">{cliente.razaoSocial}</TableCell>
            <TableCell>{cliente.cnpj}</TableCell>
            <TableCell>{cliente.email}</TableCell>
            <TableCell>{cliente.telefone}</TableCell>
            <TableCell>{cliente.responsavel}</TableCell>
            <TableCell>
              <ClienteStatusBadge cliente={cliente} />
            </TableCell>
            <TableCell className="text-right">
              <ClienteActions 
                cliente={cliente}
                isAdmin={isAdmin}
                onLogin={onLoginAsClient}
                onBlock={onOpenBlockModal}
                onEdit={onOpenEditModal}
                onDelete={onOpenDeleteModal}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
