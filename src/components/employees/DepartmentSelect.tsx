
import React from "react";
import { Department } from "@/types/cadastro";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FolderMinus } from "lucide-react";

interface DepartmentSelectProps {
  departments: Department[];
  selectedDepartments: string[];
  onDepartmentToggle: (departmentId: string) => void;
  companyId: string;
}

const DepartmentSelect = ({
  departments,
  selectedDepartments,
  onDepartmentToggle,
  companyId,
}: DepartmentSelectProps) => {
  const hasDepartments = departments.length > 0;

  return (
    <div className="grid grid-cols-4 items-start gap-4">
      <Label htmlFor="departments" className="text-right pt-2">
        Setores
      </Label>
      <div className="col-span-3 space-y-2">
        {hasDepartments ? (
          departments.map((department) => (
            <div key={department.id} className="flex items-center space-x-2">
              <Checkbox
                id={`dept-${department.id}`}
                checked={selectedDepartments.includes(department.id)}
                onCheckedChange={() => onDepartmentToggle(department.id)}
              />
              <Label
                htmlFor={`dept-${department.id}`}
                className="text-sm font-normal cursor-pointer"
              >
                {department.name}
              </Label>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
            <FolderMinus className="mr-2 h-4 w-4" />
            {companyId 
              ? "Nenhum setor cadastrado ainda para esta empresa 😟" 
              : "Selecione uma empresa primeiro"}
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentSelect;
