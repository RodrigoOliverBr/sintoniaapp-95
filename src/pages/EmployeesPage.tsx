
import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Employee } from "@/types/cadastro";
import { useEmployees } from "@/hooks/useEmployees";
import EmployeeContent from "@/components/employees/EmployeeContent";
import EmployeeModals from "@/components/employees/EmployeeModals";

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

  const handleEmployeeUpdated = () => {
    if (selectedCompanyId) {
      loadEmployees(selectedCompanyId);
    }
  };

  return (
    <Layout title="Funcionários">
      <EmployeeContent
        companies={companies}
        employees={employees}
        selectedCompanyId={selectedCompanyId}
        isLoading={isLoading}
        roleNames={roleNames}
        onCompanyChange={handleCompanyChange}
        onNewEmployee={() => setOpenNewModal(true)}
        onEditEmployee={(employee) => {
          setSelectedEmployee(employee);
          setOpenEditModal(true);
        }}
        onDeleteEmployee={handleDeleteEmployee}
      />

      <EmployeeModals
        openNewModal={openNewModal}
        openEditModal={openEditModal}
        selectedEmployee={selectedEmployee}
        selectedCompanyId={selectedCompanyId}
        onNewModalOpenChange={setOpenNewModal}
        onEditModalOpenChange={setOpenEditModal}
        onEmployeeUpdated={handleEmployeeUpdated}
      />
    </Layout>
  );
};

export default EmployeesPage;
