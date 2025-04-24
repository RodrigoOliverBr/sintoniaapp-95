
import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Employee } from "@/types/cadastro";
import { getFormStatusByEmployeeId } from "@/services";
import NewEmployeeModal from "@/components/modals/NewEmployeeModal";
import EditEmployeeModal from "@/components/modals/EditEmployeeModal";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import EmployeeList from "@/components/employees/EmployeeList";
import CompanySelect from "@/components/employees/CompanySelect";
import { useEmployees } from "@/hooks/useEmployees";

const EmployeesPage: React.FC = () => {
  const [openNewModal, setOpenNewModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  const {
    companies,
    employees,
    selectedCompanyId,
    isLoading,
    roleNames,
    setSelectedCompanyId,
    loadCompanies,
    loadEmployees,
    handleDeleteEmployee,
  } = useEmployees();

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      loadEmployees(selectedCompanyId);
    }
  }, [selectedCompanyId, loadEmployees]);

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompanyId(companyId);
  };

  const getStatusComponent = (employeeId: string) => {
    const status = getFormStatusByEmployeeId(employeeId);

    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500 h-4 w-4 inline-block mr-1" />;
      case 'pending':
        return <Clock className="text-yellow-500 h-4 w-4 inline-block mr-1" />;
      case 'error':
        return <AlertTriangle className="text-red-500 h-4 w-4 inline-block mr-1" />;
      default:
        return null;
    }
  };

  const handleEmployeeUpdated = () => {
    if (selectedCompanyId) {
      loadEmployees(selectedCompanyId);
    }
  };

  // Ensure we have a companies array to pass to CompanySelect
  const safeCompanies = Array.isArray(companies) ? companies : [];

  return (
    <Layout title="Funcionários">
      <Card>
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold">Lista de Funcionários</h2>
          <CompanySelect
            companies={safeCompanies}
            selectedCompanyId={selectedCompanyId}
            onCompanyChange={handleCompanyChange}
            onNewEmployee={() => setOpenNewModal(true)}
          />
        </div>
        <Card>
          <EmployeeList
            employees={employees}
            isLoading={isLoading}
            roleNames={roleNames}
            onEdit={(employee) => {
              setSelectedEmployee(employee);
              setOpenEditModal(true);
            }}
            onDelete={handleDeleteEmployee}
            getStatusComponent={getStatusComponent}
          />
        </Card>
      </Card>

      <NewEmployeeModal
        open={openNewModal}
        onOpenChange={setOpenNewModal}
        preselectedCompanyId={selectedCompanyId || ""}
        onEmployeeAdded={handleEmployeeUpdated}
      />

      {selectedEmployee && (
        <EditEmployeeModal
          open={openEditModal}
          onOpenChange={setOpenEditModal}
          employee={selectedEmployee}
          onEmployeeUpdated={handleEmployeeUpdated}
        />
      )}
    </Layout>
  );
};

export default EmployeesPage;
