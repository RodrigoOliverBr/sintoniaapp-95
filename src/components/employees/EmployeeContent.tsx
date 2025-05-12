
import React from "react";
import CompanySelect from "./CompanySelect";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import EmployeeList from "./EmployeeList";
import EmployeeStatus from "./EmployeeStatus";
import { Company, Employee, Department } from "@/types/cadastro";
import { Plus } from "lucide-react";

interface EmployeeContentProps {
  companies: Company[];
  employees: Employee[];
  selectedCompanyId: string | null;
  isLoading: boolean;
  roleNames: Record<string, string>;
  departments?: Department[];
  onCompanyChange: (companyId: string) => void;
  onNewEmployee: () => void;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employeeId: string) => void;
  onRefreshDepartments?: () => void;
}

const EmployeeContent: React.FC<EmployeeContentProps> = ({
  companies,
  employees,
  selectedCompanyId,
  isLoading,
  roleNames,
  departments,
  onCompanyChange,
  onNewEmployee,
  onEditEmployee,
  onDeleteEmployee,
  onRefreshDepartments,
}) => {
  const getStatusComponent = (employeeId: string) => {
    return <EmployeeStatus employeeId={employeeId} />;
  };

  // Log important data for debugging
  console.log("EmployeeContent: Rendering with companies:", companies.length);
  console.log("EmployeeContent: Selected company ID:", selectedCompanyId);
  console.log("EmployeeContent: Available departments:", departments?.length || 0);
  console.log("EmployeeContent: Role names mapping:", roleNames);
  console.log("EmployeeContent: Current employees:", employees);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex-1 max-w-xs">
          <CompanySelect
            companies={companies}
            selectedCompanyId={selectedCompanyId}
            onCompanyChange={onCompanyChange}
          />
        </div>
        
        <Button 
          onClick={onNewEmployee}
          disabled={!selectedCompanyId}
          className="ml-4"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Funcionário
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <EmployeeList
            employees={employees}
            isLoading={isLoading}
            roleNames={roleNames}
            onEdit={onEditEmployee}
            onDelete={onDeleteEmployee}
            getStatusComponent={getStatusComponent}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeContent;
