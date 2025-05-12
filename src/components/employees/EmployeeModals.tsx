
import React, { useState, useEffect } from "react";
import { Employee, Department, JobRole } from "@/types/cadastro";
import NewEmployeeModal from "@/components/modals/NewEmployeeModal";
import EditEmployeeModal from "@/components/modals/EditEmployeeModal";
import { getDepartmentsByCompanyService } from "@/services";
import { toast } from "sonner";

interface EmployeeModalsProps {
  openNewModal: boolean;
  openEditModal: boolean;
  selectedEmployee: Employee | null;
  selectedCompanyId: string | null;
  onNewModalOpenChange: (open: boolean) => void;
  onEditModalOpenChange: (open: boolean) => void;
  onEmployeeUpdated: () => void;
  departments?: Department[];
  jobRoles?: JobRole[];
}

const EmployeeModals: React.FC<EmployeeModalsProps> = ({
  openNewModal,
  openEditModal,
  selectedEmployee,
  selectedCompanyId,
  onNewModalOpenChange,
  onEditModalOpenChange,
  onEmployeeUpdated,
  departments = [],
  jobRoles = [],
}) => {
  const [localDepartments, setLocalDepartments] = useState<Department[]>(departments);
  
  // Refresh departments when needed
  useEffect(() => {
    setLocalDepartments(departments);
  }, [departments]);
  
  // Force refresh departments when modals open
  useEffect(() => {
    const refreshDepartments = async () => {
      if ((openNewModal || openEditModal) && selectedCompanyId) {
        console.log("EmployeeModals: Refreshing departments for company:", selectedCompanyId);
        try {
          const depts = await getDepartmentsByCompanyService(selectedCompanyId);
          console.log("EmployeeModals: Refreshed departments:", depts);
          
          if (depts && depts.length === 0) {
            console.log("EmployeeModals: No departments found for company");
            toast.info("Esta empresa não possui setores cadastrados. Considere adicionar setores antes de cadastrar funcionários.");
          }
          
          setLocalDepartments(depts);
        } catch (error) {
          console.error("EmployeeModals: Error refreshing departments:", error);
        }
      }
    };
    
    refreshDepartments();
  }, [openNewModal, openEditModal, selectedCompanyId]);

  return (
    <>
      <NewEmployeeModal
        open={openNewModal}
        onOpenChange={onNewModalOpenChange}
        preselectedCompanyId={selectedCompanyId || ""}
        onEmployeeAdded={onEmployeeUpdated}
      />

      {selectedEmployee && (
        <EditEmployeeModal
          open={openEditModal}
          onClose={() => onEditModalOpenChange(false)}
          employee={selectedEmployee}
          onSave={onEmployeeUpdated}
          departments={localDepartments}
          jobRoles={jobRoles}
        />
      )}
    </>
  );
};

export default EmployeeModals;
