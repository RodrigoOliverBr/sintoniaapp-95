
import React from "react";
import { Employee, Department, JobRole } from "@/types/cadastro";
import NewEmployeeModal from "@/components/modals/NewEmployeeModal";
import EditEmployeeModal from "@/components/modals/EditEmployeeModal";

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
          departments={departments}
          jobRoles={jobRoles}
        />
      )}
    </>
  );
};

export default EmployeeModals;
