
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
import { PenLine, Trash2 } from "lucide-react";

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
  console.log("EmployeeList: Rendering with roleNames:", roleNames);
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Email</TableHead>
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
          employees.map((employee) => {
            console.log(`Employee ${employee.id} role:`, employee.role, "Display name:", roleNames[employee.role || '']);
            const roleName = employee.role && roleNames 
              ? (roleNames[employee.role] || 'Não definido')
              : 'Não definido';
              
            return (
              <TableRow key={employee.id}>
                <TableCell>{employee.name}</TableCell>
                <TableCell>{employee.email || '-'}</TableCell>
                <TableCell>{roleName}</TableCell>
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
            );
          })
        )}
      </TableBody>
    </Table>
  );
};

export default EmployeeList;
