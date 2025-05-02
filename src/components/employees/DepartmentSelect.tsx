
import React, { useEffect, useState } from "react";
import { Department } from "@/types/cadastro";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FolderMinus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDepartmentsByCompany } from "@/services";
import { toast } from "sonner";

interface DepartmentSelectProps {
  departments: Department[];
  selectedDepartments: string[];
  onDepartmentToggle: (departmentId: string) => void;
  companyId: string;
  onRefreshDepartments?: () => void;
}

const DepartmentSelect: React.FC<DepartmentSelectProps> = ({
  departments,
  selectedDepartments,
  onDepartmentToggle,
  companyId,
  onRefreshDepartments,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [localDepartments, setLocalDepartments] = useState<Department[]>(departments);
  const hasDepartments = localDepartments && localDepartments.length > 0;
  
  // Update local departments when prop changes
  useEffect(() => {
    console.log("DepartmentSelect: Updated departments from props:", departments);
    setLocalDepartments(departments);
  }, [departments]);
  
  const handleRefreshClick = async () => {
    if (!companyId || isLoading) return;
    
    setIsLoading(true);
    try {
      console.log("DepartmentSelect: Refresh manual de departamentos para empresa:", companyId);
      
      // Fetch departments directly here to update local state and parent 
      const refreshedDepartments = await getDepartmentsByCompany(companyId);
      console.log("DepartmentSelect: Departamentos atualizados:", refreshedDepartments);
      
      // Update local state first
      setLocalDepartments(refreshedDepartments);
      
      // Then notify parent to update its state
      if (onRefreshDepartments) {
        onRefreshDepartments();
      }
      
      toast.success("Lista de setores atualizada com sucesso!");
    } catch (error) {
      console.error("DepartmentSelect: Erro ao atualizar departamentos:", error);
      toast.error("Erro ao atualizar lista de setores");
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  console.log("DepartmentSelect: Rendering with departments:", localDepartments);

  return (
    <div className="grid grid-cols-4 items-start gap-4">
      <Label htmlFor="departments" className="text-right pt-2">
        Setores
      </Label>
      <div className="col-span-3 space-y-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">
            {hasDepartments 
              ? `${localDepartments.length} setores disponíveis` 
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
          localDepartments.map((department) => (
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
