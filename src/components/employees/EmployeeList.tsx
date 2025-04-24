
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Employee } from "@/types/cadastro";
import { PenLine, Trash2, AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface EmployeeListProps {
  employees: Employee[];
  isLoading: boolean;
  roleNames: Record<string, string>;
  onEdit: (employee: Employee) => void;
  onDelete: (employeeId: string) => void;
  getStatusComponent: (employeeId: string) => React.ReactNode;
}

const EmployeeList: React.FC<EmployeeListProps> = ({
  employees,
  isLoading,
  roleNames,
  onEdit,
  onDelete,
  getStatusComponent,
}) => {
  const getRoleName = (roleId: string | undefined): string => {
    if (!roleId) return 'N/A';
    return roleNames[roleId] || 'Carregando...';
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>CPF</TableHead>
          <TableHead>Cargo</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center">Carregando...</TableCell>
          </TableRow>
        ) : employees.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center">Nenhum funcionário cadastrado</TableCell>
          </TableRow>
        ) : (
          employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell>{employee.name}</TableCell>
              <TableCell>{employee.cpf}</TableCell>
              <TableCell>{getRoleName(employee.roleId)}</TableCell>
              <TableCell>{getStatusComponent(employee.id)}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(employee)}
                >
                  <PenLine className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(employee.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default EmployeeList;
