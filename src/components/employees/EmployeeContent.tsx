
import React from 'react';
import { Company, Employee, Department } from '@/types/cadastro';
import CompanySelect from './CompanySelect';
import EmployeeList from './EmployeeList';
import EmployeeStatus from './EmployeeStatus';

interface EmployeeContentProps {
  companies: Company[];
  employees?: Employee[];
  selectedCompanyId: string;
  isLoading?: boolean;
  roleNames?: Record<string, string>;
  departments?: Department[];
  onCompanyChange: (companyId: string) => void;
  onNewEmployee: () => void;
  onEditEmployee?: (employee: Employee) => void;
  onDeleteEmployee?: (employee: Employee) => void;
  onRefreshDepartments?: () => void;
}

const EmployeeContent: React.FC<EmployeeContentProps> = ({
  companies,
  employees = [],
  selectedCompanyId,
  isLoading = false,
  roleNames = {},
  departments = [],
  onCompanyChange,
  onNewEmployee,
  onEditEmployee,
  onDeleteEmployee,
  onRefreshDepartments
}) => {
  const handleCompanyChange = (id: string) => {
    onCompanyChange(id);
  };

  const getEmployeeStatus = (employeeId: string) => {
    return <EmployeeStatus employeeId={employeeId} />;
  };

  const handleDeleteEmployee = (employee: Employee) => {
    if (onDeleteEmployee) {
      onDeleteEmployee(employee);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <CompanySelect 
          companies={companies} 
          selectedCompanyId={selectedCompanyId}
          onCompanyChange={handleCompanyChange}
          onNewEmployee={onNewEmployee}
        />
      </div>
      
      {selectedCompanyId && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <EmployeeList 
            employees={employees}
            isLoading={isLoading}
            roleNames={roleNames}
            onEdit={(employee) => onEditEmployee && onEditEmployee(employee)}
            onDelete={(employeeId) => {
              // Find the employee by ID and pass the complete employee object
              const employee = employees.find(emp => emp.id === employeeId);
              if (employee && onDeleteEmployee) {
                onDeleteEmployee(employee);
              }
            }}
            getStatusComponent={getEmployeeStatus}
          />
        </div>
      )}
    </div>
  );
};

export default EmployeeContent;
