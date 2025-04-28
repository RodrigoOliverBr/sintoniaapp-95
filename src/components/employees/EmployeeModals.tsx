
import React from "react";
import { Employee } from "@/types/cadastro";
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
}

const EmployeeModals: React.FC<EmployeeModalsProps> = ({
  openNewModal,
  openEditModal,
  selectedEmployee,
  selectedCompanyId,
  onNewModalOpenChange,
  onEditModalOpenChange,
  onEmployeeUpdated,
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
          onOpenChange={onEditModalOpenChange}
          employee={selectedEmployee}
          onEmployeeUpdated={onEmployeeUpdated}
        />
      )}
    </>
  );
};

export default EmployeeModals;
