
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Employee } from "@/types/cadastro";

interface EmployeeSelectProps {
  employees: Employee[];
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const EmployeeSelect: React.FC<EmployeeSelectProps> = ({
  employees,
  value,
  onChange,
  disabled = false
}) => {
  const sortedEmployees = React.useMemo(() => {
    return [...employees].sort((a, b) => a.nome.localeCompare(b.nome));
  }, [employees]);

  return (
    <Select
      value={value}
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Selecione um funcionário" />
      </SelectTrigger>
      <SelectContent>
        {sortedEmployees.map((employee) => (
          <SelectItem key={employee.id} value={employee.id}>
            {employee.nome}
          </SelectItem>
        ))}
        {sortedEmployees.length === 0 && (
          <SelectItem value="none" disabled>
            Nenhum funcionário encontrado
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
};

export default EmployeeSelect;
