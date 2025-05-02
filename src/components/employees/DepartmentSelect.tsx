
import React, { useEffect, useState } from "react";
import { Department } from "@/types/cadastro";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FolderMinus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDepartmentsByCompany } from "@/services";

interface DepartmentSelectProps {
  departments: Department[];
  selectedDepartments: string[];
  onDepartmentToggle: (departmentId: string) => void;
  companyId: string;
  onRefreshDepartments?: () => void;
}

const DepartmentSelect = ({
  departments,
  selectedDepartments,
  onDepartmentToggle,
  companyId,
  onRefreshDepartments,
}: DepartmentSelectProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const hasDepartments = departments && departments.length > 0;
  
  const handleRefreshClick = async () => {
    if (!companyId || isLoading) return;
    
    setIsLoading(true);
    try {
      console.log("DepartmentSelect: Refresh manual de departamentos para empresa:", companyId);
      if (onRefreshDepartments) {
        onRefreshDepartments();
      }
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  console.log("DepartmentSelect: Rendering with departments:", departments);

  return (
    <div className="grid grid-cols-4 items-start gap-4">
      <Label htmlFor="departments" className="text-right pt-2">
        Setores
      </Label>
      <div className="col-span-3 space-y-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">
            {hasDepartments 
              ? `${departments.length} setores disponíveis` 
              : companyId 
                ? "Nenhum setor cadastrado ainda" 
                : "Selecione uma empresa primeiro"}
          </span>
          {companyId && (
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={handleRefreshClick}
              disabled={isLoading}
              className="h-8 px-2"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          )}
        </div>
        
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
