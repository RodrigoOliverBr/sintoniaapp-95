
import React from "react";
import { Card } from "@/components/ui/card";
import { Employee } from "@/types/cadastro";
import { getEmployeeStatusComponent } from "./EmployeeStatus";
import EmployeeList from "./EmployeeList";
import CompanySelect from "./CompanySelect";

interface EmployeeContentProps {
  companies: any[];
  employees: Employee[];
  selectedCompanyId: string | null;
  isLoading: boolean;
  roleNames: Record<string, string>;
  onCompanyChange: (companyId: string) => void;
  onNewEmployee: () => void;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employeeId: string) => void;
}

const EmployeeContent: React.FC<EmployeeContentProps> = ({
  companies,
  employees,
  selectedCompanyId,
  isLoading,
  roleNames,
  onCompanyChange,
  onNewEmployee,
  onEditEmployee,
  onDeleteEmployee,
}) => {
  return (
    <Card>
      <div className="flex items-center justify-between p-4">
        <h2 className="text-lg font-semibold">Lista de Funcionários</h2>
        <CompanySelect
          companies={companies}
          selectedCompanyId={selectedCompanyId}
          onCompanyChange={onCompanyChange}
          onNewEmployee={onNewEmployee}
        />
      </div>
      <Card>
        <EmployeeList
          employees={employees}
          isLoading={isLoading}
          roleNames={roleNames}
          onEdit={onEditEmployee}
          onDelete={onDeleteEmployee}
          getStatusComponent={getEmployeeStatusComponent}
        />
      </Card>
    </Card>
  );
};

export default EmployeeContent;
