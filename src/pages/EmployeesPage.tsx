
import React, { useEffect, useState, useCallback } from "react";
import Layout from "@/components/Layout";
import { Employee, Department } from "@/types/cadastro";
import { useEmployees } from "@/hooks/useEmployees";
import EmployeeContent from "@/components/employees/EmployeeContent";
import EmployeeModals from "@/components/employees/EmployeeModals";
import { getDepartmentsByCompanyService } from "@/services";
import { toast } from "sonner";

const EmployeesPage: React.FC = () => {
  const [openNewModal, setOpenNewModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  
  const {
    companies,
    employees,
    selectedCompanyId,
    isLoading,
    roleNames,
    setSelectedCompanyId,
    loadEmployees,
    handleDeleteEmployee,
  } = useEmployees();

  useEffect(() => {
    console.log("EmployeesPage: Carregando empresas no mount...");
  }, []);

  const loadDepartments = useCallback(async (companyId: string) => {
    if (!companyId) return;
    
    console.log("EmployeesPage: Loading departments for company:", companyId);
    try {
      const departmentsData = await getDepartmentsByCompanyService(companyId);
      console.log("EmployeesPage: Departments loaded:", departmentsData);
      setDepartments(departmentsData || []);
    } catch (error) {
      console.error("EmployeesPage: Error loading departments:", error);
      toast.error("Erro ao carregar setores");
      // Não limpar departamentos existentes em caso de erro
    }
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      console.log("EmployeesPage: Company changed, loading employees and departments");
      loadDepartments(selectedCompanyId);
    } else {
      console.log("EmployeesPage: No company selected");
    }
  }, [selectedCompanyId, loadDepartments]);

  const handleCompanyChange = (companyId: string) => {
    console.log("EmployeesPage: Company selection changed to:", companyId);
    setSelectedCompanyId(companyId);
  };

  const handleEmployeeUpdated = () => {
    console.log("EmployeesPage: Employee updated, reloading employees");
    if (selectedCompanyId) {
      loadEmployees(selectedCompanyId);
    }
  };
  
  const handleRefreshDepartments = () => {
    console.log("EmployeesPage: Manual department refresh requested");
    if (selectedCompanyId) {
      loadDepartments(selectedCompanyId);
    }
  };

  // Modified to accept Employee object and extract the ID
  const handleEmployeeDelete = (employee: Employee) => {
    console.log("EmployeesPage: Delete requested for employee:", employee.id);
    if (employee && employee.id) {
      handleDeleteEmployee(employee.id);
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
        departments={departments}
        onCompanyChange={handleCompanyChange}
        onNewEmployee={() => setOpenNewModal(true)}
        onEditEmployee={(employee) => {
          setSelectedEmployee(employee);
          setOpenEditModal(true);
        }}
        onDeleteEmployee={handleEmployeeDelete}
        onRefreshDepartments={handleRefreshDepartments}
      />

      <EmployeeModals
        openNewModal={openNewModal}
        openEditModal={openEditModal}
        selectedEmployee={selectedEmployee}
        selectedCompanyId={selectedCompanyId}
        onNewModalOpenChange={setOpenNewModal}
        onEditModalOpenChange={setOpenEditModal}
        onEmployeeUpdated={handleEmployeeUpdated}
        departments={departments}
      />
    </Layout>
  );
};

export default EmployeesPage;
